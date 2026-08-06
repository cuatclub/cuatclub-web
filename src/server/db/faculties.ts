import { pgTable, smallserial, text } from "drizzle-orm/pg-core";

export const faculties = pgTable("faculties", {
	id: smallserial("id").primaryKey(),
	label: text("label").notNull().unique(),
});
