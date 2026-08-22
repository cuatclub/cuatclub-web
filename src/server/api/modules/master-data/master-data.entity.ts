import type { affiliations } from "@/server/db/schema/affiliations";
import type { categories } from "@/server/db/schema/categories";

export type AffiliationRow = typeof affiliations.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
