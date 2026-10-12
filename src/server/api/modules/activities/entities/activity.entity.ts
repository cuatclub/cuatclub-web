import type { activities } from "@/server/db/schema/activities";
import type { ActivityOutputDTO } from "@/server/api/modules/activities/dto";

export type ActivityRow = typeof activities.$inferSelect;

export class Activity {
  private constructor(private row: ActivityRow) {}

  // Domain business logic

  get isApplicationOpen() {
    const now = new Date();
    return now >= this.row.applicationStartAt && now <= this.row.applicationEndAt;
  }

  // Getter function

  get id() {
    return this.row.id;
  }

  get clubId() {
    return this.row.clubId;
  }

  get activityTypeId() {
    return this.row.activityTypeId;
  }

  get title() {
    return this.row.title;
  }

  get description() {
    return this.row.description;
  }

  get posterUrl() {
    return this.row.posterUrl;
  }

  get audience() {
    return this.row.audience;
  }

  get yearLevels() {
    return this.row.yearLevels;
  }

  get applicationFormUrl() {
    return this.row.applicationFormUrl;
  }

  get applicationStartAt() {
    return this.row.applicationStartAt;
  }

  get applicationEndAt() {
    return this.row.applicationEndAt;
  }

  get createdAt() {
    return this.row.createdAt;
  }

  get updatedAt() {
    return this.row.updatedAt;
  }

  get raw(): ActivityRow {
    return this.row;
  }

  // Helper function

  static toEntity(row: ActivityRow): Activity {
    return new Activity(row);
  }

  static toEntities(rows: ActivityRow[]): Activity[] {
    return rows.map((row) => Activity.toEntity(row));
  }

  toDTO(): ActivityOutputDTO {
    return { ...this.row };
  }
}
