"use server";

import {
  db,
  errands,
  errandProofs,
  errandDisputes,
  errandThreads,
  errandMessages,
  employerProfiles,
  workerProfiles,
  workerBankAccounts,
  platformSettings,
  payments,
  paymentEvents,
  notifications,
  users,
  eq,
  and,
  desc,
  sql,
  inArray,
} from "@repo/db";
import {
  validateErrandDeadline,
  calculateErrandPricingBreakdown,
  formatNaira,
} from "@repo/shared";
import { getCurrentUser } from "./auth";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const SECRET_SALT = process.env.JWT_SECRET || "staffguru_errand_secure_salt_2026";

function computePinHmac(pin: string, errandId: string): string {
  return crypto
    .createHmac("sha256", SECRET_SALT)
    .update(`${pin.trim()}:${errandId}`)
    .digest("hex");
}

export interface ErrandPricingStatus {
  isOpen: boolean;
  creationFeeKobo: number;
  commissionBps: number;
  minPriceKobo: number;
  maxPriceKobo: number;
}

/**
 * Checks platform errand pricing configuration and permissible bounds.
 */
export async function getErrandPricingStatus(): Promise<ErrandPricingStatus> {
  const rows = await db
    .select({ key: platformSettings.key, value: platformSettings.value })
    .from(platformSettings)
    .where(
      inArray(platformSettings.key, [
        "errand_creation_fee_kobo",
        "errand_commission_global",
        "errand_price_min_kobo",
        "errand_price_max_kobo",
      ])
    );

  const map = new Map<string, any>();
  for (const r of rows) {
    map.set(r.key, r.value);
  }

  const creationFeeObj = map.get("errand_creation_fee_kobo") as { kobo?: number | null } | undefined;
  const creationFeeKobo = typeof creationFeeObj?.kobo === "number" ? creationFeeObj.kobo : 0;

  const commissionObj = map.get("errand_commission_global") as { basisPoints?: number } | undefined;
  const commissionBps = typeof commissionObj?.basisPoints === "number" ? commissionObj.basisPoints : 3000;

  const minObj = map.get("errand_price_min_kobo") as { kobo?: number } | undefined;
  const minPriceKobo = typeof minObj?.kobo === "number" ? minObj.kobo : 500_000;

  const maxObj = map.get("errand_price_max_kobo") as { kobo?: number } | undefined;
  const maxPriceKobo = typeof maxObj?.kobo === "number" ? maxObj.kobo : 100_000_000;

  return {
    isOpen: true,
    creationFeeKobo,
    commissionBps,
    minPriceKobo,
    maxPriceKobo,
  };
}

export interface CreateErrandInput {
  title: string;
  type: "site_inspection" | "pickup_delivery" | "queue_document" | "purchase" | "supervision";
  description: string;
  locationState: string;
  locationArea: string;
  address: string;
  dropoffAddress?: string;
  deadline: string; // ISO string
  requiredProof: string;
  itemDeclaration?: string;
  prohibitedItemsAcknowledged: boolean;
  budgetNaira: number;
}

/**
 * Creates an Alabaru Errand with employer-set task price, platform creation fee, and commission snapshot.
 */
