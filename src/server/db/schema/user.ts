import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["STUDENT", "CLUB", "ADMIN"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default("STUDENT").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
