import { randomBytes } from "crypto";
import { invitationCodesRepository } from "@/server/api/modules/invitationCodes/repository/invitationCodes.repository";
import type { InvitationCode, IssueInvitationCodeRequest } from "@/server/api/modules/invitationCodes/dto/issueInvitationCode.dto";
import type { ErrorOrNull } from "@/utils/error";

const DEFAULT_EXPIRES_IN_DAYS = 30;

const generateInviteCode = (): string => randomBytes(6).toString("hex").toUpperCase();

export const issueInvitationCode = async (
	req: IssueInvitationCodeRequest,
): Promise<[InvitationCode | null, ErrorOrNull]> => {
	const expiresInDays = req.expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS;
	const expiredAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

	return invitationCodesRepository.insert({
		email: req.email,
		inviteCode: generateInviteCode(),
		expiredAt,
	});
};
