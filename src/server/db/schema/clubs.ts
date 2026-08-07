import { pgTable, text, timestamp, uuid, smallint, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./user";
import { faculties } from "./faculties";

export const clubRegistrationStatusEnum = pgEnum("club_registration_status", [
  "PENDING",
  "INFO_SUBMITTED",
  "COMPLETED",
]);

export const clubs = pgTable("clubs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  registrationStatus: clubRegistrationStatusEnum("registration_status")
    .notNull()
    .default("PENDING"),
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
});
