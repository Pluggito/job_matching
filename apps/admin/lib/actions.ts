"use server";

import {
  db,
  workerProfiles,
  selections,
  payments,
  placements,
  replacementRequests,
  removalNotices,
  ratings,
  messages,
  threads,
  notifications,
  platformSettings,
  errands,
  errandDisputes,
  employerProfiles,
  users,
  paymentEvents,
  eq,
  and,
  inArray,
  asc,
} from "@repo/db";
import {
  assertValidTransition,
  WORKER_VERIFICATION_TRANSITIONS,
  SELECTION_TRANSITIONS,
  PLACEMENT_TRANSITIONS,
  WorkerVerificationStatus,
  SelectionStatus,
  PlacementStatus,
  maskNin,
  validatePlatformSetting,
  calculateErrandPricingBreakdown,
  formatNaira,
} from "@repo/shared";
import { getAdminUser } from "./auth";
import { insertAuditLog } from "./audit";
import { revalidatePath } from "next/cache";

// ==========================================
// Phase 1: Worker Verification Mutations
// ==========================================

export async function updateWorkerVerificationStatus(params: {
  workerId: string;
  nextStatus: WorkerVerificationStatus;
  reason: string;
}) {
  const admin = await getAdminUser();
  const { workerId, nextStatus, reason } = params;

  // Validate mandatory reason for state changes (except initial start-review if note not provided)
  if (nextStatus !== "under_review" && (!reason || reason.trim().length === 0)) {
    throw new Error(`A mandatory reason is required to transition to ${nextStatus}.`);
  }

  const [worker] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.id, workerId))
    .limit(1);

  if (!worker) {
    throw new Error(`Worker with ID ${workerId} not found.`);
  }

  const currentStatus = (worker.verificationStatus as WorkerVerificationStatus) || "pending";

  // Enforce state machine transitions
  assertValidTransition(
    "Worker Verification",
    currentStatus,
    nextStatus,
    WORKER_VERIFICATION_TRANSITIONS
  );

  await db.transaction(async (tx) => {
    // 1. Update worker profile status
    const legacyStatus =
      nextStatus === "verified"
        ? "APPROVED"
        : nextStatus === "rejected"
        ? "REJECTED"
        : "PENDING";
    const ninStatus = nextStatus === "verified" ? "VERIFIED" : "PENDING";

    await tx
      .update(workerProfiles)
      .set({
        verificationStatus: nextStatus,
        status: legacyStatus,
        ninVerificationStatus: ninStatus,
      })
      .where(eq(workerProfiles.id, workerId));

    // 2. Notify worker
    const effectiveReason = reason?.trim() || (nextStatus === "under_review" ? "Admin review initiated" : "");
    await tx.insert(notifications).values({
      userId: worker.userId,
      type: "VERIFICATION_STATUS_UPDATED",
      content: `Your profile status was updated to ${nextStatus.replace("_", " ")}.${
        effectiveReason ? ` Reason: ${effectiveReason}` : ""
      }`,
    });

    // 3. Write immutable audit log (NEVER store raw NIN in metadata)
    const profileData = (worker.profileData as Record<string, any>) || {};
    const rawNin = profileData.nin || worker.ninVerificationRef || "";
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: `WORKER_${nextStatus.toUpperCase()}`,
      targetType: "WORKER",
      targetId: workerId,
      reason: effectiveReason,
      metadata: {
        from: currentStatus,
        to: nextStatus,
        workerUserId: worker.userId,
        maskedNin: rawNin ? maskNin(rawNin) : null,
      },
    });
  });

  revalidatePath("/workers");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// Phase 2: Hire Requests & Agency Fee Mutations
// ==========================================

