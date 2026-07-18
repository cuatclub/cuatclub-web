import { primaryKey, text, timestamp, pgTable } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { post } from "./post";

export const eventReminderDelivery = pgTable(
	"event_reminder_delivery",
	{
		userId: text("user_id")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		postId: text("post_id")
			.references(() => post.id, { onDelete: "cascade" })
			.notNull(),
		claimedAt: timestamp("claimed_at", { withTimezone: true }).defaultNow().notNull(),
		sentAt: timestamp("sent_at", { withTimezone: true }),
	},
	(table) => [primaryKey({ columns: [table.userId, table.postId] })],
);
