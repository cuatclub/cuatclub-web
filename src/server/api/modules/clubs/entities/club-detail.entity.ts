import type { Club } from "@/server/api/modules/clubs/entities/club.entity";
import type { User } from "@/server/api/modules/users/user.entity";
import type {
  AffiliationRow,
  CategoryRow,
} from "@/server/api/modules/master-data/master-data.entity";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";

export class ClubDetail {
  private constructor(
    private club: Club,
    private owner: User,
    private affiliationRow: AffiliationRow | null,
    private categoryRows: CategoryRow[]
  ) {}

  static compose(parts: {
    club: Club;
    owner: User;
    affiliation: AffiliationRow | null;
    categories: CategoryRow[];
  }): ClubDetail {
    return new ClubDetail(parts.club, parts.owner, parts.affiliation, parts.categories);
  }

  get id() {
    return this.club.id;
  }

  get name() {
    return this.owner.name;
  }

  get logoUrl() {
    return this.owner.image;
  }

  get affiliation() {
    return this.affiliationRow;
  }

  get categories() {
    return this.categoryRows;
  }

  get shortDescription() {
    return this.club.shortDescription;
  }

  get longDescription() {
    return this.club.longDescription;
  }

  get imageUrls() {
    return this.club.imageUrls;
  }

  get contacts() {
    return this.club.contacts;
  }

  get isPubliclyVisible() {
    return this.club.isPubliclyVisible;
  }

  get isAwaitingRegistrationReview() {
    return this.club.isAwaitingRegistrationReview;
  }

  get isRegistrationInProgress() {
    return this.club.isRegistrationInProgress;
  }

  toDTO(): ClubDetailOutputDTO {
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
