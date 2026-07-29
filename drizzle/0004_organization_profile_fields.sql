ALTER TABLE "organization" ALTER COLUMN "socials" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
UPDATE "organization" SET "socials" = '{}'::jsonb WHERE "socials" IS NULL;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "socials" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "categories" "category"[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "detailed_description" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "gallery" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "owner_contact" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "organization" SET "categories" = ARRAY["category"];--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "category";
