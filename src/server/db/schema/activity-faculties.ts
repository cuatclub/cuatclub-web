import { pgTable, smallint, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { activities } from "./activities";
import { faculties } from "./faculties";

export const activityFaculties = pgTable(
  "activity_faculties",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    facultyId: smallint("faculty_id")
      .notNull()
      .references(() => faculties.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.activityId, t.facultyId] }),
    index("activity_faculties_faculty_id_idx").on(t.facultyId),
  ]
);
