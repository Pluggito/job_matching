-- Phase 1 Migration: Financial Engine, In-flight Payment Row Expiry, Offline NUBAN, and AES-256-GCM Bank Details

-- 1. Payments: in-flight expiry lock and retry index
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_quote_id_unique";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_quote_idx" ON "payments" USING btree ("quote_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payments" USING btree ("status");
--> statement-breakpoint

-- 2. Worker Bank Accounts: AES-256-GCM encryption fields, payout hold, and removal of unneeded verification flags
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "account_number_iv" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "account_number_tag" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "key_version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "account_name_resolved" text;
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "payout_hold_until" timestamp;
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" ADD COLUMN IF NOT EXISTS "deactivated_at" timestamp;
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" DROP COLUMN IF EXISTS "is_verified";
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" DROP COLUMN IF EXISTS "verified_at";
--> statement-breakpoint
ALTER TABLE "worker_bank_accounts" DROP CONSTRAINT IF EXISTS "worker_bank_accounts_worker_profile_id_unique";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "worker_bank_profile_idx" ON "worker_bank_accounts" USING btree ("worker_profile_id");
--> statement-breakpoint

-- 3. Payouts: allow nullable recipient_code before just-in-time creation
ALTER TABLE "payouts" ALTER COLUMN "recipient_code" DROP NOT NULL;
