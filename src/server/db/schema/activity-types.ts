import { pgTable, smallserial, text } from "drizzle-orm/pg-core";

export const activityTypes = pgTable("activity_types", {
  id: smallserial("id").primaryKey(),
  label: text("label").notNull().unique(),
});
