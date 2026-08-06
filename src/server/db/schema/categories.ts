import { pgTable, smallserial, text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
	id: smallserial("id").primaryKey(),
	label: text("label").notNull().unique(),
	fontColor: text("font_color").notNull(),
	backgroundColor: text("background_color").notNull(),
});
