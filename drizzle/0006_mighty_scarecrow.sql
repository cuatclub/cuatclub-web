ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "clubs" DROP CONSTRAINT "clubs_email_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_faculty_id_faculties_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STUDENT'::text;--> statement-breakpoint
UPDATE "user" SET "role" = 'STUDENT' WHERE "role" = 'ATTENDEE';--> statement-breakpoint
UPDATE "user" SET "role" = 'CLUB' WHERE "role" = 'ORGANIZATION';--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('STUDENT', 'CLUB', 'ADMIN');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STUDENT'::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "faculty_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_receive_mail";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "notify_event_reminders";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "notify_matching_events";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "notify_club_updates";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "onboarding_complete";--> statement-breakpoint
ALTER TABLE "clubs" DROP COLUMN "email";