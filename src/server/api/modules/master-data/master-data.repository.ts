import { db } from "@/server/db";
import type { affiliations } from "@/server/db/schema/affiliations";
import type { categories } from "@/server/db/schema/categories";
import { wrapRepoError } from "@/server/errors";

export type AffiliationRow = typeof affiliations.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

export interface IMasterDataRepository {
  getAllAffiliations(): Promise<AffiliationRow[]>;
  getAllCategories(): Promise<CategoryRow[]>;
}

class MasterDataRepository implements IMasterDataRepository {
  async getAllAffiliations(): Promise<AffiliationRow[]> {
    return db.query.affiliations.findMany().catch(wrapRepoError);
  }

  async getAllCategories(): Promise<CategoryRow[]> {
    return db.query.categories.findMany().catch(wrapRepoError);
  }
}

export const masterDataRepository = new MasterDataRepository();
