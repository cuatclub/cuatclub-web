ALTER TABLE "organization" ADD COLUMN "category" "category";--> statement-breakpoint
-- Orgs may carry more than one category; the first element wins and the rest are dropped.
-- Orgs with an empty array fall back to 'CLUB' so the NOT NULL below can be applied.
UPDATE "organization" SET "category" = COALESCE("categories"[1], 'CLUB');--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "categories";
