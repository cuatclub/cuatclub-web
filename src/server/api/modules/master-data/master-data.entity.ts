import type { affiliations } from "@/server/db/schema/affiliations";
import type { categories } from "@/server/db/schema/categories";
import type { activityTypes } from "@/server/db/schema/activity-types";

export type AffiliationRow = typeof affiliations.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ActivityTypeRow = typeof activityTypes.$inferSelect;
