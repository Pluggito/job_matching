CREATE TABLE IF NOT EXISTS "direct_payment_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"placement_id" uuid,
	"errand_id" uuid,
	"employer_id" uuid NOT NULL,
	"worker_profile_id" uuid NOT NULL,
	"amount_kobo" bigint NOT NULL,
	"receipt_url" text NOT NULL,
	"reference" text,
	"notes" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"worker_confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "direct_proof_target_check" CHECK (("direct_payment_proofs"."placement_id" IS NOT NULL AND "direct_payment_proofs"."errand_id" IS NULL) OR ("direct_payment_proofs"."placement_id" IS NULL AND "direct_payment_proofs"."errand_id" IS NOT NULL))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "direct_payment_proofs" ADD CONSTRAINT "direct_payment_proofs_placement_id_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "direct_payment_proofs" ADD CONSTRAINT "direct_payment_proofs_errand_id_errands_id_fk" FOREIGN KEY ("errand_id") REFERENCES "public"."errands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "direct_payment_proofs" ADD CONSTRAINT "direct_payment_proofs_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "direct_payment_proofs" ADD CONSTRAINT "direct_payment_proofs_worker_profile_id_worker_profiles_id_fk" FOREIGN KEY ("worker_profile_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "direct_proof_placement_idx" ON "direct_payment_proofs" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "direct_proof_errand_idx" ON "direct_payment_proofs" USING btree ("errand_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "direct_proof_worker_idx" ON "direct_payment_proofs" USING btree ("worker_profile_id");