export async function createErrand(input: CreateErrandInput) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Only registered employers can post errands." };
  }

  const [employer] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) {
    return { success: false, error: "Please complete your employer profile first." };
  }

  const pricingStatus = await getErrandPricingStatus();

  // Validate employer-chosen task reward
  const budgetNaira = input.budgetNaira;
  if (typeof budgetNaira !== "number" || isNaN(budgetNaira) || budgetNaira <= 0) {
    return { success: false, error: "Please enter a valid task reward amount in Naira." };
  }

  const taskPriceKobo = Math.round(budgetNaira * 100);
  if (taskPriceKobo < pricingStatus.minPriceKobo) {
    return {
      success: false,
      error: `Errand task price must be at least ${formatNaira(pricingStatus.minPriceKobo)} to ensure fair runner pay.`,
    };
  }

  if (taskPriceKobo > pricingStatus.maxPriceKobo) {
    return {
      success: false,
      error: `Errand task price cannot exceed ${formatNaira(pricingStatus.maxPriceKobo)}.`,
    };
  }

  // Validate deadline
  const deadlineDate = new Date(input.deadline);
  const deadlineValidation = validateErrandDeadline(deadlineDate, 2);
  if (!deadlineValidation.isValid) {
    return { success: false, error: deadlineValidation.error };
  }

  if (!input.prohibitedItemsAcknowledged) {
    return { success: false, error: "You must acknowledge prohibited items guidelines." };
  }

  const creationFeeKobo = pricingStatus.creationFeeKobo;
  const commissionBps = pricingStatus.commissionBps;
  const breakdown = calculateErrandPricingBreakdown(taskPriceKobo, creationFeeKobo, commissionBps);

  // Generate 6-digit delivery PIN for delivery errands
  const errandId = crypto.randomUUID();
  let generatedPin: string | null = null;
  let handoffHmac: string | null = null;

  if (input.type === "pickup_delivery") {
    generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    handoffHmac = computePinHmac(generatedPin, errandId);
  }

  await db.insert(errands).values({
    id: errandId,
    employerId: employer.id,
    title: input.title.trim(),
    type: input.type,
    description: input.description.trim(),
    locationState: input.locationState.trim(),
    locationArea: input.locationArea.trim(),
    address: input.address.trim(),
    dropoffAddress: input.dropoffAddress?.trim() || null,
    budgetKobo: taskPriceKobo,
    creationFeeKobo,
    taskPriceKobo,
    commissionBps,
    workerPayoutKobo: breakdown.workerPayoutKobo,
    deadline: deadlineDate,
    requiredProof: input.requiredProof.trim(),
    itemDeclaration: input.itemDeclaration?.trim() || null,
    prohibitedItemsAcknowledged: true,
    status: "pending_payment",
    handoffHmac,
    handoffAttempts: 0,
  });

  revalidatePath("/employer/errands");
  return {
    success: true,
    errandId,
    deliveryPin: generatedPin,
    totalChargedKobo: breakdown.totalEmployerChargeKobo,
  };
}

/**
 * Concurrency-safe atomic claim with row-level locks and active cap enforcement.
 */
export async function claimErrand(errandId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return { success: false, error: "Only registered workers can claim errands." };
  }

  // 1. Fetch worker profile
  const [worker] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!worker) {
    return { success: false, error: "Worker profile not found." };
  }

  // 2. Strict eligibility checks
  if (!worker.openToErrands) {
    return {
      success: false,
      error: "You are not opted into Alabaru errands. Enable 'Open to Errands' in your profile to claim tasks.",
    };
  }

  if (worker.ninVerificationStatus !== "VERIFIED") {
    return {
      success: false,
      error: "NIN verification required: Your National Identity Number must be verified before claiming errands.",
    };
  }

  // Check active bank account on file
  const [activeBank] = await db
    .select({ id: workerBankAccounts.id })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.workerProfileId, worker.id),
        eq(workerBankAccounts.isActive, true)
      )
    )
    .limit(1);

  if (!activeBank) {
    return {
      success: false,
      error: "Bank account required: Add your Nigerian bank account to receive direct payouts before claiming errands.",
    };
  }

  // 3. Worker active errand cap check (max 2 active errands concurrently)
  const activeWorkerErrands = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(errands)
    .where(
      and(
        eq(errands.claimedByWorkerId, worker.id),
        inArray(errands.status, ["claimed", "in_progress", "proof_submitted"])
      )
    );

  const activeCount = activeWorkerErrands[0]?.count ?? 0;
  if (activeCount >= 2) {
    return {
      success: false,
      error: "Active errand cap reached: You can have at most 2 active errands simultaneously. Complete or submit proof for ongoing tasks first.",
    };
  }

  // 4. Atomic row lock on errand
  try {
    const result = await db.transaction(async (tx) => {
      // Lock errand row
      const [lockedErrand] = await tx
        .select()
        .from(errands)
        .where(eq(errands.id, errandId))
        .for("update");

      if (!lockedErrand) {
        throw new Error("Errand not found.");
      }

      if (lockedErrand.status !== "open") {
        throw new Error("This errand is no longer open for claims.");
      }

      const now = new Date();
      if (lockedErrand.unclaimedExpiresAt && lockedErrand.unclaimedExpiresAt < now) {
        throw new Error("This errand has expired and is being automatically refunded.");
      }

      // Check worker is not the creator
      const [employer] = await tx
        .select({ userId: employerProfiles.userId })
        .from(employerProfiles)
        .where(eq(employerProfiles.id, lockedErrand.employerId))
        .limit(1);

      if (employer?.userId === session.userId) {
        throw new Error("You cannot claim an errand that you created.");
      }

      // Transition to CLAIMED
      await tx
        .update(errands)
        .set({
          status: "claimed",
          claimedByWorkerId: worker.id,
          claimedAt: now,
          updatedAt: now,
        })
        .where(eq(errands.id, errandId));

      // Provision or ensure chat thread exists
      const [existingThread] = await tx
        .select({ id: errandThreads.id })
        .from(errandThreads)
        .where(eq(errandThreads.errandId, errandId))
        .limit(1);

      if (!existingThread && employer) {
        await tx.insert(errandThreads).values({
          errandId,
          employerId: employer.userId,
          workerProfileId: worker.id,
        });
      }

      // Notify employer
      if (employer) {
        await tx.insert(notifications).values({
          userId: employer.userId,
          type: "ERRAND_CLAIMED",
          content: `A verified local runner has claimed your errand "${lockedErrand.title}". Task is now in progress!`,
        });
      }

      return { success: true };
    });

    revalidatePath("/dashboard/errands");
    revalidatePath("/employer/errands");
    return result;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to claim errand." };
  }
}

