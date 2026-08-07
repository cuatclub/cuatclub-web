import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const invitationCodes = pgTable(
  "invitation_codes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    inviteCode: text("invite_code").notNull().unique(),
    expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("invitation_codes_email_idx").on(t.email)]
);
