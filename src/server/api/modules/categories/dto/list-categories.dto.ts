import type { categories } from "@/server/db/schema/categories";

export type Category = typeof categories.$inferSelect;
