DO $$ BEGIN
 CREATE TYPE "public"."availability_status" AS ENUM('AVAILABLE_NOW', 'AVAILABLE_FROM', 'BUSY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."engagement_type" AS ENUM('ONSITE', 'REMOTE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hiring_request_status" AS ENUM('OPEN', 'FILLED', 'CLOSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hiring_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"required_skills" text[] NOT NULL,
	"preferred_skills" text[] NOT NULL,
	"min_experience_years" integer NOT NULL,
	"location_state" text NOT NULL,
	"location_area" text NOT NULL,
	"engagement_type" "engagement_type" NOT NULL,
	"start_date" timestamp NOT NULL,
	"budget_min" double precision NOT NULL,
	"budget_max" double precision NOT NULL,
	"workers_needed" integer NOT NULL,
	"status" "hiring_request_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD COLUMN "profile_data" json;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "location_state" text;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "location_area" text;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "availability_status" "availability_status" DEFAULT 'AVAILABLE_NOW' NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "available_from" timestamp;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "profile_data" json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hiring_requests" ADD CONSTRAINT "hiring_requests_employer_id_employer_profiles_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "worker_smart_match_idx" ON "worker_profiles" USING btree ("category","status","location_state","availability_status");