import { eq } from "drizzle-orm";
import { invitationCodesRepository } from "@/server/api/modules/invitationCodes/repository/invitationCodes.repository";
import { invitationCodes } from "@/server/db/invitationCodes";
import type { InvitationCode } from "@/server/api/modules/invitationCodes/dto/issueInvitationCode.dto";
import type { ListInvitationCodesRequest } from "@/server/api/modules/invitationCodes/dto/listInvitationCodes.dto";
import type { ErrorOrNull } from "@/utils/error";

export const listInvitationCodes = async (
	req: ListInvitationCodesRequest,
): Promise<[InvitationCode[], ErrorOrNull]> => {
	const filter = req.email ? eq(invitationCodes.email, req.email) : undefined;
	return invitationCodesRepository.findMany(filter);
};
