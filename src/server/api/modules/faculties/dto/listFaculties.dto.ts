import type { faculties } from "@/server/db/faculties";

export type Faculty = typeof faculties.$inferSelect;