export async function markSelectionFeeAsPaid(params: {
  selectionId: string;
  feeAmount?: number;
  notes?: string;
}) {
  const admin = await getAdminUser();
  const { selectionId, feeAmount = 50000, notes } = params;

  const [sel] = await db
    .select()
    .from(selections)
    .where(eq(selections.id, selectionId))
    .limit(1);

  if (!sel) throw new Error(`Selection with ID ${selectionId} not found.`);

  // Check idempotency: check if payment record already exists
  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.selectionId, selectionId))
    .limit(1);

  if (existingPayment && existingPayment.status === "VERIFIED") {
    return { success: true, message: "Fee already marked as paid." };
  }

  await db.transaction(async (tx) => {
    // 1. Create or update payment record with adminId
    if (existingPayment) {
      await tx
        .update(payments)
        .set({
          status: "VERIFIED",
          adminId: admin.id,
          verifiedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await tx.insert(payments).values({
        selectionId,
        adminId: admin.id,
        paystackReference: `ADMIN-OVERRIDE-${Date.now()}-${selectionId.slice(0, 8)}`,
        amount: feeAmount,
        status: "VERIFIED",
        verifiedAt: new Date(),
      });
    }

    // 2. Audit log entry
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "SELECTION_FEE_PAID",
      targetType: "SELECTION",
      targetId: selectionId,
      reason: notes || "Agency fee marked as paid by admin",
      metadata: {
        feeAmount,
        employerProfileId: sel.employerProfileId,
        workerProfileId: sel.workerProfileId,
      },
    });
  });

  revalidatePath("/requests");
  revalidatePath("/");
  return { success: true };
}

export async function releaseWorkerAccess(params: {
  selectionId: string;
  notes?: string;
}) {
  const admin = await getAdminUser();
  const { selectionId, notes } = params;

  const [sel] = await db
    .select()
    .from(selections)
    .where(eq(selections.id, selectionId))
    .limit(1);

  if (!sel) throw new Error(`Selection with ID ${selectionId} not found.`);

  // ENFORCE: worker must have accepted before contact can be released!
  if (!sel.termsAcceptedAt) {
    throw new Error(
      "Worker has not accepted the job offer yet. You must confirm that the worker has accepted the offer before releasing contact details."
    );
  }

  await db.transaction(async (tx) => {
    // Update selection to connected / CONFIRMED
    await tx
      .update(selections)
      .set({
        status: "CONFIRMED",
      })
      .where(eq(selections.id, selectionId));

    // Audit log entry
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "SELECTION_RELEASE_ACCESS",
      targetType: "SELECTION",
      targetId: selectionId,
      reason: notes || "Direct worker access released by admin after confirming worker acceptance",
      metadata: {
        employerProfileId: sel.employerProfileId,
        workerProfileId: sel.workerProfileId,
      },
    });
  });

  revalidatePath("/requests");
  revalidatePath("/workers");
  revalidatePath("/");
  return { success: true };
}

export async function confirmWorkerJobAcceptance(params: {
  selectionId: string;
  notes?: string;
}) {
  const admin = await getAdminUser();
  const { selectionId, notes } = params;

  const [sel] = await db
    .select()
    .from(selections)
    .where(eq(selections.id, selectionId))
    .limit(1);

  if (!sel) throw new Error(`Selection with ID ${selectionId} not found.`);

  await db.transaction(async (tx) => {
    const acceptedAt = new Date();
    await tx
      .update(selections)
      .set({
        status: "CONFIRMED",
        termsAcceptedAt: acceptedAt,
      })
      .where(eq(selections.id, selectionId));

    // Also activate placement with 14-day SLA
    const [existingPlacement] = await tx
      .select({ id: placements.id })
      .from(placements)
      .where(eq(placements.selectionId, selectionId))
      .limit(1);

    if (!existingPlacement) {
      const startDate = new Date();
      const replacementDeadline = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      await tx.insert(placements).values({
        selectionId,
        startDate,
        status: "ACTIVE",
        replacementDeadline,
      });
    }

    // Audit log entry
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "CONFIRM_WORKER_ACCEPTANCE",
      targetType: "SELECTION",
      targetId: selectionId,
      reason: notes || "Admin verified worker accepted offer via communication",
      metadata: {
        employerProfileId: sel.employerProfileId,
        workerProfileId: sel.workerProfileId,
      },
    });
  });

  revalidatePath("/requests");
  revalidatePath("/workers");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// Phase 3: Placements, 3-Day Notice & 14-Day Replacement
