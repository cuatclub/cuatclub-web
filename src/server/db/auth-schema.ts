import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { faculty } from "./faculty";

export const roleEnum = pgEnum("role", ["ATTENDEE", "ORGANIZATION", "ADMIN", "CLUB"]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").default("").notNull(),
	username: text("username").unique(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	facultyId: text("faculty_id").references(() => faculty.id),
	isReceiveMail: boolean("is_receive_mail").default(false).notNull(),
	/** Granular notification preferences; only meaningful when isReceiveMail is true. */
	notifyEventReminders: boolean("notify_event_reminders").default(true).notNull(),
	notifyMatchingEvents: boolean("notify_matching_events").default(true).notNull(),
	notifyClubUpdates: boolean("notify_club_updates").default(true).notNull(),
	role: roleEnum("role").default("ATTENDEE").notNull(),
	/** Role-specific onboarding wizard finished; middleware uses role to pick redirect path. */
	onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
