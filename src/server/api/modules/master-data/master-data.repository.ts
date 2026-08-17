import { db } from "@/server/db";
import { wrapRepoError } from "@/server/errors";
import type {
  AffiliationRow,
  CategoryRow,
} from "@/server/api/modules/master-data/master-data.entity";

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
