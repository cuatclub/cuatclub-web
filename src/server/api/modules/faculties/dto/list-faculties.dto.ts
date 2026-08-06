import type { faculties } from "@/server/db/schema/faculties";

export type Faculty = typeof faculties.$inferSelect;
