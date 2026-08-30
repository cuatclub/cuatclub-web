import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { affiliations } from "@/server/db/schema/affiliations";
import { categories } from "@/server/db/schema/categories";
import { wrapRepoError } from "@/server/errors";
import type {
  AffiliationRow,
  CategoryRow,
} from "@/server/api/modules/master-data/master-data.entity";

export type UpdateCategoryParams = Pick<CategoryRow, "label" | "fontColor" | "backgroundColor">;
export type UpdateAffiliationParams = Pick<AffiliationRow, "label">;
export type CreateCategoryParams = Pick<CategoryRow, "label" | "fontColor" | "backgroundColor">;
export type CreateAffiliationParams = Pick<AffiliationRow, "label">;

export interface IMasterDataRepository {
  getAllAffiliations(): Promise<AffiliationRow[]>;
  getAllCategories(): Promise<CategoryRow[]>;
  createCategory(create: CreateCategoryParams, client?: DbClient): Promise<CategoryRow>;
  createAffiliation(create: CreateAffiliationParams, client?: DbClient): Promise<AffiliationRow>;
  updateCategory(
    id: number,
    update: UpdateCategoryParams,
    client?: DbClient
  ): Promise<CategoryRow | null>;
  updateAffiliation(
    id: number,
    update: UpdateAffiliationParams,
    client?: DbClient
  ): Promise<AffiliationRow | null>;
}

class MasterDataRepository implements IMasterDataRepository {
  async getAllAffiliations(): Promise<AffiliationRow[]> {
    return db.query.affiliations.findMany().catch(wrapRepoError);
  }

  async getAllCategories(): Promise<CategoryRow[]> {
    return db.query.categories.findMany().catch(wrapRepoError);
  }

  async createCategory(create: CreateCategoryParams, client: DbClient = db): Promise<CategoryRow> {
    const res = await client.insert(categories).values(create).returning().catch(wrapRepoError);

    return res[0]!;
  }

  async createAffiliation(
    create: CreateAffiliationParams,
    client: DbClient = db
  ): Promise<AffiliationRow> {
    const res = await client.insert(affiliations).values(create).returning().catch(wrapRepoError);

    return res[0]!;
  }

  async updateCategory(
    id: number,
    update: UpdateCategoryParams,
    client: DbClient = db
  ): Promise<CategoryRow | null> {
    const res = await client
      .update(categories)
      .set(update)
      .where(eq(categories.id, id))
      .returning()
      .catch(wrapRepoError);

    return res[0] ?? null;
  }

  async updateAffiliation(
    id: number,
    update: UpdateAffiliationParams,
    client: DbClient = db
  ): Promise<AffiliationRow | null> {
    const res = await client
      .update(affiliations)
      .set(update)
      .where(eq(affiliations.id, id))
      .returning()
      .catch(wrapRepoError);

    return res[0] ?? null;
  }
}

export const masterDataRepository = new MasterDataRepository();
