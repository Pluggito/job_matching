-- Drop deprecated direct_payment_proofs table per explicit client instructions
DROP TABLE IF EXISTS "direct_payment_proofs" CASCADE;
--> statement-breakpoint

-- Add errand price & fee snapshot columns to errands table
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "creation_fee_kobo" bigint;
--> statement-breakpoint
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "task_price_kobo" bigint;
--> statement-breakpoint
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "commission_bps" integer DEFAULT 3000 NOT NULL;
--> statement-breakpoint
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "worker_payout_kobo" bigint;
--> statement-breakpoint
ALTER TABLE "errands" ADD COLUMN IF NOT EXISTS "unclaimed_expires_at" timestamp;
--> statement-breakpoint

-- Add errand_id FK and hardening to payments table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "errand_id" uuid;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_errand_id_errands_id_fk'
  ) THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_errand_id_errands_id_fk"
      FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;
--> statement-breakpoint

-- Partial unique index: Exactly one verified payment per errand
CREATE UNIQUE INDEX IF NOT EXISTS "payments_verified_errand_idx"
  ON "payments" ("errand_id")
  WHERE "status" = 'VERIFIED' AND "errand_id" IS NOT NULL;
--> statement-breakpoint

-- Zero-downtime target check constraint on payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_target_check'
  ) THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_target_check"
      CHECK (("quote_id" IS NOT NULL)::int + ("errand_id" IS NOT NULL)::int + ("selection_id" IS NOT NULL)::int >= 1)
      NOT VALID;
    ALTER TABLE "payments" VALIDATE CONSTRAINT "payments_target_check";
  END IF;
END $$;
