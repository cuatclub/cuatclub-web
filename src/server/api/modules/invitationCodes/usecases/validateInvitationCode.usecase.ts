import { invitationCodesRepository } from "@/server/api/modules/invitationCodes/repository/invitationCodes.repository";
import type { InvitationCode } from "@/server/api/modules/invitationCodes/dto/issueInvitationCode.dto";
import type {
	ValidateInvitationCodeRequest,
	ValidateInvitationCodeResult,
} from "@/server/api/modules/invitationCodes/dto/validateInvitationCode.dto";
import type { ErrorOrNull } from "@/utils/error";

/** Read-only check. Does not mark the code as used — see consumeInvitationCode for that. */
export const validateInvitationCode = async (
	req: ValidateInvitationCodeRequest,
): Promise<[ValidateInvitationCodeResult, ErrorOrNull]> => {
	const [record, error] = await invitationCodesRepository.findByEmailAndCode(req.email, req.code);
	if (error) return [{ valid: false }, error];

	const result = evaluate(record);
	return [result, null];
};

export const evaluate = (record: InvitationCode | null): ValidateInvitationCodeResult => {
	if (!record) return { valid: false, reason: "not_found" };
	if (record.usedAt) return { valid: false, reason: "used" };
	if (record.expiredAt.getTime() < Date.now()) return { valid: false, reason: "expired" };
	return { valid: true };
};
