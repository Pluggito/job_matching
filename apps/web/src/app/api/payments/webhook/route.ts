import {
  db,
  payments,
  quotes,
  selections,
  placements,
  paymentEvents,
  webhookEvents,
  employerProfiles,
  workerProfiles,
  errands,
  notifications,
  eq,
} from "@repo/db";
import {
  computeMonnifyTransactionHash,
  verifyMonnifyWebhookSignature,
} from "@repo/shared";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const monnifySignature = req.headers.get("monnify-signature");
    const paystackSignature = req.headers.get("x-paystack-signature");

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    // ==========================================
    // 1. MONNIFY WEBHOOK HANDLING
    // ==========================================
    const isMonnifyWebhook =
      Boolean(monnifySignature) ||
      parsedPayload.eventType === "SUCCESSFUL_TRANSACTION" ||
      Boolean(parsedPayload.eventData?.transactionReference);

    if (isMonnifyWebhook) {
      const monnifySecret = (process.env.MONNIFY_SECRET_KEY || "").trim();
      if (!monnifySecret) {
        console.error("[Monnify Webhook] Missing MONNIFY_SECRET_KEY in environment");
        return new Response("Webhook secret misconfigured", { status: 500 });
      }

      const eventType = parsedPayload.eventType;
      const eventData = parsedPayload.eventData || {};
      const {
        paymentReference,
        transactionReference,
        amountPaid,
        paidOn,
        paymentStatus,
        transactionHash,
      } = eventData;

      // Verify signature or transaction hash
      let isValid = false;
      if (monnifySignature) {
        isValid = verifyMonnifyWebhookSignature({
          rawBody,
          signatureHeader: monnifySignature,
          secretKey: monnifySecret,
        });
      }

      if (!isValid && transactionHash && paymentReference && amountPaid && paidOn && transactionReference) {
        const computed = computeMonnifyTransactionHash({
          clientSecret: monnifySecret,
          paymentReference,
          amountPaid,
          paidOn,
          transactionReference,
        });
        isValid = verifyMonnifyWebhookSignature({
          transactionHash,
          computedHash: computed,
          secretKey: monnifySecret,
        });
      }

      if (!isValid) {
        console.warn("[Monnify Webhook] Invalid signature or transaction hash verification failed");
        return new Response("Invalid signature", { status: 400 });
      }

      // Idempotency check via webhookEvents
      const eventId = `monnify_${eventType}_${transactionReference || paymentReference || Date.now()}`;
      const [existingEvent] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.eventId, eventId))
        .limit(1);

      if (existingEvent && existingEvent.status === "processed") {
        return Response.json({ received: true, duplicate: true }, { status: 200 });
      }

      if (!existingEvent) {
        await db
          .insert(webhookEvents)
          .values({
            eventId,
            eventType: eventType || "SUCCESSFUL_TRANSACTION",
            provider: "monnify",
            payload: parsedPayload,
            status: "pending",
          })
          .onConflictDoNothing();
      }

      // Process successful payment
      if (eventType === "SUCCESSFUL_TRANSACTION" && paymentReference) {
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.paystackReference, paymentReference))
          .limit(1);

        if (payment) {
          if (payment.status === "VERIFIED") {
            return Response.json({ received: true, alreadyVerified: true }, { status: 200 });
          }

          const expectedAmountKobo = payment.totalKobo ?? Math.round(payment.amount * 100);
          const receivedAmountKobo = Math.round(Number(amountPaid) * 100);

          if (receivedAmountKobo !== expectedAmountKobo) {
            await db
              .update(payments)
              .set({
                status: "FAILED",
                refundStatus: "PENDING",
                refundAmountKobo: receivedAmountKobo,
                refundReason: `Amount mismatch: expected ${expectedAmountKobo} kobo, received ${receivedAmountKobo} kobo`,
                manualReason: `Amount mismatch: expected ${expectedAmountKobo} kobo, received ${receivedAmountKobo} kobo`,
                providerReference: transactionReference,
                providerStatus: paymentStatus,
              })
              .where(eq(payments.id, payment.id));

            await db.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "REFUNDED_TO_EMPLOYER",
              amountKobo: receivedAmountKobo,
              actorType: "SYSTEM",
              metadata: {
                reason: "Amount mismatch against Monnify payment record",
                expectedKobo: expectedAmountKobo,
                receivedKobo: receivedAmountKobo,
              },
            });

            await db
              .update(webhookEvents)
              .set({
                status: "processed",
                processedAt: new Date(),
                error: `Amount mismatch: expected ${expectedAmountKobo}, received ${receivedAmountKobo}`,
              })
              .where(eq(webhookEvents.eventId, eventId));

            return Response.json({ received: true, error: "Amount mismatch; flagged for refund" }, { status: 200 });
          }

          // Check superseded or cancelled quotes
          if (payment.quoteId) {
            const [quote] = await db
              .select({ id: quotes.id, status: quotes.status })
              .from(quotes)
              .where(eq(quotes.id, payment.quoteId))
              .limit(1);

            if (!quote || quote.status === "superseded" || quote.status === "cancelled" || quote.status === "paid") {
              await db
                .update(payments)
                .set({
                  status: "FAILED",
                  refundStatus: "PENDING",
                  refundAmountKobo: receivedAmountKobo,
                  refundReason: !quote ? "Quote not found" : `Quote is ${quote.status}; flagged for refund`,
                  providerReference: transactionReference,
                  providerStatus: paymentStatus,
                })
                .where(eq(payments.id, payment.id));

              return Response.json({ received: true, flaggedForRefund: true }, { status: 200 });
            }
          }

          await db.transaction(async (tx) => {
            // 1. Mark payment VERIFIED
            await tx
              .update(payments)
              .set({
                status: "VERIFIED",
                verifiedAt: new Date(),
                providerReference: transactionReference,
                providerStatus: paymentStatus,
              })
              .where(eq(payments.id, payment.id));

            // 2. Mark quote paid
            if (payment.quoteId) {
              await tx
                .update(quotes)
                .set({ status: "paid", updatedAt: new Date() })
                .where(eq(quotes.id, payment.quoteId));
            }

            // 3. For errands: open errand and initiate 24h unclaimed window
            if (payment.errandId) {
              const [targetErrand] = await tx
                .select()
                .from(errands)
                .where(eq(errands.id, payment.errandId))
                .limit(1);

              if (targetErrand) {
                const now = new Date();
                const nextStatus = targetErrand.claimedByWorkerId ? "in_progress" : "open";
                const deadlineMs = targetErrand.deadline.getTime();
                const windowExpiryMs = now.getTime() + 24 * 60 * 60 * 1000;
                const unclaimedExpiresAt = new Date(Math.min(windowExpiryMs, deadlineMs));

                await tx
                  .update(errands)
                  .set({
                    status: nextStatus,
                    openedAt: targetErrand.openedAt || now,
                    unclaimedExpiresAt: nextStatus === "open" ? unclaimedExpiresAt : targetErrand.unclaimedExpiresAt,
                    updatedAt: now,
                  })
                  .where(eq(errands.id, payment.errandId));

                // Notify employer
                const [emp] = await tx
                  .select({ userId: employerProfiles.userId })
                  .from(employerProfiles)
                  .where(eq(employerProfiles.id, targetErrand.employerId))
                  .limit(1);

                if (emp) {
                  const isDispatched = !!targetErrand.claimedByWorkerId;
                  await tx.insert(notifications).values({
                    userId: emp.userId,
                    type: "ERRAND_OPENED",
                    title: isDispatched ? "Payment Confirmed · Runner Dispatched! 🚀" : "Errand Funded & Live! 🚀",
                    content: isDispatched
                      ? `Escrow payment confirmed for "${targetErrand.title}". Your runner has been dispatched to execute the task!`
                      : `Your errand "${targetErrand.title}" is funded and live! Matching verified runners can now claim it.`,
                    link: `/employer/errands/${payment.errandId}`,
                  });
                }

                if (targetErrand.claimedByWorkerId) {
                  const [worker] = await tx
                    .select({ userId: workerProfiles.userId })
                    .from(workerProfiles)
                    .where(eq(workerProfiles.id, targetErrand.claimedByWorkerId))
                    .limit(1);

                  if (worker) {
                    await tx.insert(notifications).values({
                      userId: worker.userId,
                      type: "ERRAND_CLAIMED",
                      title: "Escrow Funded! 🚀",
                      content: `The creator has funded "${targetErrand.title}". You may now begin execution.`,
                      link: "/dashboard/errands",
                    });
                  }
                }
              }
            }

            // 4. For job selections: confirm selection and activate placement
            if (payment.selectionId) {
              const [sel] = await tx
                .select({
                  id: selections.id,
                  employerProfileId: selections.employerProfileId,
                  workerProfileId: selections.workerProfileId,
                  status: selections.status,
                  termsAcceptedAt: selections.termsAcceptedAt,
                  hiringRequestId: selections.hiringRequestId,
                })
                .from(selections)
                .where(eq(selections.id, payment.selectionId))
                .limit(1);

              if (sel) {
                const isAccepted = !!sel.termsAcceptedAt;

                if (isAccepted) {
                  await tx
                    .update(selections)
                    .set({ status: "CONFIRMED" })
                    .where(eq(selections.id, payment.selectionId));

                  const [existingPlacement] = await tx
                    .select()
                    .from(placements)
                    .where(eq(placements.selectionId, payment.selectionId))
                    .limit(1);

                  if (!existingPlacement) {
                    const startDate = new Date();
                    const replacementDeadline = new Date(
                      startDate.getTime() + 14 * 24 * 60 * 60 * 1000
                    );
                    await tx.insert(placements).values({
                      selectionId: payment.selectionId,
                      startDate,
                      status: "ACTIVE",
                      replacementDeadline,
                    });
                  }
                }

                const [emp] = await tx
                  .select({ userId: employerProfiles.userId })
                  .from(employerProfiles)
                  .where(eq(employerProfiles.id, sel.employerProfileId))
                  .limit(1);

                const [wrk] = await tx
                  .select({ userId: workerProfiles.userId })
                  .from(workerProfiles)
                  .where(eq(workerProfiles.id, sel.workerProfileId))
                  .limit(1);

                if (emp) {
                  await tx.insert(notifications).values({
                    userId: emp.userId,
                    type: "SELECTION_CONFIRMED",
                    content: isAccepted
                      ? "Handshake agency fee confirmed! Candidate direct phone number is now accessible with our 14-day SLA guarantee."
                      : "Payment verified via Monnify! Your offer is pending candidate acceptance.",
                  });
                }

                if (wrk) {
                  await tx.insert(notifications).values({
                    userId: wrk.userId,
                    type: "SELECTION_CONFIRMED",
                    content: isAccepted
                      ? "Congratulations! Your placement handshake is confirmed."
                      : "Great news! An employer funded the placement fee for your handshake offer. Please review and accept on your dashboard to unlock direct contacts.",
                  });
                }
              }
            }

            // 5. Record financial event
            await tx.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "COMMISSION_RETAINED",
              amountKobo: expectedAmountKobo,
              actorType: "SYSTEM",
              metadata: {
                reference: paymentReference,
                transactionReference,
                channel: eventData.paymentMethod,
                provider: "monnify",
              },
            });

            // 6. Mark webhook event processed
            await tx
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date() })
              .where(eq(webhookEvents.eventId, eventId));
          });

          return Response.json({ received: true, verified: true }, { status: 200 });
        }
      }

      return Response.json({ received: true }, { status: 200 });
    }

    // ==========================================
    // 2. LEGACY PAYSTACK WEBHOOK HANDLING (Fallback)
    // ==========================================
    if (paystackSignature) {
      const secret =
        process.env.PAYSTACK_SECRET_KEY ||
        process.env.PAYSTACK_TEST_SECRET_KEY;

      if (!secret) {
        return new Response("Paystack webhook secret misconfigured", { status: 500 });
      }

      const computedHash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

      const hashBuffer = Buffer.from(computedHash);
      const signatureBuffer = Buffer.from(paystackSignature);

      if (
        hashBuffer.length !== signatureBuffer.length ||
        !crypto.timingSafeEqual(hashBuffer, signatureBuffer)
      ) {
        return new Response("Invalid signature", { status: 400 });
      }

      const event = parsedPayload;
      const eventType = event.event;
      const data = event.data || {};
      const reference = data.reference;

      const eventId = `paystack_${eventType}_${data.id || reference || Date.now()}`;
      const [existingEvent] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.eventId, eventId))
        .limit(1);

      if (existingEvent && existingEvent.status === "processed") {
        return Response.json({ received: true, duplicate: true }, { status: 200 });
      }

      if (!existingEvent) {
        await db
          .insert(webhookEvents)
          .values({
            eventId,
            eventType,
            provider: "paystack",
            payload: event,
            status: "pending",
          })
          .onConflictDoNothing();
      }

      if (eventType === "charge.success" && reference) {
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.paystackReference, reference))
          .limit(1);

        if (payment && payment.status !== "VERIFIED") {
          await db.transaction(async (tx) => {
            await tx
              .update(payments)
              .set({
                status: "VERIFIED",
                verifiedAt: new Date(),
                providerReference: String(data.id),
                providerStatus: data.status,
              })
              .where(eq(payments.id, payment.id));

            if (payment.quoteId) {
              await tx
                .update(quotes)
                .set({ status: "paid", updatedAt: new Date() })
                .where(eq(quotes.id, payment.quoteId));
            }

            await tx.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "COMMISSION_RETAINED",
              amountKobo: payment.totalKobo || Math.round(payment.amount * 100),
              actorType: "SYSTEM",
              metadata: { paystackReference: reference, provider: "paystack" },
            });

            await tx
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date() })
              .where(eq(webhookEvents.eventId, eventId));
          });
        }
      }

      return Response.json({ received: true }, { status: 200 });
    }

    return new Response("Unrecognized webhook provider signature", { status: 400 });
  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return new Response(`Webhook handler error: ${error?.message || "Internal error"}`, {
      status: 500,
    });
  }
}

export async function GET() {
  return Response.json(
    {
      status: "healthy",
      service: "StaffGuru Monnify & Payment Webhook Listener",
      timestamp: new Date().toISOString(),
      acceptedMethods: ["POST"],
      documentation: "Configured for Monnify Webhooks and legacy Paystack Webhooks",
    },
    { status: 200 }
  );
}
