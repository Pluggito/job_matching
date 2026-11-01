"use server";

import {
  db,
  selections,
  quotes,
  payments,
  placements,
  paymentEvents,
  employerProfiles,
  workerProfiles,
  hiringRequests,
  notifications,
  errands,
  eq,
  and,
  desc,
  gt,
} from "@repo/db";
import { getCurrentUser } from "./auth";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { AGENCY_FEE_PER_WORKER, calculateMonnifyFee, calculatePaystackFee } from "@repo/shared";
import {
  initializeMonnifyTransaction,
  verifyMonnifyTransaction,
} from "@/server/services/monnify";
import { sendPushToUser } from "@/server/services/pushNotifications";

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Initializes a Monnify checkout for a Job Selection's Handshake Agency Fee.
 * Enforces in-flight payment locking (30-minute lock via expiresAt).
 */
export async function initializeSelectionPayment(
  selectionId: string,
  installmentMode: "full" | "half" = "full"
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    throw new Error("Unauthorized: Only employers can initiate agency fee payments.");
  }

  // 1. Fetch selection and verify employer ownership
  const [sel] = await db
    .select({
      id: selections.id,
      employerProfileId: selections.employerProfileId,
      workerProfileId: selections.workerProfileId,
      hiringRequestId: selections.hiringRequestId,
      status: selections.status,
      feeAmount: selections.feeAmount,
    })
    .from(selections)
    .where(eq(selections.id, selectionId))
    .limit(1);

  if (!sel) {
    throw new Error("Selection not found.");
  }

  const [employer] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer || employer.id !== sel.employerProfileId) {
    throw new Error("Unauthorized: You do not own this selection.");
  }

  const [existingVerifiedPayment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.selectionId, selectionId), eq(payments.status, "VERIFIED")))
    .limit(1);

  if (existingVerifiedPayment) {
    return {
      success: true,
      alreadyPaid: true,
      message: "Agency handshake fee has already been paid and confirmed.",
    };
  }

  const baseFeeNaira = installmentMode === "half" ? 25000 : 50000;
  const agencyFeeKobo = baseFeeNaira * 100;
  const monnifyCalc = calculateMonnifyFee(agencyFeeKobo);

  // Update selection feeAmount with base fee for this transaction
  await db
    .update(selections)
    .set({ feeAmount: baseFeeNaira })
    .where(eq(selections.id, selectionId));

  // 2. Fetch or create Quote for this selection
  let [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.selectionId, selectionId))
    .orderBy(desc(quotes.version))
    .limit(1);

  if (!quote) {
    const [newQuote] = await db
      .insert(quotes)
      .values({
        selectionId,
        type: "agency_fee",
        workerPayoutKobo: 0, // Worker salary is paid directly by employer to worker
        commissionKobo: agencyFeeKobo,
        totalKobo: monnifyCalc.totalKobo, // includes Monnify gateway charge (1.5% capped at ₦2,000)
        commissionMode: "fixed_override",
        status: "sent",
        currency: "NGN",
        cancellationPolicy:
          "14-day SLA candidate replacement guarantee applies. Direct worker contact and bank details unlocked immediately upon confirmed agency fee payment.",
      })
      .returning();
    quote = newQuote;
  } else if (quote.status !== "paid" && quote.totalKobo !== monnifyCalc.totalKobo) {
    // Automatically correct existing quote if it had an outdated fee calculation
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        commissionKobo: agencyFeeKobo,
        totalKobo: monnifyCalc.totalKobo,
      })
      .where(eq(quotes.id, quote.id))
      .returning();
    quote = updatedQuote;
  }

  if (!quote) {
    throw new Error("Failed to create or retrieve quote for selection.");
  }

  if (quote.status === "paid") {
    return {
      success: true,
      alreadyPaid: true,
      message: "Quote has already been marked as paid.",
    };
  }

  // 3. Check for active in-flight payment lock (expiresAt > NOW())
  const now = new Date();
  const [activePayment] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.quoteId, quote.id),
        eq(payments.status, "PENDING"),
        gt(payments.expiresAt, now)
      )
    )
    .limit(1);

  // If previous active payment has incorrect amount, invalidate it
  if (activePayment && activePayment.totalKobo !== monnifyCalc.totalKobo) {
    await db
      .update(payments)
      .set({
        status: "FAILED",
        manualReason: "Superseded by updated quote with Monnify fee",
      })
      .where(eq(payments.id, activePayment.id));
  }

  const canReuseActivePayment =
    activePayment && activePayment.totalKobo === monnifyCalc.totalKobo;

  // 4. Generate or reuse transaction reference and 30-minute expiry
  const reference = canReuseActivePayment
    ? activePayment.paystackReference
    : `SG_TXN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  let paymentRecord = canReuseActivePayment ? activePayment : undefined;

  if (!paymentRecord) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
    const [newPaymentRecord] = await db
      .insert(payments)
      .values({
        quoteId: quote.id,
        selectionId: sel.id,
        amount: quote.totalKobo / 100,
        totalKobo: quote.totalKobo,
        commissionKobo: quote.commissionKobo,
        workerPayoutKobo: quote.workerPayoutKobo,
        currency: "NGN",
        provider: "monnify",
        paystackReference: reference,
        mode: process.env.NODE_ENV === "production" ? "live" : "test",
        status: "PENDING",
        expiresAt,
      })
      .returning();
    paymentRecord = newPaymentRecord;
  }

  if (!paymentRecord) {
    throw new Error("Failed to create pending payment record.");
  }

  // 5. Initialize transaction with Monnify gateway
  const host = getAppBaseUrl();
  const callbackUrl = `${host}/employer/requests/${sel.hiringRequestId}/matches?payment_ref=${reference}`;

  const monnifyRes = await initializeMonnifyTransaction({
    amountNaira: quote.totalKobo / 100,
    customerName: employer.businessName || session.email || "Staff Guru Employer",
    customerEmail: session.email,
    paymentReference: reference,
    paymentDescription: `StaffGuru Handshake Fee - ${installmentMode === "half" ? "50% Initial Installment" : "Full Placement"}`,
    redirectUrl: callbackUrl,
    metaData: {
      quoteId: quote.id,
      selectionId: sel.id,
      hiringRequestId: sel.hiringRequestId,
      paymentId: paymentRecord.id,
      type: "agency_fee",
      installmentMode,
    },
  });

  return {
    success: true,
    authorizationUrl: monnifyRes.checkoutUrl,
    checkoutUrl: monnifyRes.checkoutUrl,
    reference,
  };
}

/**
 * Verifies transaction reference directly with Monnify API.
 * Provides instant feedback when employer returns to callback URL before webhook lands.
 */
export async function verifyPaymentReference(reference: string) {
  // Find payment by reference
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, reference))
    .limit(1);

  if (!payment) {
    throw new Error("Payment record not found for this reference.");
  }

  if (payment.status === "VERIFIED") {
    return { success: true, verified: true, message: "Payment already verified." };
  }

  // Call Monnify query endpoint
  const queryResult = await verifyMonnifyTransaction(reference);

  if (queryResult.paid) {
    await db.transaction(async (tx) => {
      // 1. Mark payment VERIFIED
      await tx
        .update(payments)
        .set({
          status: "VERIFIED",
          verifiedAt: new Date(),
          providerReference: queryResult.transactionReference || reference,
          providerStatus: queryResult.status,
        })
        .where(eq(payments.id, payment.id));

      // 2. Mark quote paid
      if (payment.quoteId) {
        await tx
          .update(quotes)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(quotes.id, payment.quoteId));
      }

      // 3. Selection status & placement activation
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
              const replacementDeadline = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
              await tx.insert(placements).values({
                selectionId: payment.selectionId,
                startDate,
                status: "ACTIVE",
                replacementDeadline,
              });
            }
          }

          // In-app notifications
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
            const empLink = `/employer/requests/${sel.hiringRequestId}/matches`;
            await tx.insert(notifications).values({
              userId: emp.userId,
              type: "SELECTION_CONFIRMED",
              title: "Agency Fee Verified! 💼",
              content: isAccepted
                ? "Handshake agency fee confirmed! Candidate direct contact details are now unlocked with our 14-day SLA guarantee."
                : "Payment verified via Monnify! Your offer is pending candidate acceptance.",
              link: empLink,
            });

            sendPushToUser(emp.userId, {
              title: "Agency Fee Verified! 💼",
              body: isAccepted
                ? "Handshake agency fee confirmed! Candidate direct contact details are now unlocked."
                : "Payment verified! Your offer is pending candidate acceptance.",
              url: empLink,
              tag: `selection-${sel.id}`,
            }).catch(console.error);
          }

          if (wrk) {
            const wrkLink = "/dashboard";
            await tx.insert(notifications).values({
              userId: wrk.userId,
              type: "SELECTION_CONFIRMED",
              title: isAccepted ? "Placement Confirmed! 🎉" : "Handshake Offer Funded! 💼",
              content: isAccepted
                ? "Congratulations! Your placement handshake is confirmed."
                : "Great news! An employer funded the placement fee for your handshake offer. Please review and accept on your dashboard to unlock direct contacts.",
              link: wrkLink,
            });

            sendPushToUser(wrk.userId, {
              title: isAccepted ? "Placement Confirmed! 🎉" : "Handshake Offer Funded! 💼",
              body: isAccepted
                ? "Congratulations! Your placement handshake is confirmed."
                : "Great news! An employer funded the placement fee for your handshake offer. Accept on your dashboard.",
              url: wrkLink,
              tag: `selection-${sel.id}`,
            }).catch(console.error);
          }
        }
      }

      // 3b. Errand activation if errand payment
      if (payment.errandId) {
        const [err] = await tx
          .select({
            id: errands.id,
            title: errands.title,
            employerId: errands.employerId,
            claimedByWorkerId: errands.claimedByWorkerId,
            status: errands.status,
          })
          .from(errands)
          .where(eq(errands.id, payment.errandId))
          .limit(1);

        if (err) {
          const nextStatus = err.claimedByWorkerId ? "in_progress" : "open";
          await tx
            .update(errands)
            .set({ status: nextStatus, updatedAt: new Date() })
            .where(eq(errands.id, payment.errandId));

          const [emp] = await tx
            .select({ userId: employerProfiles.userId })
            .from(employerProfiles)
            .where(eq(employerProfiles.id, err.employerId))
            .limit(1);

          if (emp) {
            const isDispatched = !!err.claimedByWorkerId;
            await tx.insert(notifications).values({
              userId: emp.userId,
              type: "SELECTION_CONFIRMED",
              title: isDispatched ? "Payment Confirmed · Runner Dispatched! 🚀" : "Errand Funded & Live! 🚀",
              content: isDispatched
                ? `Escrow payment confirmed for "${err.title}". Your runner has been dispatched to execute the task!`
                : `Your errand "${err.title}" is funded and broadcast to nearby runners.`,
              link: `/employer/errands/${payment.errandId}`,
            });

            sendPushToUser(emp.userId, {
              title: isDispatched ? "Payment Confirmed · Runner Dispatched! 🚀" : "Errand Funded & Live! 🚀",
              body: isDispatched
                ? `Escrow payment confirmed for "${err.title}". Your runner has been dispatched to execute the task!`
                : `Your errand "${err.title}" is funded and broadcast to nearby runners.`,
              url: `/employer/errands/${payment.errandId}`,
              tag: `errand-${payment.errandId}`,
            }).catch(console.error);
          }

          if (err.claimedByWorkerId) {
            const [worker] = await tx
              .select({ userId: workerProfiles.userId })
              .from(workerProfiles)
              .where(eq(workerProfiles.id, err.claimedByWorkerId))
              .limit(1);

            if (worker) {
              await tx.insert(notifications).values({
                userId: worker.userId,
                type: "ERRAND_CLAIMED",
                title: "Escrow Funded! 🚀",
                content: `The creator has funded "${err.title}". You may now begin execution.`,
                link: "/dashboard/errands",
              });

              sendPushToUser(worker.userId, {
                title: "Escrow Funded! 🚀",
                body: `The creator has funded "${err.title}". You may now begin execution.`,
                url: "/dashboard/errands",
                tag: `errand-worker-${err.id}`,
              }).catch(console.error);
            }
          }
        }
      }

      // 4. Record ledger event
      await tx.insert(paymentEvents).values({
        paymentId: payment.id,
        eventType: "COMMISSION_RETAINED",
        amountKobo: payment.totalKobo || Math.round(payment.amount * 100),
        actorType: "SYSTEM",
        metadata: {
          reference,
          monnifyTransactionReference: queryResult.transactionReference,
          verifiedVia: "verify_endpoint",
        },
      });
    });

    revalidatePath("/employer");
    return { success: true, verified: true };
  }

  return { success: false, status: queryResult.status, message: "Payment has not yet succeeded." };
}

/**
 * Initializes a Monnify checkout for an Alabaru Errand.
 * Charges Total Amount = Task Price + Flat Creation & Outreach Fee + Monnify fee (1.5% capped at ₦2,000).
 * Enforces in-flight payment locking (30-minute lock via expiresAt).
 */
export async function initializeErrandPayment(errandId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    throw new Error("Unauthorized: Only employers can fund errands.");
  }

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand) {
    throw new Error("Errand not found.");
  }

  const [employer] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer || employer.id !== errand.employerId) {
    throw new Error("Unauthorized: You do not own this errand.");
  }

  // Check if errand has already been funded
  const [existingVerifiedPayment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.errandId, errandId), eq(payments.status, "VERIFIED")))
    .limit(1);

  if (existingVerifiedPayment) {
    return {
      success: true,
      alreadyPaid: true,
      message: "Errand has already been funded.",
    };
  }

  // Allow payment when errand is claimed, pending_payment, or open
  if (errand.status !== "claimed" && errand.status !== "pending_payment" && errand.status !== "open") {
    return {
      success: true,
      alreadyPaid: true,
      message: `Errand is in ${errand.status} status and cannot be funded.`,
    };
  }

  const subtotalKobo = (errand.creationFeeKobo || 0) + (errand.taskPriceKobo || errand.budgetKobo);
  const monnifyCalc = calculateMonnifyFee(subtotalKobo);
  const totalKobo = monnifyCalc.totalKobo;
  const now = new Date();

  // In-flight payment lock: check active pending payment created in the last 30 minutes
  const [activePayment] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.errandId, errandId),
        eq(payments.status, "PENDING"),
        gt(payments.expiresAt, now)
      )
    )
    .limit(1);

  const reference = activePayment
    ? activePayment.paystackReference
    : `SG_ERRAND_${errandId.slice(0, 8)}_${Date.now()}`;

  const baseUrl = getAppBaseUrl();
  const callbackUrl = `${baseUrl}/employer/errands/${errandId}?payment_ref=${reference}`;

  const monnifyRes = await initializeMonnifyTransaction({
    amountNaira: totalKobo / 100,
    customerName: employer.businessName || session.email || "Staff Guru Employer",
    customerEmail: session.email,
    paymentReference: reference,
    paymentDescription: `StaffGuru Alabaru Errand Escrow: ${errand.title.slice(0, 50)}`,
    redirectUrl: callbackUrl,
    metaData: {
      errandId,
      employerId: employer.id,
      type: "errand",
    },
  });

  if (!activePayment) {
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min lock
    await db.insert(payments).values({
      errandId,
      provider: "monnify",
      paystackReference: reference,
      amount: totalKobo / 100,
      totalKobo,
      workerPayoutKobo: errand.workerPayoutKobo,
      commissionKobo: totalKobo - (errand.workerPayoutKobo || 0),
      currency: "NGN",
      mode: process.env.NODE_ENV === "production" ? "live" : "test",
      status: "PENDING",
      expiresAt,
    });
  }

  return {
    success: true,
    authorizationUrl: monnifyRes.checkoutUrl,
    checkoutUrl: monnifyRes.checkoutUrl,
    reference,
    totalKobo,
  };
}
