import type { students } from "@/server/db/schema/students";
import type { StudentOutputDTO } from "@/server/api/modules/students/dto";

export type StudentRow = typeof students.$inferSelect;

export type StudentRegistrationStatus = StudentRow["registrationStatus"];

// Order matters: a later step's page and save are open once the student has reached the step
// before it, and earlier steps stay revisitable (the back link) without resetting progress.
export const STUDENT_REGISTRATION_STEPS: readonly StudentRegistrationStatus[] = [
  "PENDING",
  "GENERAL_SUBMITTED",
  "PREFERENCES_SUBMITTED",
  "COMPLETED",
];

const stepIndex = (step: StudentRegistrationStatus) => STUDENT_REGISTRATION_STEPS.indexOf(step);

export class Student {
  private constructor(private row: StudentRow) {}

  // Domain business logic

  hasReached(step: StudentRegistrationStatus) {
    return stepIndex(this.row.registrationStatus) >= stepIndex(step);
  }

  /** The status after finishing `step` — never moves a student backwards. */
  statusAfter(step: StudentRegistrationStatus): StudentRegistrationStatus {
    return this.hasReached(step) ? this.row.registrationStatus : step;
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

  get status() {
    return this.row.status;
  }

  get username() {
    return this.row.username;
  }

  get facultyId() {
    return this.row.facultyId;
  }

  get yearLevel() {
    return this.row.yearLevel;
  }

  get university() {
    return this.row.university;
  }

  get referralSource() {
    return this.row.referralSource;
  }

  get referralOther() {
    return this.row.referralOther;
  }

  get createdAt() {
    return this.row.createdAt;
  }

  get updatedAt() {
    return this.row.updatedAt;
  }

  get raw(): StudentRow {
    return this.row;
  }

  // Helper function

  static toEntity(row: StudentRow): Student {
    return new Student(row);
  }

  toDTO(): StudentOutputDTO {
    return { ...this.row };
  }
}
