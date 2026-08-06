import { pgTable, smallint, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { clubs } from "./clubs";
import { categories } from "./categories";

export const clubCategories = pgTable(
	"club_categories",
	{
		clubId: uuid("club_id")
			.notNull()
			.references(() => clubs.id, { onDelete: "cascade" }),
		categoryId: smallint("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "restrict" }),
	},
	(t) => [
		primaryKey({ columns: [t.clubId, t.categoryId] }),
		index("club_categories_category_id_idx").on(t.categoryId),
	],
);