/**
 * Runner marks errand IN_PROGRESS.
 */
export async function startErrandExecution(errandId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return { success: false, error: "Unauthorized." };
  }

  const [worker] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!worker) return { success: false, error: "Worker profile not found." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand || errand.claimedByWorkerId !== worker.id) {
    return { success: false, error: "You are not assigned to this errand." };
  }

  if (errand.status !== "claimed") {
    return { success: false, error: `Errand is already in ${errand.status} status.` };
  }

  await db
    .update(errands)
    .set({
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(errands.id, errandId));

  revalidatePath("/dashboard/errands");
  return { success: true };
}

/**
 * Verifies delivery 6-digit PIN with HMAC. Max 3 attempts.
 */
export async function verifyErrandDeliveryPin(errandId: string, enteredPin: string) {
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "Unauthorized." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand) return { success: false, error: "Errand not found." };

  if (errand.handoffAttempts >= 3) {
    return {
      success: false,
      error: "Maximum PIN verification attempts exceeded (3/3). Handoff verification is locked for security.",
    };
  }

  const computed = computePinHmac(enteredPin, errandId);
  const isValid = computed === errand.handoffHmac;

  if (!isValid) {
    const nextAttempts = errand.handoffAttempts + 1;
    await db
      .update(errands)
      .set({ handoffAttempts: nextAttempts })
      .where(eq(errands.id, errandId));

    return {
      success: false,
      error: `Incorrect PIN. ${3 - nextAttempts} attempt(s) remaining.`,
      attemptsRemaining: 3 - nextAttempts,
    };
  }

  return { success: true };
}

/**
 * Submits execution proof for an errand.
 */
export async function submitErrandProof(params: {
  errandId: string;
  photoKeys: string[];
  notes?: string;
}) {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return { success: false, error: "Unauthorized." };
  }

  const [worker] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!worker) return { success: false, error: "Worker not found." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, params.errandId))
    .limit(1);

  if (!errand || errand.claimedByWorkerId !== worker.id) {
    return { success: false, error: "You are not assigned to this errand." };
  }

  if (errand.status !== "in_progress" && errand.status !== "claimed") {
    return { success: false, error: `Cannot submit proof while errand is ${errand.status}.` };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(errandProofs).values({
      errandId: params.errandId,
      workerProfileId: worker.id,
      photoKeys: params.photoKeys,
      notes: params.notes?.trim() || null,
      submittedAt: now,
    });

    await tx
      .update(errands)
      .set({
        status: "proof_submitted",
        proofSubmittedAt: now,
        updatedAt: now,
      })
      .where(eq(errands.id, params.errandId));

    // Notify employer
    const [emp] = await tx
      .select({ userId: employerProfiles.userId })
      .from(employerProfiles)
      .where(eq(employerProfiles.id, errand.employerId))
      .limit(1);

    if (emp) {
      await tx.insert(notifications).values({
        userId: emp.userId,
        type: "PROOF_SUBMITTED",
        content: `Proof of completion has been submitted for errand "${errand.title}". Please review and confirm within 24 hours.`,
      });
    }
  });

  revalidatePath("/dashboard/errands");
  revalidatePath("/employer/errands");
  return { success: true };
}

