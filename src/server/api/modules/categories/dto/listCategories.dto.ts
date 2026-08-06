import type { categories } from "@/server/db/categories";

export type Category = typeof categories.$inferSelect;
