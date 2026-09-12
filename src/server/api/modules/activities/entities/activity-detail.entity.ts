import type { Activity } from "@/server/api/modules/activities/entities/activity.entity";
import type {
  ActivityTypeRow,
  CategoryRow,
  FacultyRow,
} from "@/server/api/modules/master-data/entities/master-data.entity";
import type { ActivityDetailOutputDTO } from "@/server/api/modules/activities/dto";

export class ActivityDetail {
  private constructor(
    private activity: Activity,
    private activityTypeRow: ActivityTypeRow,
    private categoryRows: CategoryRow[],
    private facultyRows: FacultyRow[]
  ) {}

  static compose(parts: {
    activity: Activity;
    activityType: ActivityTypeRow;
    categories: CategoryRow[];
    faculties: FacultyRow[];
  }): ActivityDetail {
    return new ActivityDetail(
      parts.activity,
      parts.activityType,
      parts.categories,
      parts.faculties
    );
  }

  get id() {
    return this.activity.id;
  }

  get clubId() {
    return this.activity.clubId;
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

  get isApplicationOpen() {
    return this.activity.isApplicationOpen;
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
    };
  }
}
