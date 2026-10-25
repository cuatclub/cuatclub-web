import { pgTable, text, timestamp, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { user } from "./user";
import { activities } from "./activities";

export const savedActivities = pgTable(
  "saved_activities",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.activityId] }),
    index("saved_activities_activity_id_idx").on(t.activityId),
  ]
);
