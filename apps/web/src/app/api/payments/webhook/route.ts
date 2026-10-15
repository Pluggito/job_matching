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
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret =
      process.env.PAYSTACK_SECRET_KEY ||
      process.env.PAYSTACK_TEST_SECRET_KEY;

    if (!secret) {
      console.error("[Paystack Webhook] Missing PAYSTACK_SECRET_KEY in environment");
      return new Response("Webhook secret misconfigured", { status: 500 });
    }

    if (!signature) {
      console.warn("[Paystack Webhook] Missing x-paystack-signature header");
      return new Response("Missing signature", { status: 401 });
    }

    // Verify HMAC-SHA512 signature using timingSafeEqual
    const computedHash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const hashBuffer = Buffer.from(computedHash);
    const signatureBuffer = Buffer.from(signature);

    if (
      hashBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, signatureBuffer)
    ) {
      console.warn("[Paystack Webhook] Invalid HMAC-SHA512 signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const data = event.data || {};
    const reference = data.reference;

    // Idempotency: Unique event identifier
    const eventId = `paystack_${eventType}_${data.id || reference || Date.now()}`;

    // Check if event has already been processed
    const [existingEvent] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    if (existingEvent && existingEvent.status === "processed") {
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }

    // Record webhook event in ledger
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

    // Process charge.success
    if (eventType === "charge.success" && reference) {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.paystackReference, reference))
        .limit(1);

      if (payment) {
        // Idempotency check: already verified
        if (payment.status === "VERIFIED") {
          return Response.json({ received: true, alreadyVerified: true }, { status: 200 });
        }

        const isLatePayment = payment.expiresAt && payment.expiresAt < new Date();

        // Verify amount stored on payment row, not current settings
        const expectedAmountKobo = payment.totalKobo ?? Math.round(payment.amount * 100);
        if (typeof data.amount === "number" && data.amount !== expectedAmountKobo) {
          await db
            .update(payments)
            .set({
              status: "FAILED",
              refundStatus: "PENDING",
              refundAmountKobo: data.amount,
              refundReason: `Amount mismatch: expected ${expectedAmountKobo} kobo, received ${data.amount} kobo`,
              manualReason: `Amount mismatch: expected ${expectedAmountKobo} kobo, received ${data.amount} kobo`,
              providerReference: String(data.id),
              providerStatus: data.status,
            })
            .where(eq(payments.id, payment.id));

          await db.insert(paymentEvents).values({
            paymentId: payment.id,
            eventType: "REFUNDED_TO_EMPLOYER",
            amountKobo: data.amount,
            actorType: "SYSTEM",
            metadata: {
              reason: "Amount mismatch against payment record",
              expectedKobo: expectedAmountKobo,
              receivedKobo: data.amount,
            },
          });

          await db
            .update(webhookEvents)
            .set({
              status: "processed",
              processedAt: new Date(),
              error: `Amount mismatch: expected ${expectedAmountKobo}, received ${data.amount}`,
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
                refundAmountKobo: data.amount,
                refundReason: !quote ? "Quote not found" : `Quote is ${quote.status}; flagged for refund`,
                manualReason: `Quote is '${quote?.status ?? "missing"}'; requires refund`,
                providerReference: String(data.id),
                providerStatus: data.status,
              })
              .where(eq(payments.id, payment.id));

            await db.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "REFUNDED_TO_EMPLOYER",
              amountKobo: data.amount,
              actorType: "SYSTEM",
              metadata: { reason: "Quote superseded, cancelled or already paid", quoteId: payment.quoteId },
            });

            await db
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date(), error: `Quote is ${quote?.status}` })
              .where(eq(webhookEvents.eventId, eventId));

            return Response.json({ received: true, flaggedForRefund: true }, { status: 200 });
          }
        }

        // Check cancelled or already confirmed selections
        if (payment.selectionId) {
          const [sel] = await db
            .select({ status: selections.status })
            .from(selections)
            .where(eq(selections.id, payment.selectionId))
            .limit(1);

          if (!sel || sel.status === "CANCELLED" || sel.status === "CONFIRMED") {
            await db
              .update(payments)
              .set({
                status: "FAILED",
                refundStatus: "PENDING",
                refundAmountKobo: data.amount,
                refundReason: !sel ? "Selection not found" : `Selection is ${sel.status}; flagged for refund`,
                manualReason: `Selection is '${sel?.status ?? "missing"}'; requires refund`,
                providerReference: String(data.id),
                providerStatus: data.status,
              })
              .where(eq(payments.id, payment.id));

            await db.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "REFUNDED_TO_EMPLOYER",
              amountKobo: data.amount,
              actorType: "SYSTEM",
              metadata: { reason: "Selection cancelled or already confirmed", selectionId: payment.selectionId },
            });

            await db
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date(), error: `Selection is ${sel?.status}` })
              .where(eq(webhookEvents.eventId, eventId));

            return Response.json({ received: true, flaggedForRefund: true }, { status: 200 });
          }
        }

        // Check if errand target has been cancelled
        if (payment.errandId) {
          const [errandRecord] = await db
            .select({ id: errands.id, status: errands.status })
            .from(errands)
            .where(eq(errands.id, payment.errandId))
            .limit(1);

          if (errandRecord && errandRecord.status !== "pending_payment" && errandRecord.status !== "open") {
            await db
              .update(payments)
              .set({
                status: "FAILED",
                refundStatus: "PENDING",
                refundAmountKobo: data.amount,
                refundReason: `Errand is in ${errandRecord.status} state, charge flagged for refund`,
                providerReference: String(data.id),
                providerStatus: data.status,
              })
              .where(eq(payments.id, payment.id));

            await db.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "REFUNDED_TO_EMPLOYER",
              amountKobo: data.amount,
              actorType: "SYSTEM",
              metadata: { reason: `Errand is in ${errandRecord.status} state`, errandId: payment.errandId },
            });

            await db
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date(), error: `Errand is ${errandRecord.status}` })
              .where(eq(webhookEvents.eventId, eventId));

            return Response.json({ received: true, flaggedForRefund: true }, { status: 200 });
          }
        }

        try {
          await db.transaction(async (tx) => {
            // 1. Mark payment VERIFIED
            await tx
              .update(payments)
              .set({
                status: "VERIFIED",
                verifiedAt: new Date(),
                providerReference: String(data.id),
                providerStatus: data.status,
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
                const deadlineMs = targetErrand.deadline.getTime();
                const windowExpiryMs = now.getTime() + 24 * 60 * 60 * 1000;
                const unclaimedExpiresAt = new Date(Math.min(windowExpiryMs, deadlineMs));

                await tx
                  .update(errands)
                  .set({
                    status: "open",
                    openedAt: now,
                    unclaimedExpiresAt,
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
                  await tx.insert(notifications).values({
                    userId: emp.userId,
                    type: "ERRAND_OPENED",
                    content: `Your errand "${targetErrand.title}" is funded and live! Matching verified runners can now claim it.`,
                  });
                }
              }
            }

            // 4. For job selections: confirm selection and activate placement
            if (payment.selectionId) {
              await tx
                .update(selections)
                .set({ status: "CONFIRMED" })
                .where(eq(selections.id, payment.selectionId));

              // Create 14-day SLA active placement
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

              // Send in-app notifications
              const [sel] = await tx
                .select({
                  employerProfileId: selections.employerProfileId,
                  workerProfileId: selections.workerProfileId,
                })
                .from(selections)
                .where(eq(selections.id, payment.selectionId))
                .limit(1);

              if (sel) {
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
                    content:
                      "Handshake agency fee confirmed! Candidate direct phone number is now accessible with our 14-day SLA guarantee.",
                  });
                }

                if (wrk) {
                  await tx.insert(notifications).values({
                    userId: wrk.userId,
                    type: "SELECTION_CONFIRMED",
                    content:
                      "Congratulations! An employer has confirmed your placement handshake and unlocked your phone number.",
                  });
                }
              }
            }

            // 4. Record financial event
            await tx.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "COMMISSION_RETAINED",
              amountKobo: payment.totalKobo || Math.round(payment.amount * 100),
              actorType: "SYSTEM",
              metadata: {
                paystackReference: reference,
                paystackId: data.id,
                channel: data.channel,
                gatewayResponse: data.gateway_response,
              },
            });

            // 5. Mark webhook event as processed
            await tx
              .update(webhookEvents)
              .set({ status: "processed", processedAt: new Date() })
              .where(eq(webhookEvents.eventId, eventId));
          });
        } catch (txError: any) {
          const isUniqueViolation =
            txError?.code === "23505" ||
            String(txError?.message || "").includes("payments_verified_");

          if (isUniqueViolation) {
            await db
              .update(payments)
              .set({
                status: "FAILED",
                refundStatus: "PENDING",
                refundAmountKobo: data.amount,
                refundReason: "Duplicate verified payment detected via unique index; flagged for refund",
                manualReason: "Duplicate verified payment detected; requires refund",
                providerReference: String(data.id),
                providerStatus: data.status,
              })
              .where(eq(payments.id, payment.id));

            await db.insert(paymentEvents).values({
              paymentId: payment.id,
              eventType: "REFUNDED_TO_EMPLOYER",
              amountKobo: data.amount,
              actorType: "SYSTEM",
              metadata: {
                reason: "Duplicate verified payment (unique constraint violation)",
                error: txError?.message,
              },
            });

            await db
              .update(webhookEvents)
              .set({
                status: "processed",
                processedAt: new Date(),
                error: "Duplicate payment unique violation; flagged for refund",
              })
              .where(eq(webhookEvents.eventId, eventId));

            return Response.json({ received: true, duplicateFlaggedForRefund: true }, { status: 200 });
          }

          throw txError;
        }
      }
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Paystack Webhook Error]:", error);
    return new Response(`Webhook handler error: ${error?.message || "Internal error"}`, {
      status: 500,
    });
  }
}

export async function GET() {
  return Response.json(
    {
      status: "healthy",
      service: "StaffGuru Paystack Webhook Listener",
      timestamp: new Date().toISOString(),
      acceptedMethods: ["POST"],
      documentation: "Configured for Paystack Test and Live Webhooks",
    },
    { status: 200 }
  );
}

