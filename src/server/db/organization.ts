import { pgTable, text, boolean, timestamp, pgEnum, jsonb, smallint } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { faculty } from "./faculty";

export const categoryEnum = pgEnum("category", ["CLUB", "EVENT"]);

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	facultyId: text("faculty_id").references(() => faculty.id),
	categories: categoryEnum("categories").array().default([]).notNull(),
	averageHoursPerWeek: smallint("average_hours_per_week"),
	bio: text("bio"),
	detailedDescription: text("detailed_description"),
	gallery: text("gallery").array().default([]).notNull(),
	recruitmentPeriod: jsonb("recruitment_period").$type<{
		allYear?: boolean;
		start?: Date;
		end?: Date;
	}>(),
	userId: text("user_id")
		.references(() => user.id)
		.notNull(),
	isBanned: boolean("is_banned").default(false).notNull(),
	image: text("image"),
	ownerContact: jsonb("owner_contact")
		.$type<{
			name?: string;
			email?: string;
			phone?: string;
			line?: string;
		}>()
		.default({})
		.notNull(),
	socials: jsonb("socials")
		.$type<{
			signUpForm?: string;
			discord?: string;
			instagram?: string;
			facebook?: string;
			tiktok?: string;
			line?: string;
		}>()
		.default({})
		.notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
