import { 
  pgTable, text, timestamp, uuid, pgEnum, integer, doublePrecision, boolean, json, index, uniqueIndex, check, bigint
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["WORKER", "EMPLOYER", "ADMIN"]);
export const workerStatusEnum = pgEnum("worker_status", ["PENDING", "APPROVED", "REJECTED"]);
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "VERIFIED", "FAILED"]);
export const selectionStatusEnum = pgEnum("selection_status", ["PENDING", "CONFIRMED", "CANCELLED"]);
export const placementStatusEnum = pgEnum("placement_status", ["ACTIVE", "TERMINATED", "REPLACED"]);
export const engagementTypeEnum = pgEnum("engagement_type", ["ONSITE", "REMOTE"]);
export const hiringRequestStatusEnum = pgEnum("hiring_request_status", ["OPEN", "FILLED", "CLOSED"]);
export const availabilityStatusEnum = pgEnum("availability_status", ["AVAILABLE_NOW", "AVAILABLE_FROM", "BUSY"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workerProfiles = pgTable("worker_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique().notNull(),
  category: text("category").notNull(),
  skills: text("skills").array().notNull(),
  experienceYears: integer("experience_years").notNull(),
  location: text("location").notNull(),
  locationState: text("location_state"),
  locationArea: text("location_area"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  availabilityStatus: availabilityStatusEnum("availability_status").default("AVAILABLE_NOW").notNull(),
  availableFrom: timestamp("available_from"),
  availability: text("availability").notNull(),
  expectedPay: doublePrecision("expected_pay").notNull(),
  expectedPayKobo: bigint("expected_pay_kobo", { mode: "number" }),
  status: workerStatusEnum("status").default("PENDING").notNull(),
  verificationStatus: text("verification_status").default("pending").notNull(),
  ninVerificationStatus: text("nin_verification_status").notNull(),
  ninVerificationRef: text("nin_verification_ref"),
  
  // Errand Vertical (Alabaru) preferences
  openToErrands: boolean("open_to_errands").default(false).notNull(),
  errandPreferredStates: text("errand_preferred_states").array(),
  errandPreferredAreas: text("errand_preferred_areas").array(),
  errandTypes: text("errand_types").array(),
  errandMinPayKobo: bigint("errand_min_pay_kobo", { mode: "number" }),
  
  profileData: json("profile_data"),
}, (table) => {
  return {
    workerSearchIdx: index("worker_search_idx").on(table.category, table.location, table.status),
    smartMatchIdx: index("worker_smart_match_idx").on(table.category, table.status, table.locationState, table.availabilityStatus),
  }
});

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
});

export const employerProfiles = pgTable("employer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique().notNull(),
  businessType: text("business_type").default("INDIVIDUAL").notNull(),
  businessName: text("business_name").notNull(),
  location: text("location").notNull(),
  hiringNeeds: text("hiring_needs").notNull(),
  profileData: json("profile_data"),
});

export const hiringRequests = pgTable("hiring_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerId: uuid("employer_id").references(() => employerProfiles.id).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  preferredSkills: text("preferred_skills").array().notNull(),
  minExperienceYears: integer("min_experience_years").notNull(),
  locationState: text("location_state").notNull(),
  locationArea: text("location_area").notNull(),
  engagementType: engagementTypeEnum("engagement_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  budgetMin: doublePrecision("budget_min").notNull(),
  budgetMax: doublePrecision("budget_max").notNull(),
  budgetMinKobo: bigint("budget_min_kobo", { mode: "number" }),
  budgetMaxKobo: bigint("budget_max_kobo", { mode: "number" }),
  workersNeeded: integer("workers_needed").notNull(),
  status: hiringRequestStatusEnum("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shortlists = pgTable("shortlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerProfileId: uuid("employer_profile_id").references(() => employerProfiles.id).unique().notNull(),
});

export const shortlistItems = pgTable("shortlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortlistId: uuid("shortlist_id").references(() => shortlists.id).notNull(),
  workerId: uuid("worker_id").references(() => workerProfiles.id).notNull(),
});

