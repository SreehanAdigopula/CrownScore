CREATE TABLE "check_ins" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"treatment_week" integer NOT NULL,
	"health_score" integer,
	"status" text NOT NULL,
	"safety_status" text NOT NULL,
	"adherence_rate" real,
	"analysis" jsonb NOT NULL,
	"coach" jsonb NOT NULL,
	"questionnaire" jsonb,
	"safety_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" text DEFAULT 'ANALYSIS' NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "check_ins_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"treatment" text DEFAULT 'MINOXIDIL' NOT NULL,
	"coach_style" text DEFAULT 'SUPPORTIVE' NOT NULL,
	"start_date" date,
	"check_in_frequency" text DEFAULT 'WEEKLY' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"local_migration_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "check_ins_user_captured_idx" ON "check_ins" USING btree ("user_id","captured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "check_ins_owner_id_unique" ON "check_ins" USING btree ("user_id","id");