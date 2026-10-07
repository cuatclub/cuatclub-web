import type { Activity } from "@/server/api/modules/activities/entities/activity.entity";
import type { Club } from "@/server/api/modules/clubs/entities/club.entity";
import type { User } from "@/server/api/modules/users/entities/user.entity";
import type {
  ActivityTypeRow,
  CategoryRow,
  FacultyRow,
} from "@/server/api/modules/master-data/entities/master-data.entity";
import type { PublicActivityListItemDTO } from "@/server/api/modules/activities/dto";

export class ActivityDetail {
  private constructor(
    private activityEntity: Activity,
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

  get activity() {
    return this.activityEntity;
  }

  get id() {
    return this.activityEntity.id;
  }

  get isApplicationOpen() {
    return this.activityEntity.isApplicationOpen;
  }

  get clubSummary() {
    return { id: this.club.id, name: this.owner.name, logoUrl: this.owner.image };
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

  toDTO(): PublicActivityListItemDTO {
    return {
      id: this.activityEntity.id,
      title: this.activityEntity.title,
      description: this.activityEntity.description,
      posterUrl: this.activityEntity.posterUrl,
      audience: this.activityEntity.audience,
      yearLevels: this.activityEntity.yearLevels,
      applicationStartAt: this.activityEntity.applicationStartAt,
      applicationEndAt: this.activityEntity.applicationEndAt,
      createdAt: this.activityEntity.createdAt,
      isApplicationOpen: this.isApplicationOpen,
      club: this.clubSummary,
      categories: this.categoryRows,
      faculties: this.facultyRows,
      activityType: this.activityTypeRow,
    };
  }
}
