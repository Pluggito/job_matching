// 1. Worker Profile Verification Lifecycle
export const WORKER_VERIFICATION_STATUSES = [
  "pending",
  "under_review",
  "changes_requested",
  "verified",
  "rejected",
] as const;
export type WorkerVerificationStatus = (typeof WORKER_VERIFICATION_STATUSES)[number];

export const WORKER_VERIFICATION_TRANSITIONS: Record<WorkerVerificationStatus, readonly WorkerVerificationStatus[]> = {
  pending: ["under_review", "rejected"],
  under_review: ["changes_requested", "verified", "rejected"],
  changes_requested: ["under_review"],
  verified: ["under_review"],
  rejected: ["under_review"],
};

// 2. Hiring Request Lifecycle
export const HIRING_REQUEST_STATUSES = [
  "open",
  "shortlisted",
  "filled",
  "closed",
] as const;
export type HiringRequestStatus = (typeof HIRING_REQUEST_STATUSES)[number];

export const HIRING_REQUEST_TRANSITIONS: Record<HiringRequestStatus, readonly HiringRequestStatus[]> = {
  open: ["shortlisted", "closed"],
  shortlisted: ["filled", "closed", "open"],
  filled: ["closed"],
  closed: [],
};

// 3. Selection / Handshake Lifecycle
export const SELECTION_STATUSES = [
  "shortlisted",
  "quote_sent",
  "quote_accepted",
  "fee_pending", // Backward-compatible legacy status
  "fee_paid",
  "connected",
  "cancelled",
] as const;
export type SelectionStatus = (typeof SELECTION_STATUSES)[number];

export const SELECTION_TRANSITIONS: Record<SelectionStatus, readonly SelectionStatus[]> = {
  shortlisted: ["quote_sent", "fee_pending", "cancelled"],
  quote_sent: ["quote_accepted", "cancelled"],
  quote_accepted: ["fee_paid", "cancelled"],
  fee_pending: ["fee_paid", "cancelled"],
  fee_paid: ["connected", "cancelled"],
  connected: ["cancelled"],
  cancelled: [],
};

// 4. Placement Lifecycle
export const PLACEMENT_STATUSES = [
  "active",
  "notice_given",
  "ended",
  "replacement_requested",
  "replaced",
] as const;
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number];

export const PLACEMENT_TRANSITIONS: Record<PlacementStatus, readonly PlacementStatus[]> = {
  active: ["notice_given", "replacement_requested", "ended"],
  notice_given: ["ended", "replacement_requested"],
  replacement_requested: ["replaced", "ended"],
  replaced: ["notice_given", "ended"],
  ended: [],
};

// 5. Quote Lifecycle
export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "superseded",
  "paid",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ["sent", "superseded"],
  sent: ["accepted", "declined", "superseded"],
  accepted: ["paid", "superseded"],
  declined: ["superseded"],
  superseded: [],
  paid: [], // Paid quotes are strictly immutable
};

// 6. Errand Lifecycle
export const ERRAND_STATUSES = [
  "draft",
  "pending_payment",
  "open",
  "claimed",
  "in_progress",
  "proof_submitted",
  "completed",
  "disputed",
  "cancelled",
  "expired",
] as const;
export type ErrandStatus = (typeof ERRAND_STATUSES)[number];

export type ActorRole = "EMPLOYER" | "WORKER" | "ADMIN" | "SYSTEM";

/**
 * Actor-aware errand transition maps:
 * Enforces role restrictions (e.g. employers cannot unilaterally cancel in_progress;
 * expired cannot jump to open without re-funding via pending_payment).
 */
export const ERRAND_TRANSITIONS_BY_ACTOR: Record<ActorRole, Partial<Record<ErrandStatus, readonly ErrandStatus[]>>> = {
  EMPLOYER: {
    draft: ["pending_payment", "cancelled"],
    pending_payment: ["cancelled"],
    open: ["cancelled"], // 100% full refund before claim
    claimed: ["cancelled"], // subject to cancellation policy (grace / stipend)
    proof_submitted: ["completed", "disputed", "in_progress"],
    expired: ["pending_payment"], // Repost requires new quote & funding
  },
  WORKER: {
    open: ["claimed"],
    claimed: ["in_progress", "open"], // worker can start or release task back to pool
    in_progress: ["proof_submitted", "disputed"],
  },
  ADMIN: {
    draft: ["pending_payment", "cancelled"],
    pending_payment: ["open", "cancelled"],
    open: ["claimed", "cancelled", "expired"],
    claimed: ["in_progress", "open", "cancelled", "disputed"],
    in_progress: ["proof_submitted", "disputed", "cancelled"], // Admin can cancel via dispute resolution
    proof_submitted: ["completed", "disputed", "in_progress"],
    disputed: ["completed", "cancelled", "open"], // Resolve dispute: payout, refund, or reopen
    expired: ["pending_payment", "cancelled"],
  },
  SYSTEM: {
    pending_payment: ["open", "cancelled"],
    open: ["expired"], // Unclaimed open window expired
    proof_submitted: ["completed"], // 24-hour auto-release (client-confirmed)
    disputed: ["completed", "cancelled"], // Automated dispute resolution timeout
  },
};

/**
 * Global superset of allowed errand transitions across any actor.
 */
export const ERRAND_TRANSITIONS: Record<ErrandStatus, readonly ErrandStatus[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["open", "cancelled"],
  open: ["claimed", "cancelled", "expired"],
  claimed: ["in_progress", "open", "cancelled", "disputed"],
  in_progress: ["proof_submitted", "disputed", "cancelled"],
  proof_submitted: ["completed", "disputed", "in_progress"],
  completed: [],
  disputed: ["completed", "cancelled", "open"],
  cancelled: [],
  expired: ["pending_payment"], // Never expired -> open directly
};

// Universal Transition Validators
export function validateTransition<T extends string>(
  current: T,
  next: T,
  allowedMap: Record<T, readonly T[]>
): boolean {
  if (current === next) return true; // Idempotent same-state check
  const allowed = allowedMap[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

export function assertValidTransition<T extends string>(
  entityName: string,
  current: T,
  next: T,
  allowedMap: Record<T, readonly T[]>
): void {
  if (!validateTransition(current, next, allowedMap)) {
    throw new Error(
      `Illegal ${entityName} state transition from "${current}" to "${next}". Allowed: [${allowedMap[current]?.join(", ") || "none"}]`
    );
  }
}

export function validateActorTransition(
  actor: ActorRole,
  current: ErrandStatus,
  next: ErrandStatus
): boolean {
  if (current === next) return true;
  const actorMap = ERRAND_TRANSITIONS_BY_ACTOR[actor];
  const allowed = actorMap[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

export function assertValidActorTransition(
  actor: ActorRole,
  current: ErrandStatus,
  next: ErrandStatus
): void {
  if (!validateActorTransition(actor, current, next)) {
    const actorMap = ERRAND_TRANSITIONS_BY_ACTOR[actor];
    const allowed = actorMap[current] || [];
    throw new Error(
      `Illegal errand state transition by ${actor} from "${current}" to "${next}". Allowed for ${actor}: [${allowed.join(", ") || "none"}]`
    );
  }
}

// 7. Payout Lifecycle
export const PAYOUT_STATUSES = [
  "pending",
  "processing",
  "success",
  "failed",
  "reversed",
  "needs_bank_fix",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];
