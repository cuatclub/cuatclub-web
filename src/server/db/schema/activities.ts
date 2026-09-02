import {
  pgTable,
  text,
  timestamp,
  uuid,
  smallint,
  index,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { clubs } from "./clubs";
import { activityTypes } from "./activity-types";

export const activityAudienceEnum = pgEnum("activity_audience", [
  "CHULA_STUDENT",
  "GENERAL_PUBLIC",
]);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    activityTypeId: smallint("activity_type_id")
      .notNull()
      .references(() => activityTypes.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    posterUrl: text("poster_url").notNull(),
    audience: activityAudienceEnum("audience").notNull(),
    yearLevels: smallint("year_levels").array().default([]).notNull(),
    facultyIds: smallint("faculty_ids").array().default([]).notNull(),
    applicationFormUrl: text("application_form_url").notNull(),
    applicationStartAt: timestamp("application_start_at", { withTimezone: true }).notNull(),
    applicationEndAt: timestamp("application_end_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("activities_club_id_idx").on(t.clubId),
    index("activities_activity_type_id_idx").on(t.activityTypeId),
    index("activities_audience_idx").on(t.audience),
    index("activities_year_levels_idx").using("gin", t.yearLevels),
    index("activities_faculty_ids_idx").using("gin", t.facultyIds),
    check(
      "activities_application_window_check",
      sql`${t.applicationEndAt} >= ${t.applicationStartAt}`
    ),
  ]
);