// ==========================================

export async function recordPlacementRemovalNotice(params: {
  placementId: string;
  noticeDate: string; // ISO string or YYYY-MM-DD
  reason: string;
}) {
  const admin = await getAdminUser();
  const { placementId, noticeDate, reason } = params;

  if (!reason || reason.trim().length === 0) {
    throw new Error("A reason is required to record a removal notice.");
  }

  const [placement] = await db
    .select()
    .from(placements)
    .where(eq(placements.id, placementId))
    .limit(1);

  if (!placement) throw new Error(`Placement ${placementId} not found.`);

  const parsedNoticeDate = new Date(noticeDate);
  // 3-day notice calculation
  const effectiveEndDate = new Date(parsedNoticeDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    // 1. Insert removal notice
    await tx.insert(removalNotices).values({
      placementId,
      noticeDate: parsedNoticeDate,
      reason,
    });

    // 2. Audit log
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "PLACEMENT_REMOVAL_NOTICE",
      targetType: "PLACEMENT",
      targetId: placementId,
      reason,
      metadata: {
        noticeDate: parsedNoticeDate.toISOString(),
        effectiveEndDate: effectiveEndDate.toISOString(),
        noticePeriodDays: 3,
      },
    });
  });

  revalidatePath("/placements");
  revalidatePath("/");
  return { success: true, effectiveEndDate: effectiveEndDate.toISOString() };
}

export async function recordReplacementRequest(params: {
  placementId: string;
  reason: string;
}) {
  const admin = await getAdminUser();
  const { placementId, reason } = params;

  if (!reason || reason.trim().length === 0) {
    throw new Error("A reason is required to log a replacement request.");
  }

  const [placement] = await db
    .select()
    .from(placements)
    .where(eq(placements.id, placementId))
    .limit(1);

  if (!placement) throw new Error(`Placement ${placementId} not found.`);

  // 14-day replacement window
  const requestDate = new Date();
  const dueAt = new Date(requestDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    // 1. Insert replacement request with dueAt
    await tx.insert(replacementRequests).values({
      placementId,
      reason,
      dueAt,
    });

    // 2. Update placement status
    await tx
      .update(placements)
      .set({
        status: "REPLACED", // or current status
      })
      .where(eq(placements.id, placementId));

    // 3. Audit log
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "PLACEMENT_REPLACEMENT_REQUESTED",
      targetType: "PLACEMENT",
      targetId: placementId,
      reason,
      metadata: {
        requestedAt: requestDate.toISOString(),
        dueAt: dueAt.toISOString(),
        windowDays: 14,
      },
    });
  });

  revalidatePath("/placements");
  revalidatePath("/");
  return { success: true, dueAt: dueAt.toISOString() };
}

// ==========================================
// Phase 6: Ratings Moderation
// ==========================================

export async function moderateRating(params: {
  ratingId: string;
  moderated: boolean;
  reason?: string;
}) {
  const admin = await getAdminUser();
  const { ratingId, moderated, reason } = params;

  await db.transaction(async (tx) => {
    await tx
      .update(ratings)
      .set({ moderated })
      .where(eq(ratings.id, ratingId));

    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: moderated ? "RATING_MODERATED_HIDE" : "RATING_MODERATED_UNHIDE",
      targetType: "RATING",
      targetId: ratingId,
      reason: reason || null,
      metadata: {
        moderated,
      },
    });
  });

  revalidatePath("/ratings");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// Phase 5: Admin Messaging
// ==========================================

