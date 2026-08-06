import { randomBytes } from "crypto";
import { invitationCodesRepository } from "@/server/api/modules/invitation-codes/invitation-codes.repository";
import type { InvitationCode, IssueInvitationCodeRequest } from "@/server/api/modules/invitation-codes/dto/issue-invitation-code.dto";
import type { ErrorOrNull } from "@/server/error";

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
