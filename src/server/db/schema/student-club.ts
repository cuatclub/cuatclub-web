import { index, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { clubs } from "./clubs";
import { students } from "./students";

export const studentClub = pgTable(
  "student_club",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.clubId] }),
    index("student_club_club_id_idx").on(t.clubId),
  ]
);