/**
 * Employer approves proof and completes errand, triggering payout.
 */
export async function approveErrandCompletion(errandId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized." };
  }

  const [employer] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) return { success: false, error: "Employer not found." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand || errand.employerId !== employer.id) {
    return { success: false, error: "You do not own this errand." };
  }

  if (errand.status !== "proof_submitted") {
    return { success: false, error: `Errand is in ${errand.status} status, cannot approve.` };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(errands)
      .set({
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(errands.id, errandId));

    // Update payment record
    await tx
      .update(payments)
      .set({
        workerReleasedAt: now,
      })
      .where(eq(payments.errandId, errandId));

    // Insert financial release ledger event
    const [pay] = await tx
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.errandId, errandId))
      .limit(1);

    if (pay) {
      await tx.insert(paymentEvents).values({
        paymentId: pay.id,
        eventType: "RELEASED_TO_WORKER",
        amountKobo: errand.workerPayoutKobo || Math.round(errand.budgetKobo * 0.7),
        actorType: "EMPLOYER",
        actorId: session.userId,
        metadata: { errandId },
      });
    }

    // Notify worker
    if (errand.claimedByWorkerId) {
      const [wrk] = await tx
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, errand.claimedByWorkerId))
        .limit(1);

      if (wrk) {
        await tx.insert(notifications).values({
          userId: wrk.userId,
          type: "ERRAND_COMPLETED",
          content: `Errand "${errand.title}" approved! ₦${(
            (errand.workerPayoutKobo || 0) / 100
          ).toLocaleString()} payout has been released to your bank account on file.`,
        });
      }
    }
  });

  revalidatePath("/employer/errands");
  revalidatePath("/dashboard/errands");
  return { success: true };
}

/**
 * Employer cancels errand while OPEN (100% full refund).
 */
export async function cancelOpenErrandEmployer(errandId: string, reason: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized." };
  }

  const [employer] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) return { success: false, error: "Employer not found." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand || errand.employerId !== employer.id) {
    return { success: false, error: "You do not own this errand." };
  }

  if (errand.status !== "open" && errand.status !== "pending_payment") {
    return {
      success: false,
      error: `Cannot cancel: errand is already ${errand.status}. Only open or pending payment errands can be cancelled directly.`,
    };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(errands)
      .set({
        status: "cancelled",
        cancelledAt: now,
        cancelledBy: session.userId,
        cancelReason: reason.trim(),
        updatedAt: now,
      })
      .where(eq(errands.id, errandId));

    // If payment exists and was verified, flag for 100% refund
    const [pay] = await tx
      .select()
      .from(payments)
      .where(eq(payments.errandId, errandId))
      .limit(1);

    if (pay && pay.status === "VERIFIED") {
      await tx
        .update(payments)
        .set({
          refundStatus: "PENDING",
          refundAmountKobo: pay.totalKobo || pay.amount * 100,
          refundReason: "Cancelled by employer while open: 100% refund",
        })
        .where(eq(payments.id, pay.id));

      await tx.insert(paymentEvents).values({
        paymentId: pay.id,
        eventType: "REFUNDED_TO_EMPLOYER",
        amountKobo: pay.totalKobo || pay.amount * 100,
        actorType: "EMPLOYER",
        actorId: session.userId,
        metadata: { reason, errandId },
      });
    }
  });

  revalidatePath("/employer/errands");
  return { success: true };
}

/**
 * Employer requests revisions for an errand with submitted proof.
 * Grants a 24-hour revision grace window (or remainder of deadline if longer).
 */
