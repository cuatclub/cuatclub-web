import { pgTable, smallint, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { students } from "./students";
import { categories } from "./categories";

export const studentCategories = pgTable(
  "student_categories",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    categoryId: smallint("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.categoryId] }),
    index("student_categories_category_id_idx").on(t.categoryId),
  ]
);