export const selections = pgTable("selections", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerProfileId: uuid("employer_profile_id").references(() => employerProfiles.id).notNull(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  hiringRequestId: uuid("hiring_request_id").references(() => hiringRequests.id).notNull(),
  status: selectionStatusEnum("status").default("PENDING").notNull(),
  feeAmount: doublePrecision("fee_amount").notNull(),
  termsVersion: text("terms_version").notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  hiredAt: timestamp("hired_at"),
});

// ==========================================
// Platform Settings (Admin-Configurable Engine)
// ==========================================
export const platformSettings = pgTable("platform_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").unique().notNull(),
  value: json("value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Alabaru: Errands Vertical
// ==========================================
export const errands = pgTable("errands", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerId: uuid("employer_id").references(() => employerProfiles.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // site_inspection | pickup_delivery | queue_document | purchase | supervision
  description: text("description").notNull(),
  locationState: text("location_state").notNull(),
  locationArea: text("location_area").notNull(),
  address: text("address").notNull(), // Exact address (revealed only after claim)
  dropoffAddress: text("dropoff_address"),
  
  budgetKobo: bigint("budget_kobo", { mode: "number" }).notNull(),
  deadline: timestamp("deadline").notNull(),
  requiredProof: text("required_proof").notNull(),
  itemDeclaration: text("item_declaration"),
  prohibitedItemsAcknowledged: boolean("prohibited_items_acknowledged").default(false).notNull(),
  
  status: text("status").default("draft").notNull(), // draft | pending_payment | open | claimed | in_progress | proof_submitted | completed | disputed | cancelled | expired
  claimedByWorkerId: uuid("claimed_by_worker_id").references(() => workerProfiles.id),
  
  // Explicit lifecycle timestamps & cancellation metadata
  openedAt: timestamp("opened_at"),
  claimedAt: timestamp("claimed_at"),
  proofSubmittedAt: timestamp("proof_submitted_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
  
  // Errand financial snapshots & lifecycle deadlines
  creationFeeKobo: bigint("creation_fee_kobo", { mode: "number" }),
  taskPriceKobo: bigint("task_price_kobo", { mode: "number" }),
  commissionBps: integer("commission_bps").default(3000).notNull(),
  workerPayoutKobo: bigint("worker_payout_kobo", { mode: "number" }),
  unclaimedExpiresAt: timestamp("unclaimed_expires_at"),
  
  // Delivery handoff security
  handoffHmac: text("handoff_hmac"),
  handoffAttempts: integer("handoff_attempts").default(0).notNull(),
  
  // Errand revision grace window
  revisionRequestedAt: timestamp("revision_requested_at"),
  revisionNotes: text("revision_notes"),
  revisionGraceExpiresAt: timestamp("revision_grace_expires_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusLocationIdx: index("errand_status_loc_idx").on(table.status, table.locationState, table.locationArea),
  employerIdx: index("errand_employer_idx").on(table.employerId),
}));

// ==========================================
// Quotes Table (Single Source of Truth for Pricing)
// ==========================================
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  selectionId: uuid("selection_id").references(() => selections.id),
  errandId: uuid("errand_id").references(() => errands.id),
  type: text("type").notNull(), // "agency_fee" | "errand"
  
  workerPayoutKobo: bigint("worker_payout_kobo", { mode: "number" }).notNull(),
  commissionKobo: bigint("commission_kobo", { mode: "number" }).notNull(),
  totalKobo: bigint("total_kobo", { mode: "number" }).notNull(),
  
  commissionMode: text("commission_mode").notNull(), // "percentage" | "fixed_override"
  commissionRateBasisPoints: integer("commission_rate_basis_points"),
  floorUsedKobo: bigint("floor_used_kobo", { mode: "number" }),
  currency: text("currency").default("NGN").notNull(),
  version: integer("version").default(1).notNull(),
  status: text("status").default("draft").notNull(), // draft | sent | accepted | declined | superseded | paid
  
  createdBy: uuid("created_by").references(() => users.id),
  reason: text("reason"),
  cancellationPolicy: text("cancellation_policy").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  targetCheck: check("quote_target_check", sql`(${table.selectionId} IS NOT NULL AND ${table.errandId} IS NULL) OR (${table.selectionId} IS NULL AND ${table.errandId} IS NOT NULL)`),
  selectionIdx: index("quote_selection_idx").on(table.selectionId),
  errandIdx: index("quote_errand_idx").on(table.errandId),
  statusIdx: index("quote_status_idx").on(table.status),
}));

