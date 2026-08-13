import type { affiliations } from "@/server/db/schema/affiliations";
import type { categories } from "@/server/db/schema/categories";
import type { user } from "@/server/db/schema/user";
import type { ClubRow } from "@/server/api/modules/clubs/club.entity";
import type { GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";

// A club row plus the relations the public detail view needs. The joined shape is wider
// than ClubRow, so it gets its own entity rather than being folded into Club. Relation
// types come from the Drizzle schema directly, not from the master-data repository —
// modules don't reach into each other's repositories.
export type ClubDetailRow = ClubRow & {
  user: typeof user.$inferSelect;
  affiliation: typeof affiliations.$inferSelect | null;
  categories: { category: typeof categories.$inferSelect }[];
};

export class ClubDetail {
  private constructor(private row: ClubDetailRow) {}

  static toEntity(row: ClubDetailRow): ClubDetail {
    return new ClubDetail(row);
  }

  get id() {
    return this.row.id;
  }

  // name and logoUrl live on the owning user account, not on the club row.
  get name() {
    return this.row.user.name;
  }

  get logoUrl() {
    return this.row.user.image;
  }

  get affiliation() {
    return this.row.affiliation;
  }

  // Unwraps the club_categories junction rows down to the categories themselves.
  get categories() {
    return this.row.categories.map(({ category }) => category);
  }

  get shortDescription() {
    return this.row.shortDescription;
  }

  get longDescription() {
    return this.row.longDescription;
  }

  get imageUrls() {
    return this.row.imageUrls;
  }

  get contacts() {
    return this.row.contacts;
  }

  // Only a fully registered club is resolvable by anyone who has its id.
  get isPubliclyVisible() {
    return this.row.registrationStatus === "COMPLETED";
  }

  get raw(): ClubDetailRow {
    return this.row;
  }

  toDTO(): GetClubByIdOutputDTO {
    return {
      id: this.id,
      name: this.name,
      logoUrl: this.logoUrl,
      affiliation: this.affiliation,
      categories: this.categories,
      shortDescription: this.shortDescription,
      longDescription: this.longDescription,
      imageUrls: this.imageUrls,
      contacts: this.contacts,
    };
  }
}
