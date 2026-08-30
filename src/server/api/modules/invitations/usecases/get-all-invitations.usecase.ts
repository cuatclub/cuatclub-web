import { invitationCodesRepository } from "@/server/api/modules/invitations/invitation-codes.repository";
import type {
  GetAllInvitationsInputDTO,
  GetAllInvitationsOutputDTO,
  InvitationStatus,
} from "@/server/api/modules/invitations/dto";

export const getAllInvitations = async (
  input: GetAllInvitationsInputDTO
): Promise<GetAllInvitationsOutputDTO> => {
  const { items, total } = await invitationCodesRepository.findAll(input);
  const now = new Date();

  return {
    invitations: items.map(({ code, redeemedByClub }) => {
      const status: InvitationStatus = code.usedAt
        ? "USED"
        : code.expiredAt <= now
          ? "EXPIRED"
          : "PENDING";

      return {
        id: code.id,
        email: code.email,
        inviteCode: code.inviteCode,
        status,
        expiredAt: code.expiredAt,
        createdAt: code.createdAt,
        usedAt: code.usedAt,
        redeemedByClub,
      };
    }),
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
};