export async function requestErrandChanges(params: {
  errandId: string;
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized." };
  }

  const { errandId, notes } = params;
  if (!notes || !notes.trim()) {
    return { success: false, error: "Please describe the changes needed." };
  }

  const [employer] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) return { success: false, error: "Employer not found." };

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand || errand.employerId !== employer.id) {
    return { success: false, error: "You do not own this errand." };
  }

  if (errand.status !== "proof_submitted") {
    return {
      success: false,
      error: `Cannot request changes: errand is currently ${errand.status}. Revisions can only be requested after proof submission.`,
    };
  }

  const now = new Date();
  // 24 hours from now, or remainder of original deadline if longer
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const graceExpiry =
    errand.deadline && errand.deadline > twentyFourHoursLater
      ? errand.deadline
      : twentyFourHoursLater;

  await db.transaction(async (tx) => {
    await tx
      .update(errands)
      .set({
        status: "in_progress",
        revisionRequestedAt: now,
        revisionNotes: notes.trim(),
        revisionGraceExpiresAt: graceExpiry,
        updatedAt: now,
      })
      .where(eq(errands.id, errandId));

    // Post to errand coordination thread if thread exists
    const [thread] = await tx
      .select({ id: errandThreads.id })
      .from(errandThreads)
      .where(eq(errandThreads.errandId, errandId))
      .limit(1);

    if (thread) {
      await tx.insert(errandMessages).values({
        threadId: thread.id,
        senderId: session.userId,
        content: `[Revision Requested]: ${notes.trim()}`,
      });
    }

    // Notify runner
    if (errand.claimedByWorkerId) {
      const [wrk] = await tx
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, errand.claimedByWorkerId))
        .limit(1);

      if (wrk) {
        await tx.insert(notifications).values({
          userId: wrk.userId,
          type: "ERRAND_REVISION_REQUESTED",
          content: `Changes requested on errand "${errand.title}": "${notes.trim()}". Please re-submit proof before ${graceExpiry.toLocaleString()}.`,
        });
      }
    }
  });

  revalidatePath(`/employer/errands/${errandId}`);
  revalidatePath(`/dashboard/errands/${errandId}`);
  return { success: true };
}

/**
 * Report a problem / initiate dispute (Employer or Runner).
 */
export async function reportErrandProblem(params: {
  errandId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized." };
  }

  const { errandId, reason, description, evidenceUrls = [] } = params;
  if (!reason || !description || !description.trim()) {
    return { success: false, error: "Reason and description are required." };
  }

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand) {
    return { success: false, error: "Errand not found." };
  }

  // Validate actor is either the employer or the runner
  let isParticipant = false;
  if (session.role === "EMPLOYER") {
    const [employer] = await db
      .select({ id: employerProfiles.id })
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, session.userId))
      .limit(1);
    if (employer && employer.id === errand.employerId) {
      isParticipant = true;
    }
  } else if (session.role === "WORKER") {
    const [worker] = await db
      .select({ id: workerProfiles.id })
      .from(workerProfiles)
      .where(eq(workerProfiles.userId, session.userId))
      .limit(1);
    if (worker && worker.id === errand.claimedByWorkerId) {
      isParticipant = true;
    }
  }

  if (!isParticipant) {
    return { success: false, error: "You are not an authorized participant in this errand." };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    // 1. Insert dispute record
    await tx.insert(errandDisputes).values({
      errandId,
      raisedByUserId: session.userId,
      initiatorRole: session.role,
      reason,
      description: description.trim(),
      evidenceUrls,
      status: "open",
      quoteTotalKobo: errand.budgetKobo,
    });

    // 2. Transition errand to disputed
    await tx
      .update(errands)
      .set({
        status: "disputed",
        updatedAt: now,
      })
      .where(eq(errands.id, errandId));

    // 3. Post system notice in coordination chat
    const [thread] = await tx
      .select({ id: errandThreads.id })
      .from(errandThreads)
      .where(eq(errandThreads.errandId, errandId))
      .limit(1);

    if (thread) {
      await tx.insert(errandMessages).values({
        threadId: thread.id,
        senderId: session.userId,
        content: `[Dispute Filed]: Reason - ${reason}. An admin has been assigned to mediate.`,
      });
    }
  });

  revalidatePath(`/employer/errands/${errandId}`);
  revalidatePath(`/dashboard/errands/${errandId}`);
  return { success: true };
}

