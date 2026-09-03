CREATE TYPE "public"."activity_audience" AS ENUM('CHULA_STUDENT', 'GENERAL_PUBLIC');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"activity_type_id" smallint NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"poster_url" text NOT NULL,
	"audience" "activity_audience" NOT NULL,
	"year_levels" smallint[] DEFAULT '{}' NOT NULL,
	"application_form_url" text NOT NULL,
	"application_start_at" timestamp with time zone NOT NULL,
	"application_end_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_application_window_check" CHECK ("activities"."application_end_at" >= "activities"."application_start_at")
);
--> statement-breakpoint
CREATE TABLE "activity_categories" (
	"activity_id" uuid NOT NULL,
	"category_id" smallint NOT NULL,
	CONSTRAINT "activity_categories_activity_id_category_id_pk" PRIMARY KEY("activity_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "activity_faculties" (
	"activity_id" uuid NOT NULL,
	"faculty_id" smallint NOT NULL,
	CONSTRAINT "activity_faculties_activity_id_faculty_id_pk" PRIMARY KEY("activity_id","faculty_id")
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
ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_faculties" ADD CONSTRAINT "activity_faculties_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_faculties" ADD CONSTRAINT "activity_faculties_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_club_id_idx" ON "activities" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "activities_activity_type_id_idx" ON "activities" USING btree ("activity_type_id");--> statement-breakpoint
CREATE INDEX "activities_audience_idx" ON "activities" USING btree ("audience");--> statement-breakpoint
CREATE INDEX "activities_year_levels_idx" ON "activities" USING gin ("year_levels");--> statement-breakpoint
CREATE INDEX "activity_categories_category_id_idx" ON "activity_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "activity_faculties_faculty_id_idx" ON "activity_faculties" USING btree ("faculty_id");