// ==========================================
// Payments (With Escrow & Refund Tracking)
// ==========================================
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").references(() => quotes.id),
  selectionId: uuid("selection_id").references(() => selections.id),
  errandId: uuid("errand_id").references(() => errands.id),
  adminId: uuid("admin_id").references(() => users.id),
  
  // Paystack / Payment provider fields
  provider: text("provider").default("paystack").notNull(),
  paystackReference: text("paystack_reference").unique().notNull(), // Transaction reference
  providerReference: text("provider_reference"), // Provider external transaction id
  providerStatus: text("provider_status"), // success, failed, abandoned
  currency: text("currency").default("NGN").notNull(),
  mode: text("mode").default("test").notNull(), // "test" | "live"
  source: text("source").default("paystack").notNull(), // "paystack" | "manual"
  manualReason: text("manual_reason"), // Reason if source = manual (admin action)

  amount: doublePrecision("amount").notNull(), // Legacy column (retaining during phase migration)
  totalKobo: bigint("total_kobo", { mode: "number" }),
  workerPayoutKobo: bigint("worker_payout_kobo", { mode: "number" }),
  commissionKobo: bigint("commission_kobo", { mode: "number" }),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  expiresAt: timestamp("expires_at"), // Expiry for in-flight payment lock (abandoned payments release lock)
  verifiedAt: timestamp("verified_at"),
  workerReleasedAt: timestamp("worker_released_at"),
  
  // Refund tracking
  refundStatus: text("refund_status").default("NONE").notNull(), // NONE | PENDING | PROCESSED | FAILED
  refundAmountKobo: bigint("refund_amount_kobo", { mode: "number" }).default(0).notNull(),
  refundedAt: timestamp("refunded_at"),
  refundReference: text("refund_reference"),
  refundReason: text("refund_reason"),
}, (table) => ({
  quoteIdx: index("payment_quote_idx").on(table.quoteId),
  errandIdx: index("payment_errand_idx").on(table.errandId),
  statusIdx: index("payment_status_idx").on(table.status),
  verifiedQuoteUnique: uniqueIndex("payments_verified_quote_idx")
    .on(table.quoteId)
    .where(sql`${table.status} = 'VERIFIED' AND ${table.quoteId} IS NOT NULL`),
  verifiedSelectionUnique: uniqueIndex("payments_verified_selection_idx")
    .on(table.selectionId)
    .where(sql`${table.status} = 'VERIFIED' AND ${table.selectionId} IS NOT NULL`),
  verifiedErrandUnique: uniqueIndex("payments_verified_errand_idx")
    .on(table.errandId)
    .where(sql`${table.status} = 'VERIFIED' AND ${table.errandId} IS NOT NULL`),
  targetCheck: check("payments_target_check", sql`(${table.quoteId} IS NOT NULL)::int + (${table.errandId} IS NOT NULL)::int + (${table.selectionId} IS NOT NULL)::int >= 1`),
}));

// ==========================================
// Payment Events (Append-Only Financial Ledger)
// ==========================================
export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id).notNull(),
  eventType: text("event_type").notNull(), // ESCROW_HELD | RELEASED_TO_WORKER | REFUNDED_TO_EMPLOYER | COMMISSION_RETAINED | STIPEND_PAID
  amountKobo: bigint("amount_kobo", { mode: "number" }).notNull(),
  actorType: text("actor_type").notNull(), // EMPLOYER | WORKER | ADMIN | SYSTEM
  actorId: uuid("actor_id").references(() => users.id),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Webhook Events (Paystack Idempotency Registry)
