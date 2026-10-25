import { pgTable, smallint, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { students } from "./students";
import { activityTypes } from "./activity-types";

export const studentActivityTypes = pgTable(
  "student_activity_types",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    activityTypeId: smallint("activity_type_id")
      .notNull()
      .references(() => activityTypes.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.activityTypeId] }),
    index("student_activity_types_activity_type_id_idx").on(t.activityTypeId),
  ]
);
