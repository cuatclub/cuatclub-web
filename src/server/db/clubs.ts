import { pgTable, text, timestamp, uuid, smallint, jsonb, pgEnum, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";
import { faculties } from "./faculties";

export const clubRegistrationStatusEnum = pgEnum("club_registration_status", [
	"PENDING",
	"INFO_SUBMITTED",
	"COMPLETED",
]);

export const clubs = pgTable(
	"clubs",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id),
		email: text("email").notNull().unique(),
		registrationStatus: clubRegistrationStatusEnum("registration_status").notNull().default("PENDING"),
		name: text("name"),
		logoUrl: text("logo_url"),
		facultyId: smallint("faculty_id").references(() => faculties.id),
		shortDescription: text("short_description"),
		longDescription: text("long_description"),
		imageUrls: text("image_urls").array().default([]).notNull(),
		contacts: jsonb("contacts").$type<{
			instagram?: string;
			facebook?: string;
			tiktok?: string;
			line_oa?: string;
		}>(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		index("clubs_faculty_id_idx").on(t.facultyId),
		index("clubs_status_idx").on(t.registrationStatus),
		check("clubs_short_description_len", sql`${t.shortDescription} IS NULL OR char_length(${t.shortDescription}) <= 180`),
		check("clubs_image_urls_max5", sql`cardinality(${t.imageUrls}) <= 5`),
		check(
			"clubs_contacts_is_object",
			sql`${t.contacts} IS NULL OR jsonb_typeof(${t.contacts}) = 'object'`,
		),
		check(
			"clubs_contacts_keys",
			sql`${t.contacts} IS NULL OR ${t.contacts} - 'instagram' - 'facebook' - 'tiktok' - 'line_oa' = '{}'::jsonb`,
		),
		check(
			"clubs_info_complete",
			sql`${t.registrationStatus} = 'PENDING' OR (
				${t.name} IS NOT NULL AND
				${t.logoUrl} IS NOT NULL AND
				${t.facultyId} IS NOT NULL AND
				${t.shortDescription} IS NOT NULL AND
				${t.longDescription} IS NOT NULL
			)`,
		),
	],
);
