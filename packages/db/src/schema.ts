import { 
  pgTable, text, timestamp, uuid, pgEnum, integer, doublePrecision, boolean, json, index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  status: workerStatusEnum("status").default("PENDING").notNull(),
  ninVerificationStatus: text("nin_verification_status").notNull(),
  ninVerificationRef: text("nin_verification_ref"),
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
  businessName: text("business_name").notNull(),
  location: text("location").notNull(),
  hiringNeeds: text("hiring_needs").notNull(),
  profileData: json("profile_data"),
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
  status: selectionStatusEnum("status").default("PENDING").notNull(),
  feeAmount: doublePrecision("fee_amount").notNull(),
  termsVersion: text("terms_version").notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at"),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  selectionId: uuid("selection_id").references(() => selections.id).unique().notNull(),
  paystackReference: text("paystack_reference").unique().notNull(),
  amount: doublePrecision("amount").notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  verifiedAt: timestamp("verified_at"),
});

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const removalNotices = pgTable("removal_notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id).notNull(),
  noticeDate: timestamp("notice_date").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id).notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  moderated: boolean("moderated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  endpoint: text("endpoint").notNull(),
  keys: json("keys").notNull(),
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
  workersNeeded: integer("workers_needed").notNull(),
  status: hiringRequestStatusEnum("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
