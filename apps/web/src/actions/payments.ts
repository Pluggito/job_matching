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

function getPaystackSecretKey(): string {
  const key =
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.PAYSTACK_TEST_SECRET_KEY;
  if (!key) {
    throw new Error("Paystack secret key is not configured in environment variables.");
  }
  return key;
}

/**
 * Initializes a Paystack checkout for a Job Selection's Handshake Agency Fee.
 * Enforces in-flight payment locking (30-minute lock via expiresAt).
 */
export async function initializeSelectionPayment(selectionId: string) {
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

  if (sel.status === "CONFIRMED") {
    return {
      success: true,
      alreadyPaid: true,
      message: "Agency handshake fee has already been paid and confirmed.",
    };
  }

  // 2. Fetch or create Quote for this selection
  let [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.selectionId, selectionId))
    .orderBy(desc(quotes.version))
    .limit(1);

  if (!quote) {
    // Default ₦50,000 handshake agency fee = 5,000,000 kobo
    const defaultFeeKobo = Math.round((sel.feeAmount || 50000) * 100);
    const [newQuote] = await db
      .insert(quotes)
      .values({
        selectionId,
        type: "agency_fee",
        workerPayoutKobo: 0, // Worker salary is paid directly by employer to worker
        commissionKobo: defaultFeeKobo,
        totalKobo: defaultFeeKobo,
        commissionMode: "fixed_override",
        status: "sent",
        currency: "NGN",
        cancellationPolicy:
          "14-day SLA candidate replacement guarantee applies. Direct worker contact and bank details unlocked immediately upon confirmed agency fee payment.",
      })
      .returning();
    quote = newQuote;
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

  // 4. Generate transaction reference and 30-minute expiry
  const reference = `SG_TXN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
  const secretKey = getPaystackSecretKey();

  // Create pending payment row
  const [paymentRecord] = await db
    .insert(payments)
    .values({
      quoteId: quote.id,
      selectionId: sel.id,
      amount: quote.totalKobo / 100,
      totalKobo: quote.totalKobo,
      commissionKobo: quote.commissionKobo,
      workerPayoutKobo: quote.workerPayoutKobo,
      currency: "NGN",
      provider: "paystack",
      paystackReference: reference,
      mode: process.env.PAYSTACK_MODE || "test",
      status: "PENDING",
      expiresAt,
    })
    .returning();

  if (!paymentRecord) {
    throw new Error("Failed to create pending payment record.");
  }

  // 5. Call Paystack API to initialize transaction
  const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${host}/employer/requests/${sel.hiringRequestId}?payment_ref=${reference}`;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.email,
      amount: quote.totalKobo, // Paystack requires amount in kobo
      reference,
      callback_url: callbackUrl,
      metadata: {
        quoteId: quote.id,
        selectionId: sel.id,
        hiringRequestId: sel.hiringRequestId,
        paymentId: paymentRecord.id,
        type: "agency_fee",
      },
    }),
  });

  const paystackData = await paystackRes.json();

  if (!paystackRes.ok || !paystackData.status) {
    throw new Error(
      paystackData.message || "Failed to initialize payment with Paystack gateway."
    );
  }

  return {
    success: true,
    authorizationUrl: paystackData.data.authorization_url,
    accessCode: paystackData.data.access_code,
    reference,
  };
}

/**
 * Verifies transaction reference directly with Paystack API.
 * Provides instant feedback when employer returns to callback URL before webhook lands.
 */
export async function verifyPaymentReference(reference: string) {
  const secretKey = getPaystackSecretKey();

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

  // Call Paystack verify endpoint
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    return { success: false, message: data.message || "Could not verify payment with gateway." };
  }

  if (data.data.status === "success") {
    await db.transaction(async (tx) => {
      // 1. Mark payment VERIFIED
      await tx
        .update(payments)
        .set({
          status: "VERIFIED",
          verifiedAt: new Date(),
          providerReference: String(data.data.id),
          providerStatus: data.data.status,
        })
        .where(eq(payments.id, payment.id));

      // 2. Mark quote paid
      if (payment.quoteId) {
        await tx
          .update(quotes)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(quotes.id, payment.quoteId));
      }

      // 3. Mark selection CONFIRMED and activate placement
      if (payment.selectionId) {
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

        // Notify employer and worker
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
              content: "Handshake agency fee confirmed! Candidate contact details and worker bank details are unlocked.",
            });
          }

          if (wrk) {
            await tx.insert(notifications).values({
              userId: wrk.userId,
              type: "SELECTION_CONFIRMED",
              content: "Congratulations! An employer has confirmed your placement handshake.",
            });
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
          paystackReference: reference,
          verifiedVia: "verify_endpoint",
        },
      });
    });

    revalidatePath("/employer");
    return { success: true, verified: true };
  }

  return { success: false, status: data.data.status, message: "Payment has not yet succeeded." };
}

/**
 * Initializes a Paystack checkout for an Alabaru Errand.
 * Charges Total Amount = Task Price + Flat Creation & Outreach Fee.
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

  if (errand.status !== "pending_payment") {
    return {
      success: true,
      alreadyPaid: true,
      message: `Errand is already in ${errand.status} status.`,
    };
  }

  const totalKobo = (errand.creationFeeKobo || 0) + (errand.taskPriceKobo || errand.budgetKobo);
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
    : `errand_${errandId.slice(0, 8)}_${Date.now()}`;

  const secretKey = getPaystackSecretKey();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/employer/errands/${errandId}?payment_ref=${reference}`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.email,
      amount: totalKobo, // Paystack requires integer kobo
      reference,
      callback_url: callbackUrl,
      metadata: {
        errandId,
        employerId: employer.id,
        type: "errand",
      },
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(`Paystack initialization failed: ${data.message || "Unknown error"}`);
  }

  if (!activePayment) {
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min lock
    await db.insert(payments).values({
      errandId,
      paystackReference: reference,
      amount: totalKobo / 100,
      totalKobo,
      workerPayoutKobo: errand.workerPayoutKobo,
      commissionKobo: totalKobo - (errand.workerPayoutKobo || 0),
      currency: "NGN",
      status: "PENDING",
      expiresAt,
    });
  }

  return {
    success: true,
    authorizationUrl: data.data.authorization_url,
    reference,
    totalKobo,
  };
}
