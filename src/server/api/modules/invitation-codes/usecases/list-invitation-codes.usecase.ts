import { eq } from "drizzle-orm";
import { invitationCodesRepository } from "@/server/api/modules/invitation-codes/repository/invitation-codes.repository";
import { invitationCodes } from "@/server/db/invitation-codes";
import type { InvitationCode } from "@/server/api/modules/invitation-codes/dto/issue-invitation-code.dto";
import type { ListInvitationCodesRequest } from "@/server/api/modules/invitation-codes/dto/list-invitation-codes.dto";
import type { ErrorOrNull } from "@/utils/error";

export const listInvitationCodes = async (
	req: ListInvitationCodesRequest,
): Promise<[InvitationCode[], ErrorOrNull]> => {
	const filter = req.email ? eq(invitationCodes.email, req.email) : undefined;
	return invitationCodesRepository.findMany(filter);
};
