import type { clubCategories } from "@/server/db/schema/club-categories";
import type { ClubCategoriesOutputDTO } from "./dto/clubCategories.dto";

export type ClubCategoriesRow = typeof clubCategories.$inferSelect;

export class ClubCategories {
  private constructor(private row: ClubCategoriesRow) {}

  static toEntity(row: ClubCategoriesRow): ClubCategories {
    return new ClubCategories(row);
  }

  static toEntities(rows: ClubCategoriesRow[]): ClubCategories[] {
    return rows.map((row) => ClubCategories.toEntity(row));
  }

  get clubId() {
    return this.row.clubId;
  }

  get categoryId() {
    return this.row.categoryId;
  }

  get raw(): ClubCategoriesRow {
    return this.row;
  }

  toDTO(): ClubCategoriesOutputDTO {
    return { ...this.row };
  }
}