export async function sendAdminReply(params: {
  threadId: string;
  content: string;
}) {
  const admin = await getAdminUser();
  const { threadId, content } = params;

  if (!content || content.trim().length === 0) {
    throw new Error("Message content cannot be empty.");
  }

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      threadId,
      senderId: admin.id,
      content: content.trim(),
    });

    const [thread] = await tx
      .select({ employerId: threads.employerId })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (thread) {
      await tx.insert(notifications).values({
        userId: thread.employerId,
        type: "ADMIN_REPLY",
        title: "Staff Guru Support Response",
        content: content.trim().slice(0, 100),
        link: "/employer/messages",
      });
    }

    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "MESSAGE_SENT",
      targetType: "THREAD",
      targetId: threadId,
      metadata: {
        preview: content.slice(0, 50),
      },
    });
  });

  revalidatePath("/messages");
  return { success: true };
}

export async function getAdminThreadsAction() {
  const admin = await getAdminUser();

  // Query threads with employer details
  const threadRows = await db
    .select({
      id: threads.id,
      employerId: threads.employerId,
      employerEmail: users.email,
      businessName: employerProfiles.businessName,
    })
    .from(threads)
    .innerJoin(users, eq(threads.employerId, users.id))
    .leftJoin(employerProfiles, eq(users.id, employerProfiles.userId));

  // Query all messages ordered chronologically
  const allMessages = await db
    .select({
      id: messages.id,
      threadId: messages.threadId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .orderBy(asc(messages.createdAt));

  // Group messages by threadId
  const msgsByThread = new Map<
    string,
    Array<{
      id: string;
      senderId: string;
      senderEmail: string;
      content: string;
      createdAt: string;
    }>
  >();

  for (const m of allMessages) {
    const list = msgsByThread.get(m.threadId) || [];
    list.push({
      id: m.id,
      senderId: m.senderId,
      senderEmail: m.senderId === admin.id ? admin.email : "Employer",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    });
    msgsByThread.set(m.threadId, list);
  }

  const formattedThreads = threadRows.map((t) => {
    const threadMsgs = msgsByThread.get(t.id) || [];
    const lastMsg = threadMsgs[threadMsgs.length - 1];
    return {
      id: t.id,
      employerId: t.employerId,
      employerEmail: t.employerEmail,
      businessName: t.businessName || (t.employerEmail.split("@")[0] ?? "Employer"),
      lastMessageSnippet: lastMsg ? lastMsg.content : "No messages yet",
      lastMessageAt: lastMsg ? lastMsg.createdAt : "",
      messages: threadMsgs,
    };
  });

  return { success: true, threads: formattedThreads };
}


// ==========================================
// Phase 4: Alabaru Errand Pricing Settings
// ==========================================

export interface ErrandPricingSettingsData {
  creationFeeKobo: number;
  commissionBps: number;
  minPriceKobo: number;
  maxPriceKobo: number;
}

export async function getErrandPricingSettings(): Promise<ErrandPricingSettingsData> {
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
  const minPriceKobo = typeof minObj?.kobo === "number" && minObj.kobo !== 500_000 ? minObj.kobo : 2_000_000;

  const maxObj = map.get("errand_price_max_kobo") as { kobo?: number } | undefined;
  const maxPriceKobo = typeof maxObj?.kobo === "number" ? maxObj.kobo : 100_000_000;

  return {
    creationFeeKobo,
    commissionBps,
    minPriceKobo,
    maxPriceKobo,
  };
}

export async function updateErrandPricingSettings(params: {
  creationFeeNaira: number;
  commissionPercent: number;
  minPriceNaira: number;
  reason: string;
}) {
  const admin = await getAdminUser();
  const { creationFeeNaira, commissionPercent, minPriceNaira, reason } = params;

  if (!reason || reason.trim().length === 0) {
    throw new Error("A mandatory audit reason is required when modifying platform pricing.");
  }

  if (commissionPercent < 0 || commissionPercent > 100) {
    throw new Error("Commission rate must be between 0% and 100%.");
  }

  if (minPriceNaira < 0) {
    throw new Error("Minimum errand price floor cannot be negative.");
  }

  const creationFeeKobo = Math.round(creationFeeNaira * 100);
  const commissionBps = Math.round(commissionPercent * 100);
  const minPriceKobo = Math.round(minPriceNaira * 100);

  // Validate settings against Zod schemas
  const validatedCreationFee = validatePlatformSetting("errand_creation_fee_kobo", { kobo: creationFeeKobo });
  const validatedCommission = validatePlatformSetting("errand_commission_global", {
    basisPoints: commissionBps,
    minFloorKobo: 0,
  });
  const validatedMinPrice = validatePlatformSetting("errand_price_min_kobo", { kobo: minPriceKobo });

  const current = await getErrandPricingSettings();

  await db.transaction(async (tx) => {
    // 1. Update errand_creation_fee_kobo
    await tx
      .update(platformSettings)
      .set({
        value: validatedCreationFee,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.key, "errand_creation_fee_kobo"));

    // 2. Update errand_commission_global
    await tx
      .update(platformSettings)
      .set({
        value: validatedCommission,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.key, "errand_commission_global"));

    // 3. Update errand_price_min_kobo
    await tx
      .update(platformSettings)
      .set({
        value: validatedMinPrice,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.key, "errand_price_min_kobo"));

    // 4. Immutable audit log entry
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "UPDATE_ERRAND_PRICING",
      targetType: "PLATFORM_SETTINGS",
      targetId: "errand_pricing",
      reason: reason.trim(),
      metadata: {
        previousCreationFeeKobo: current.creationFeeKobo,
        previousCommissionBps: current.commissionBps,
        previousMinPriceKobo: current.minPriceKobo,
        newCreationFeeKobo: creationFeeKobo,
        newCommissionBps: commissionBps,
        newMinPriceKobo: minPriceKobo,
      },
    });
  });

  revalidatePath("/settings/errands");
  return { success: true };
}

