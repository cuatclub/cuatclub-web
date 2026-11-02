CREATE TYPE "public"."referral_source" AS ENUM('FRIEND', 'UNIVERSITY_EVENT', 'INSTAGRAM', 'TIKTOK', 'LINE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."student_registration_status" AS ENUM('PENDING', 'GENERAL_SUBMITTED', 'PREFERENCES_SUBMITTED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('CHULA', 'OTHER_UNIVERSITY');--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"registration_status" "student_registration_status" DEFAULT 'PENDING' NOT NULL,
	"status" "student_status",
	"username" text,
	"faculty_id" smallint,
	"year_level" smallint,
	"university" text,
	"referral_source" "referral_source",
	"referral_other" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "students_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "student_categories" (
	"student_id" uuid NOT NULL,
	"category_id" smallint NOT NULL,
	CONSTRAINT "student_categories_student_id_category_id_pk" PRIMARY KEY("student_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "student_activity_types" (
	"student_id" uuid NOT NULL,
	"activity_type_id" smallint NOT NULL,
	CONSTRAINT "student_activity_types_student_id_activity_type_id_pk" PRIMARY KEY("student_id","activity_type_id")
);
--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_categories" ADD CONSTRAINT "student_categories_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_categories" ADD CONSTRAINT "student_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_activity_types" ADD CONSTRAINT "student_activity_types_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_activity_types" ADD CONSTRAINT "student_activity_types_activity_type_id_activity_types_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "public"."activity_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_categories_category_id_idx" ON "student_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "student_activity_types_activity_type_id_idx" ON "student_activity_types" USING btree ("activity_type_id");