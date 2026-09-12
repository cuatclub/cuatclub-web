import type { Activity } from "@/server/api/modules/activities/entities/activity.entity";
import type { Club } from "@/server/api/modules/clubs/entities/club.entity";
import type { User } from "@/server/api/modules/users/entities/user.entity";
import type {
  ActivityTypeRow,
  CategoryRow,
  FacultyRow,
} from "@/server/api/modules/master-data/entities/master-data.entity";
import type { ActivityDetailOutputDTO } from "@/server/api/modules/activities/dto";

export class ActivityDetail {
  private constructor(
    private activity: Activity,
    private club: Club,
    private owner: User,
    private activityTypeRow: ActivityTypeRow,
    private categoryRows: CategoryRow[],
    private facultyRows: FacultyRow[]
  ) {}

  static compose(parts: {
    activity: Activity;
    club: Club;
    owner: User;
    activityType: ActivityTypeRow;
    categories: CategoryRow[];
    faculties: FacultyRow[];
  }): ActivityDetail {
    return new ActivityDetail(
      parts.activity,
      parts.club,
      parts.owner,
      parts.activityType,
      parts.categories,
      parts.faculties
    );
  }

  get id() {
    return this.activity.id;
  }

  get title() {
    return this.activity.title;
  }

  get description() {
    return this.activity.description;
  }

  get posterUrl() {
    return this.activity.posterUrl;
  }

  get audience() {
    return this.activity.audience;
  }

  get yearLevels() {
    return this.activity.yearLevels;
  }

  get applicationFormUrl() {
    return this.activity.applicationFormUrl;
  }

  get applicationStartAt() {
    return this.activity.applicationStartAt;
  }

  get applicationEndAt() {
    return this.activity.applicationEndAt;
  }

  get activityType() {
    return this.activityTypeRow;
  }

  get categories() {
    return this.categoryRows;
  }

  get faculties() {
    return this.facultyRows;
  }

  // The club that posted the activity — its name and logo live on the owning user,
  // the same split ClubDetail uses.

  get clubId() {
    return this.club.id;
  }

  get clubName() {
    return this.owner.name;
  }

  get clubLogoUrl() {
    return this.owner.image;
  }

  get clubContacts() {
    return this.club.contacts;
  }

  get isApplicationOpen() {
    return this.activity.isApplicationOpen;
  }

  get isClubPubliclyVisible() {
    return this.club.isPubliclyVisible;
  }

  toDTO(): ActivityDetailOutputDTO {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      posterUrl: this.posterUrl,
      audience: this.audience,
      yearLevels: this.yearLevels,
      applicationFormUrl: this.applicationFormUrl,
      applicationStartAt: this.applicationStartAt,
      applicationEndAt: this.applicationEndAt,
      activityType: this.activityType,
      categories: this.categories,
      faculties: this.faculties,
      isApplicationOpen: this.isApplicationOpen,
      club: {
        id: this.clubId,
        name: this.clubName,
        logoUrl: this.clubLogoUrl,
        contacts: this.clubContacts,
      },
    };
  }
}