// ==========================================
export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").unique().notNull(), // Paystack event ID or reference
  eventType: text("event_type").notNull(), // charge.success | transfer.success | transfer.failed | transfer.reversed
  provider: text("provider").default("paystack").notNull(),
  payload: json("payload").notNull(),
  status: text("status").default("pending").notNull(), // pending | processed | ignored | failed
  error: text("error"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Worker Bank Accounts (Encrypted & Masked)
// ==========================================
export const workerBankAccounts = pgTable("worker_bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  accountNumberEncrypted: text("account_number_encrypted").notNull(),
  accountNumberIv: text("account_number_iv").notNull(),
  accountNumberTag: text("account_number_tag").notNull(),
  keyVersion: integer("key_version").default(1).notNull(),
  accountNumberMasked: text("account_number_masked").notNull(), // e.g. "******7890"
  bankCode: text("bank_code").notNull(), // CBN bank code (e.g. "058" for GTB, "011" for First Bank)
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNameResolved: text("account_name_resolved"), // Non-gating resolved name from Paystack (shown to admin on payout screen only)
  paystackRecipientCode: text("paystack_recipient_code"), // generated via /transferrecipient in background or at first payout
  isActive: boolean("is_active").default(true).notNull(),
  payoutHoldUntil: timestamp("payout_hold_until"), // null on signup; NOW() + 24h when replacing existing account
  deactivatedAt: timestamp("deactivated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  workerProfileIdx: index("worker_bank_profile_idx").on(table.workerProfileId),
}));

// ==========================================
// Payouts (Paystack Transfers Tracking)
// ==========================================
export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  quoteId: uuid("quote_id").references(() => quotes.id).notNull(),
  errandId: uuid("errand_id").references(() => errands.id),
  amountKobo: bigint("amount_kobo", { mode: "number" }).notNull(),
  currency: text("currency").default("NGN").notNull(),
  status: text("status").default("pending").notNull(), // pending | processing | success | failed | reversed | needs_bank_fix
  transferReference: text("transfer_reference").unique(),
  transferCode: text("transfer_code"), // Paystack transfer code (TRF_xxx)
  recipientCode: text("recipient_code"), // Paystack transfer recipient code (RCP_xxx) (nullable before creation)
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0).notNull(),
  initiatedBy: uuid("initiated_by").references(() => users.id),
  initiatedAt: timestamp("initiated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Errand Matching Offers
// ==========================================
export const errandOffers = pgTable("errand_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  errandId: uuid("errand_id").references(() => errands.id).notNull(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  round: integer("round").default(1).notNull(),
  status: text("status").default("offered").notNull(), // offered | claimed | declined | expired | superseded
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueOfferRound: uniqueIndex("unique_errand_worker_round_idx").on(table.errandId, table.workerProfileId, table.round),
}));

