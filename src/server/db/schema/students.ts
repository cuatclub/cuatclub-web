import { pgTable, text, timestamp, uuid, smallint, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./user";
import { faculties } from "./faculties";

export const studentStatusEnum = pgEnum("student_status", ["CHULA", "OTHER_UNIVERSITY"]);

export const studentRegistrationStatusEnum = pgEnum("student_registration_status", [
  "PENDING",
  "GENERAL_SUBMITTED",
  "PREFERENCES_SUBMITTED",
  "COMPLETED",
]);

export const referralSourceEnum = pgEnum("referral_source", [
  "FRIEND",
  "UNIVERSITY_EVENT",
  "INSTAGRAM",
  "TIKTOK",
  "LINE",
  "OTHER",
]);

export const students = pgTable("students", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  registrationStatus: studentRegistrationStatusEnum("registration_status")
    .notNull()
    .default("PENDING"),
  status: studentStatusEnum("status"),
  username: text("username").unique(),
  facultyId: smallint("faculty_id").references(() => faculties.id),
  yearLevel: smallint("year_level"),
  university: text("university"),
  referralSource: referralSourceEnum("referral_source"),
  referralOther: text("referral_other"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
