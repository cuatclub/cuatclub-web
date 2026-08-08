import { pgTable, smallserial, text } from "drizzle-orm/pg-core";

export const affiliations = pgTable("affiliations", {
  id: smallserial("id").primaryKey(),
  label: text("label").notNull().unique(),
});
