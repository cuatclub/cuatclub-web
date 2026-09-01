import { pgTable, text, timestamp, uuid, smallint, index, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { clubs } from "./clubs";
import { affiliations } from "./affiliations";
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
    description: text("description"),
    posterUrl: text("poster_url"),
    audiences: activityAudienceEnum("audiences").array().default([]).notNull(),
    yearLevels: smallint("year_levels").array().default([]).notNull(),
    affiliationId: smallint("affiliation_id").references(() => affiliations.id),
    applicationStartAt: timestamp("application_start_at", { withTimezone: true }),
    applicationEndAt: timestamp("application_end_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("activities_club_id_idx").on(t.clubId),
    index("activities_activity_type_id_idx").on(t.activityTypeId),
    index("activities_affiliation_id_idx").on(t.affiliationId),
  ]
);
