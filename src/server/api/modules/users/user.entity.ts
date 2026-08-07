import type { user } from "@/server/db/schema/user";

export type UserRow = typeof user.$inferSelect;

export class User {
  private constructor(private row: UserRow) {}

  static toEntity(row: UserRow): User {
    return new User(row);
  }

  static toEntities(rows: UserRow[]): User[] {
    return rows.map((row) => User.toEntity(row));
  }

  get id() {
    return this.row.id;
  }

  get email() {
    return this.row.email;
  }

  get role() {
    return this.row.role;
  }

  get createdAt() {
    return this.row.createdAt;
  }

  get updatedAt() {
    return this.row.updatedAt;
  }

  get raw(): UserRow {
    return this.row;
  }
}