// ==========================================
// Phase 4 & 5: Admin Errand Operations & Disputes
// ==========================================

export async function resolveErrandDispute(params: {
  disputeId: string;
  outcome: "RESOLVED_FULL_REFUND" | "RESOLVED_FULL_PAYOUT" | "RESOLVED_SPLIT" | "DISMISSED";
  refundKobo: number;
  payoutKobo: number;
  notes: string;
}) {
  const admin = await getAdminUser();
  const { disputeId, outcome, refundKobo, payoutKobo, notes } = params;

  if (!notes || !notes.trim()) {
    throw new Error("Mandatory resolution notes are required.");
  }

  const [dispute] = await db
    .select()
    .from(errandDisputes)
    .where(eq(errandDisputes.id, disputeId))
    .limit(1);

  if (!dispute) {
    throw new Error(`Dispute with ID ${disputeId} not found.`);
  }

  if (dispute.status !== "OPEN") {
    throw new Error(`Dispute is already resolved (${dispute.status}).`);
  }

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, dispute.errandId))
    .limit(1);

  if (!errand) {
    throw new Error(`Errand associated with dispute not found.`);
  }

  const taskPrice = errand.taskPriceKobo || errand.budgetKobo;

  // Validate split sum math
  if (outcome === "RESOLVED_SPLIT") {
    if (refundKobo + payoutKobo !== taskPrice) {
      throw new Error(
        `Split sum mismatch: Refund (${refundKobo}) + Payout (${payoutKobo}) must equal task amount (${taskPrice}).`
      );
    }
  }

  const effectiveRefundKobo =
    outcome === "RESOLVED_FULL_REFUND"
      ? taskPrice
      : outcome === "RESOLVED_SPLIT"
      ? refundKobo
      : 0;

  const effectivePayoutKobo =
    outcome === "RESOLVED_FULL_PAYOUT"
      ? errand.workerPayoutKobo || Math.round(taskPrice * 0.7)
      : outcome === "RESOLVED_SPLIT"
      ? payoutKobo
      : 0;

  const now = new Date();

  await db.transaction(async (tx) => {
    // 1. Update dispute
    await tx
      .update(errandDisputes)
      .set({
        status: outcome,
        employerRefundKobo: effectiveRefundKobo,
        workerPayoutKobo: effectivePayoutKobo,
        resolutionNotes: notes.trim(),
        resolvedByAdminId: admin.id,
        resolvedAt: now,
        updatedAt: now,
      })
      .where(eq(errandDisputes.id, disputeId));

    // 2. Update errand status
    const newErrandStatus = effectiveRefundKobo > 0 && effectivePayoutKobo === 0 ? "cancelled" : "completed";
    await tx
      .update(errands)
      .set({
        status: newErrandStatus,
        completedAt: newErrandStatus === "completed" ? now : errand.completedAt,
        cancelledAt: newErrandStatus === "cancelled" ? now : errand.cancelledAt,
        cancelReason: newErrandStatus === "cancelled" ? `Admin dispute resolution: ${notes.trim()}` : errand.cancelReason,
        updatedAt: now,
      })
      .where(eq(errands.id, errand.id));

    // 3. Handle payment refund record if refund was awarded
    if (effectiveRefundKobo > 0) {
      const [pay] = await tx
        .select()
        .from(payments)
        .where(eq(payments.errandId, errand.id))
        .limit(1);

      if (pay) {
        await tx
          .update(payments)
          .set({
            refundStatus: "PENDING",
            refundAmountKobo: effectiveRefundKobo,
            refundReason: `Admin dispute resolution: ${notes.trim()}`,
          })
          .where(eq(payments.id, pay.id));

        await tx.insert(paymentEvents).values({
          paymentId: pay.id,
          eventType: "REFUNDED_TO_EMPLOYER",
          amountKobo: effectiveRefundKobo,
          actorType: "ADMIN",
          actorId: admin.id,
          metadata: { disputeId, outcome, notes },
        });
      }
    }

    // 4. Notifications
    const [employer] = await tx
      .select({ userId: employerProfiles.userId })
      .from(employerProfiles)
      .where(eq(employerProfiles.id, errand.employerId))
      .limit(1);

    if (employer) {
      await tx.insert(notifications).values({
        userId: employer.userId,
        type: "ERRAND_DISPUTE_RESOLVED",
        content: `Dispute on errand "${errand.title}" resolved (${outcome.replace("RESOLVED_", "")}). Admin decision: ${notes.trim()}`,
      });
    }

    if (errand.claimedByWorkerId) {
      const [worker] = await tx
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, errand.claimedByWorkerId))
        .limit(1);

      if (worker) {
        await tx.insert(notifications).values({
          userId: worker.userId,
          type: "ERRAND_DISPUTE_RESOLVED",
          content: `Dispute on errand "${errand.title}" resolved (${outcome.replace("RESOLVED_", "")}). Payout awarded: ${formatNaira(effectivePayoutKobo)}. Notes: ${notes.trim()}`,
        });
      }
    }

    // 5. Audit log
    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: `RESOLVE_ERRAND_DISPUTE_${outcome}`,
      targetType: "ERRAND_DISPUTE",
      targetId: disputeId,
      reason: notes.trim(),
      metadata: {
        errandId: errand.id,
        outcome,
        refundKobo: effectiveRefundKobo,
        payoutKobo: effectivePayoutKobo,
      },
    });
  });

  revalidatePath("/errands");
  revalidatePath("/");
  return { success: true };
}

export async function overrideErrandStatus(params: {
  errandId: string;
  newStatus: string;
  reason: string;
}) {
  const admin = await getAdminUser();
  const { errandId, newStatus, reason } = params;

  if (!reason || !reason.trim()) {
    throw new Error("Mandatory reason required for admin status override.");
  }

  const [errand] = await db
    .select()
    .from(errands)
    .where(eq(errands.id, errandId))
    .limit(1);

  if (!errand) {
    throw new Error(`Errand with ID ${errandId} not found.`);
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(errands)
      .set({
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(errands.id, errandId));

    await insertAuditLog(tx, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: "OVERRIDE_ERRAND_STATUS",
      targetType: "ERRAND",
      targetId: errandId,
      reason: reason.trim(),
      metadata: {
        previousStatus: errand.status,
        newStatus,
      },
    });
  });

  revalidatePath("/errands");
  revalidatePath("/");
  return { success: true };
}
