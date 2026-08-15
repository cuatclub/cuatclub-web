import type { invitationCodes } from "@/server/db/schema/invitation-codes";
import type { GenerateInvitationCodeOutputDTO } from "@/server/api/modules/invitations/dto";

export type InvitationCodeRow = typeof invitationCodes.$inferSelect;

export class InvitationCode {
  private constructor(private row: InvitationCodeRow) {}

  static toEntity(row: InvitationCodeRow): InvitationCode {
    return new InvitationCode(row);
  }

  static toEntities(rows: InvitationCodeRow[]): InvitationCode[] {
    return rows.map((row) => InvitationCode.toEntity(row));
  }

  get id() {
    return this.row.id;
  }

  get email() {
    return this.row.email;
  }

  get inviteCode() {
    return this.row.inviteCode;
  }

  get expiredAt() {
    return this.row.expiredAt;
  }

  get usedAt() {
    return this.row.usedAt;
  }

  get createdAt() {
    return this.row.createdAt;
  }

  get raw(): InvitationCodeRow {
    return this.row;
  }

  toDTO(): GenerateInvitationCodeOutputDTO {
    return {
      email: this.row.email,
      expiredAt: this.row.expiredAt,
      createdAt: this.row.createdAt,
    };
  }
}
