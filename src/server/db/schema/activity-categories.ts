import { pgTable, smallint, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { activities } from "./activities";
import { categories } from "./categories";

export const activityCategories = pgTable(
  "activity_categories",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    categoryId: smallint("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.activityId, t.categoryId] }),
    index("activity_categories_category_id_idx").on(t.categoryId),
  ]
);
