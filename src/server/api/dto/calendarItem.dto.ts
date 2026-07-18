import type { calendarItem } from "@/server/db/calendarItem";
import { z } from "zod";

export type CalendarItem = typeof calendarItem.$inferSelect;

export type CreateCalendarItemRequest = Omit<typeof calendarItem.$inferInsert, "id" | "createdAt" | "updatedAt">;

export const CreateCalendarItemRequestSchema = z.object({
	postId: z.string().uuid(),
});

export const UpdateCalendarItemRequestSchema = z.object({
	id: z.string().uuid(),
	postId: z.string().uuid().optional(),
});
