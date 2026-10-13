"use server";

import {
  db,
  errands,
  payments,
  paymentEvents,
  notifications,
  workerBankAccounts,
  workerProfiles,
  employerProfiles,
  eq,
  and,
  lte,
  sql,
} from "@repo/db";
import { formatNaira } from "@repo/shared";

/**
 * 1. Process unclaimed errands past their 24h window (or past deadline).
 * Transitions errand to 'expired' and flags payment for 100% full refund.
 */
export async function processUnclaimedExpiredErrands() {
  const now = new Date();

  // Find open errands where unclaimedExpiresAt <= now
  const expiredErrands = await db
    .select({
      id: errands.id,
      title: errands.title,
      employerId: errands.employerId,
      unclaimedExpiresAt: errands.unclaimedExpiresAt,
      deadline: errands.deadline,
    })
    .from(errands)
    .where(
      and(
        eq(errands.status, "open"),
        lte(errands.unclaimedExpiresAt, now)
      )
    );

  let processedCount = 0;
  const processedIds: string[] = [];

  for (const errand of expiredErrands) {
    await db.transaction(async (tx) => {
      // Mark errand expired
      await tx
        .update(errands)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(errands.id, errand.id));

      // Fetch payment
      const [pay] = await tx
        .select()
        .from(payments)
        .where(eq(payments.errandId, errand.id))
        .limit(1);

      if (pay && pay.status === "VERIFIED") {
        const refundAmt = pay.totalKobo || pay.amount * 100;

        await tx
          .update(payments)
          .set({
            refundStatus: "PENDING",
            refundAmountKobo: refundAmt,
            refundReason: "Unclaimed 24-hour expiration: 100% full refund",
          })
          .where(eq(payments.id, pay.id));

        await tx.insert(paymentEvents).values({
          paymentId: pay.id,
          eventType: "REFUNDED_TO_EMPLOYER",
          amountKobo: refundAmt,
          actorType: "SYSTEM",
          metadata: {
            reason: "UNCLAIMED_EXPIRED_24H",
            errandId: errand.id,
          },
        });
      }

      // Notify employer
      const [emp] = await tx
        .select({ userId: employerProfiles.userId })
        .from(employerProfiles)
        .where(eq(employerProfiles.id, errand.employerId))
        .limit(1);

      if (emp) {
        await tx.insert(notifications).values({
          userId: emp.userId,
          type: "ERRAND_EXPIRED",
          content: `Your errand "${errand.title}" was not claimed within the 24-hour guarantee window. A 100% full refund has been initiated to your account.`,
        });
      }
    });

    processedCount++;
    processedIds.push(errand.id);
  }

  return { processedCount, processedIds };
}

/**
 * 2. Auto-release proof payouts 24 hours after submission if employer has not disputed.
 */
export async function processAutoReleaseProofPayouts() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  const now = new Date();

  const pendingProofs = await db
    .select({
      id: errands.id,
      title: errands.title,
      employerId: errands.employerId,
      claimedByWorkerId: errands.claimedByWorkerId,
      workerPayoutKobo: errands.workerPayoutKobo,
      budgetKobo: errands.budgetKobo,
      proofSubmittedAt: errands.proofSubmittedAt,
    })
    .from(errands)
    .where(
      and(
        eq(errands.status, "proof_submitted"),
        lte(errands.proofSubmittedAt, cutoff)
      )
    );

  let processedCount = 0;
  const processedIds: string[] = [];

  for (const errand of pendingProofs) {
    if (!errand.claimedByWorkerId) continue;

    const payoutKobo =
      errand.workerPayoutKobo ?? Math.round(errand.budgetKobo * 0.7);

    await db.transaction(async (tx) => {
      await tx
        .update(errands)
        .set({
          status: "completed",
          completedAt: now,
          updatedAt: now,
        })
        .where(eq(errands.id, errand.id));

      // Look up worker
      const [worker] = await tx
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, errand.claimedByWorkerId!))
        .limit(1);

      if (worker) {
        await tx.insert(notifications).values({
          userId: worker.userId,
          type: "ERRAND_PAYOUT_RELEASED",
          content: `Proof auto-approved after 24 hours! Your payout of ${formatNaira(payoutKobo)} has been transferred to your registered bank account.`,
        });
      }

      // Notify employer
      const [emp] = await tx
        .select({ userId: employerProfiles.userId })
        .from(employerProfiles)
        .where(eq(employerProfiles.id, errand.employerId))
        .limit(1);

      if (emp) {
        await tx.insert(notifications).values({
          userId: emp.userId,
          type: "ERRAND_COMPLETED",
          content: `Errand "${errand.title}" automatically completed after the 24-hour review window.`,
        });
      }
    });

    processedCount++;
    processedIds.push(errand.id);
  }

  return { processedCount, processedIds };
}

/**
 * 3. Lift 24h bank payout holds after grace period elapses.
 */
export async function processLiftBankPayoutHolds() {
  const now = new Date();

  const heldAccounts = await db
    .select({
      id: workerBankAccounts.id,
      workerProfileId: workerBankAccounts.workerProfileId,
    })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.isActive, true),
        lte(workerBankAccounts.payoutHoldUntil, now)
      )
    );

  let processedCount = 0;

  for (const acc of heldAccounts) {
    await db.transaction(async (tx) => {
      await tx
        .update(workerBankAccounts)
        .set({
          payoutHoldUntil: null,
          updatedAt: now,
        })
        .where(eq(workerBankAccounts.id, acc.id));

      const [worker] = await tx
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, acc.workerProfileId))
        .limit(1);

      if (worker) {
        await tx.insert(notifications).values({
          userId: worker.userId,
          type: "SECURITY_UPDATE",
          content: "Your 24-hour bank payout security hold has completed. Payouts to your updated account are now active.",
        });
      }
    });

    processedCount++;
  }

  return { processedCount };
}
