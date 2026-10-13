CREATE TABLE IF NOT EXISTS "contact_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"target_worker_id" uuid NOT NULL,
	"placement_id" uuid NOT NULL,
	"field_accessed" text DEFAULT 'PHONE_NUMBER' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact_access_logs" ADD CONSTRAINT "contact_access_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact_access_logs" ADD CONSTRAINT "contact_access_logs_target_worker_id_worker_profiles_id_fk" FOREIGN KEY ("target_worker_id") REFERENCES "public"."worker_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact_access_logs" ADD CONSTRAINT "contact_access_logs_placement_id_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_access_actor_idx" ON "contact_access_logs" USING btree ("actor_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_access_placement_idx" ON "contact_access_logs" USING btree ("placement_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_verified_quote_idx" ON "payments" USING btree ("quote_id") WHERE (status = 'VERIFIED' AND quote_id IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_verified_selection_idx" ON "payments" USING btree ("selection_id") WHERE (status = 'VERIFIED' AND selection_id IS NOT NULL);
