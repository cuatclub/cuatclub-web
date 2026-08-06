CREATE TYPE "public"."club_registration_status" AS ENUM('PENDING', 'INFO_SUBMITTED', 'COMPLETED');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'CLUB';--> statement-breakpoint
CREATE TABLE "categories" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"font_color" text NOT NULL,
	"background_color" text NOT NULL,
	CONSTRAINT "categories_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "club_categories" (
	"club_id" uuid NOT NULL,
	"category_id" smallint NOT NULL,
	CONSTRAINT "club_categories_club_id_category_id_pk" PRIMARY KEY("club_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"registration_status" "club_registration_status" DEFAULT 'PENDING' NOT NULL,
	"name" text,
	"logo_url" text,
	"faculty_id" smallint,
	"short_description" text,
	"long_description" text,
	"image_urls" text[] DEFAULT '{}' NOT NULL,
	"contacts" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clubs_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "clubs_email_unique" UNIQUE("email"),
	CONSTRAINT "clubs_short_description_len" CHECK ("clubs"."short_description" IS NULL OR char_length("clubs"."short_description") <= 180),
	CONSTRAINT "clubs_image_urls_max5" CHECK (cardinality("clubs"."image_urls") <= 5),
	CONSTRAINT "clubs_contacts_is_object" CHECK ("clubs"."contacts" IS NULL OR jsonb_typeof("clubs"."contacts") = 'object'),
	CONSTRAINT "clubs_contacts_keys" CHECK ("clubs"."contacts" IS NULL OR "clubs"."contacts" - 'instagram' - 'facebook' - 'tiktok' - 'line_oa' = '{}'::jsonb),
	CONSTRAINT "clubs_info_complete" CHECK ("clubs"."registration_status" = 'PENDING' OR (
				"clubs"."name" IS NOT NULL AND
				"clubs"."logo_url" IS NOT NULL AND
				"clubs"."faculty_id" IS NOT NULL AND
				"clubs"."short_description" IS NOT NULL AND
				"clubs"."long_description" IS NOT NULL
			))
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "faculties_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "invitation_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"invite_code" text NOT NULL,
	"expired_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_codes_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
DROP TABLE "activity_type" CASCADE;--> statement-breakpoint
DROP TABLE "calendar_item" CASCADE;--> statement-breakpoint
DROP TABLE "event_reminder_delivery" CASCADE;--> statement-breakpoint
DROP TABLE "interest" CASCADE;--> statement-breakpoint
DROP TABLE "interest_x_organization" CASCADE;--> statement-breakpoint
DROP TABLE "interest_x_post" CASCADE;--> statement-breakpoint
DROP TABLE "interest_x_user" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
DROP TABLE "user_x_organization" CASCADE;--> statement-breakpoint
ALTER TABLE "club_categories" ADD CONSTRAINT "club_categories_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_categories" ADD CONSTRAINT "club_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "club_categories_category_id_idx" ON "club_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "clubs_faculty_id_idx" ON "clubs" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "clubs_status_idx" ON "clubs" USING btree ("registration_status");--> statement-breakpoint
CREATE INDEX "invitation_codes_email_idx" ON "invitation_codes" USING btree ("email");--> statement-breakpoint
DROP TYPE "public"."category";