// ==========================================
// Errand Proofs (Private Storage Keys)
// ==========================================
export const errandProofs = pgTable("errand_proofs", {
  id: uuid("id").primaryKey().defaultRandom(),
  errandId: uuid("errand_id").references(() => errands.id).notNull(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  photoKeys: text("photo_keys").array().notNull(), // Storage keys, not public URLs
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// ==========================================
// Errand Disputes (With Exact Split Sum Validation)
// ==========================================
export const errandDisputes = pgTable("errand_disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  errandId: uuid("errand_id").references(() => errands.id).notNull(),
  raisedByUserId: uuid("raised_by_user_id").references(() => users.id).notNull(),
  initiatorRole: text("initiator_role").default("EMPLOYER"),
  reason: text("reason").notNull(),
  description: text("description"),
  evidenceUrls: text("evidence_urls").array(),
  status: text("status").default("open").notNull(), // open | resolved_refund | resolved_payout | resolved_partial | dismissed
  
  quoteTotalKobo: bigint("quote_total_kobo", { mode: "number" }).default(0).notNull(),
  workerPayoutKobo: bigint("worker_payout_kobo", { mode: "number" }).default(0).notNull(),
  employerRefundKobo: bigint("employer_refund_kobo", { mode: "number" }).default(0).notNull(),
  platformFeeKobo: bigint("platform_fee_kobo", { mode: "number" }).default(0).notNull(),
  
  resolutionNotes: text("resolution_notes"),
  resolvedByAdminId: uuid("resolved_by_admin_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// In-App Errand Chat Threads & Messages
// ==========================================
export const errandThreads = pgTable("errand_threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  errandId: uuid("errand_id").references(() => errands.id).unique().notNull(),
  employerId: uuid("employer_id").references(() => users.id).notNull(),
  workerProfileId: uuid("worker_profile_id").references(() => workerProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const errandMessages = pgTable("errand_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id").references(() => errandThreads.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  status: text("status").default("sent").notNull(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Placements & Replacements
// ==========================================
export const placements = pgTable("placements", {
  id: uuid("id").primaryKey().defaultRandom(),
  selectionId: uuid("selection_id").references(() => selections.id).unique().notNull(),
  startDate: timestamp("start_date").notNull(),
  status: placementStatusEnum("status").default("ACTIVE").notNull(),
  replacementDeadline: timestamp("replacement_deadline").notNull(),
});

export const replacementRequests = pgTable("replacement_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id).notNull(),
  reason: text("reason").notNull(),
  dueAt: timestamp("due_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const removalNotices = pgTable("removal_notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id).notNull(),
  noticeDate: timestamp("notice_date").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Ratings (Reused for Placements & Errands)
// ==========================================
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id),
  errandId: uuid("errand_id").references(() => errands.id),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  moderated: boolean("moderated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ratingTargetCheck: check("rating_target_check", sql`(${table.placementId} IS NOT NULL AND ${table.errandId} IS NULL) OR (${table.placementId} IS NULL AND ${table.errandId} IS NOT NULL)`),
}));

// ==========================================
// Messaging & Notifications
// ==========================================
export const threads = pgTable("threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerId: uuid("employer_id").references(() => users.id).notNull(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id").references(() => threads.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  link: text("link"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  endpoint: text("endpoint").notNull(),
  keys: json("keys").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// Audit Logs
// ==========================================
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Contact Access Logs (Formal Placements Phone Reveals)
// ==========================================
export const contactAccessLogs = pgTable("contact_access_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id).notNull(),
  actorRole: text("actor_role").notNull(), // "EMPLOYER" | "ADMIN"
  targetWorkerId: uuid("target_worker_id").references(() => workerProfiles.id).notNull(),
  placementId: uuid("placement_id").references(() => placements.id).notNull(),
  fieldAccessed: text("field_accessed").default("PHONE_NUMBER").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  actorIdx: index("contact_access_actor_idx").on(table.actorId, table.createdAt),
  placementIdx: index("contact_access_placement_idx").on(table.placementId),
}));

// ==========================================
// Admin Profiles & Team Management
// ==========================================
export const adminProfiles = pgTable("admin_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique().notNull(),
  fullName: text("full_name").notNull(),
  adminRole: text("admin_role").default("ADMIN").notNull(), // "SUPER_ADMIN" | "ADMIN"
  slotNumber: integer("slot_number"), // 1, 2, 3 for initial super admin slots
  invitedBy: uuid("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Admin Access Invites
// ==========================================
export const adminInvites = pgTable("admin_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  email: text("email"), // optional restricted recipient email
  role: text("role").default("ADMIN").notNull(), // "ADMIN" | "SUPER_ADMIN"
  createdById: uuid("created_by_id").references(() => users.id).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedById: uuid("used_by_id").references(() => users.id),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


