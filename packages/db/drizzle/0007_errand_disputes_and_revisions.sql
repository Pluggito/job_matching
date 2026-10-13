-- 1. Add revision grace window columns to errands
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "revision_requested_at" timestamp;
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "revision_notes" text;
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "revision_grace_expires_at" timestamp;

-- 2. Create or alter errand_disputes table
CREATE TABLE IF NOT EXISTS "errand_disputes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "errand_id" uuid NOT NULL REFERENCES "errands"("id") ON DELETE CASCADE,
  "raised_by_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "initiator_role" text DEFAULT 'EMPLOYER',
  "reason" text NOT NULL,
  "description" text,
  "evidence_urls" text[],
  "status" text NOT NULL DEFAULT 'open',
  "quote_total_kobo" bigint NOT NULL DEFAULT 0,
  "worker_payout_kobo" bigint NOT NULL DEFAULT 0,
  "employer_refund_kobo" bigint NOT NULL DEFAULT 0,
  "platform_fee_kobo" bigint NOT NULL DEFAULT 0,
  "resolution_notes" text,
  "resolved_by_admin_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "resolved_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "errand_disputes" ADD COLUMN IF NOT EXISTS "initiator_role" text DEFAULT 'EMPLOYER';
ALTER TABLE "errand_disputes" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "errand_disputes" ADD COLUMN IF NOT EXISTS "evidence_urls" text[];
ALTER TABLE "errand_disputes" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- 3. Create indices on errand_disputes
CREATE INDEX IF NOT EXISTS "errand_disputes_errand_idx" ON "errand_disputes"("errand_id");
CREATE INDEX IF NOT EXISTS "errand_disputes_status_idx" ON "errand_disputes"("status");
