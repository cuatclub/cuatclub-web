CREATE TYPE "public"."activity_audience" AS ENUM('CHULA_STUDENT', 'GENERAL_PUBLIC');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"activity_type_id" smallint NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"poster_url" text,
	"audiences" "activity_audience"[] DEFAULT '{}' NOT NULL,
	"year_levels" smallint[] DEFAULT '{}' NOT NULL,
	"faculty_id" smallint,
	"application_start_at" timestamp with time zone,
	"application_end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_categories" (
	"activity_id" uuid NOT NULL,
	"category_id" smallint NOT NULL,
	CONSTRAINT "activity_categories_activity_id_category_id_pk" PRIMARY KEY("activity_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "activity_types" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "activity_types_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "faculties_label_unique" UNIQUE("label")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_activity_type_id_activity_types_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "public"."activity_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_club_id_idx" ON "activities" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "activities_activity_type_id_idx" ON "activities" USING btree ("activity_type_id");--> statement-breakpoint
CREATE INDEX "activities_faculty_id_idx" ON "activities" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "activity_categories_category_id_idx" ON "activity_categories" USING btree ("category_id");