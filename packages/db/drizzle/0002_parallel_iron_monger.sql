CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errand_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"errand_id" uuid NOT NULL,
	"raised_by_user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"quote_total_kobo" bigint NOT NULL,
	"worker_payout_kobo" bigint DEFAULT 0 NOT NULL,
	"employer_refund_kobo" bigint DEFAULT 0 NOT NULL,
	"platform_fee_kobo" bigint DEFAULT 0 NOT NULL,
	"resolution_notes" text,
	"resolved_by_admin_id" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errand_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errand_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"errand_id" uuid NOT NULL,
	"worker_profile_id" uuid NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'offered' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errand_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"errand_id" uuid NOT NULL,
	"worker_profile_id" uuid NOT NULL,
	"photo_keys" text[] NOT NULL,
	"notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errand_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"errand_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"worker_profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "errand_threads_errand_id_unique" UNIQUE("errand_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"location_state" text NOT NULL,
	"location_area" text NOT NULL,
	"address" text NOT NULL,
	"dropoff_address" text,
	"budget_kobo" bigint NOT NULL,
	"deadline" timestamp NOT NULL,
	"required_proof" text NOT NULL,
	"item_declaration" text,
	"prohibited_items_acknowledged" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"claimed_by_worker_id" uuid,
	"opened_at" timestamp,
	"claimed_at" timestamp,
	"proof_submitted_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"handoff_hmac" text,
	"handoff_attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"amount_kobo" bigint NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" uuid,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid,
	"worker_profile_id" uuid NOT NULL,
	"quote_id" uuid NOT NULL,
	"errand_id" uuid,
	"amount_kobo" bigint NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"transfer_reference" text,
	"transfer_code" text,
	"recipient_code" text NOT NULL,
	"failure_reason" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"initiated_by" uuid,
	"initiated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payouts_transfer_reference_unique" UNIQUE("transfer_reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" json NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"selection_id" uuid,
	"errand_id" uuid,
	"type" text NOT NULL,
	"worker_payout_kobo" bigint NOT NULL,
	"commission_kobo" bigint NOT NULL,
	"total_kobo" bigint NOT NULL,
	"commission_mode" text NOT NULL,
	"commission_rate_basis_points" integer,
	"floor_used_kobo" bigint,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"reason" text,
	"cancellation_policy" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"provider" text DEFAULT 'paystack' NOT NULL,
	"payload" json NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "worker_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_profile_id" uuid NOT NULL,
	"account_number_encrypted" text NOT NULL,
	"account_number_masked" text NOT NULL,
	"bank_code" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_name" text NOT NULL,
	"paystack_recipient_code" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "worker_bank_accounts_worker_profile_id_unique" UNIQUE("worker_profile_id")
);
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_selection_id_unique";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "selection_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "placement_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD COLUMN "business_type" text DEFAULT 'INDIVIDUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "hiring_requests" ADD COLUMN "budget_min_kobo" bigint;--> statement-breakpoint
ALTER TABLE "hiring_requests" ADD COLUMN "budget_max_kobo" bigint;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "quote_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "admin_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "provider" text DEFAULT 'paystack' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "provider_reference" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "provider_status" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" text DEFAULT 'NGN' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "mode" text DEFAULT 'test' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "source" text DEFAULT 'paystack' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "manual_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "total_kobo" bigint;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "worker_payout_kobo" bigint;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "commission_kobo" bigint;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "worker_released_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refund_status" text DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refund_amount_kobo" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refund_reference" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refund_reason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "errand_id" uuid;--> statement-breakpoint
ALTER TABLE "replacement_requests" ADD COLUMN "due_at" timestamp;--> statement-breakpoint
ALTER TABLE "selections" ADD COLUMN "hiring_request_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "expected_pay_kobo" bigint;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "verification_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "open_to_errands" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "errand_preferred_states" text[];--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "errand_preferred_areas" text[];--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "errand_types" text[];--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "errand_min_pay_kobo" bigint;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_disputes" ADD CONSTRAINT "errand_disputes_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_disputes" ADD CONSTRAINT "errand_disputes_raised_by_user_id_users_id_fk" FOREIGN KEY ("raised_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_disputes" ADD CONSTRAINT "errand_disputes_resolved_by_admin_id_users_id_fk" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_messages" ADD CONSTRAINT "errand_messages_thread_id_errand_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."errand_threads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_messages" ADD CONSTRAINT "errand_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_offers" ADD CONSTRAINT "errand_offers_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_offers" ADD CONSTRAINT "errand_offers_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_proofs" ADD CONSTRAINT "errand_proofs_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_proofs" ADD CONSTRAINT "errand_proofs_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_threads" ADD CONSTRAINT "errand_threads_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_threads" ADD CONSTRAINT "errand_threads_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errand_threads" ADD CONSTRAINT "errand_threads_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errands" ADD CONSTRAINT "errands_employer_id_employer_profiles_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errands" ADD CONSTRAINT "errands_claimed_by_worker_id_worker_profiles_id_fk" FOREIGN KEY ("claimed_by_worker_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "errands" ADD CONSTRAINT "errands_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotes" ADD CONSTRAINT "quotes_selection_id_selections_id_fk" FOREIGN KEY ("selection_id") REFERENCES "public"."selections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotes" ADD CONSTRAINT "quotes_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "worker_bank_accounts" ADD CONSTRAINT "worker_bank_accounts_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_errand_worker_round_idx" ON "errand_offers" USING btree ("errand_id","worker_profile_id","round");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "errand_status_loc_idx" ON "errands" USING btree ("status","location_state","location_area");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "errand_employer_idx" ON "errands" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quote_selection_idx" ON "quotes" USING btree ("selection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quote_errand_idx" ON "quotes" USING btree ("errand_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quote_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "selections" ADD CONSTRAINT "selections_hiring_request_id_hiring_requests_id_fk" FOREIGN KEY ("hiring_request_id") REFERENCES "public"."hiring_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_quote_id_unique" UNIQUE("quote_id");