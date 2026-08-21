import type { clubs } from "@/server/db/schema/clubs";
import type { ClubOutputDTO } from "@/server/api/modules/clubs/dto";

export type ClubRow = typeof clubs.$inferSelect;

export class Club {
  static readonly PUBLICLY_VISIBLE_STATUS = "COMPLETED";

  private constructor(private row: ClubRow) {}

  // Domain business logic

  get isPubliclyVisible() {
    return this.row.registrationStatus === Club.PUBLICLY_VISIBLE_STATUS;
  }

  // Getter function

  get id() {
    return this.row.id;
  }

  get userId() {
    return this.row.userId;
  }

  get registrationStatus() {
    return this.row.registrationStatus;
  }

  get affiliationId() {
    return this.row.affiliationId;
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

  get createdAt() {
    return this.row.createdAt;
  }

  get updatedAt() {
    return this.row.updatedAt;
  }

  get raw(): ClubRow {
    return this.row;
  }

  // Helper function

  static toEntity(row: ClubRow): Club {
    return new Club(row);
  }

  static toEntities(rows: ClubRow[]): Club[] {
    return rows.map((row) => Club.toEntity(row));
  }

  toDTO(): ClubOutputDTO {
    return { ...this.row };
  }
}
