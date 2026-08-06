import type { db } from "@/server/db";
import { invitationCodesRepository } from "@/server/api/modules/invitationCodes/repository/invitationCodes.repository";
import { evaluate } from "@/server/api/modules/invitationCodes/usecases/validateInvitationCode.usecase";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull } from "@/utils/error";

type Trx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Internal usecase — not exposed on the controller. Called from clubs.register
 * after invite-code validation, inside the caller's transaction.
 */
export const consumeInvitationCode = async (email: string, code: string, trx?: Trx): Promise<ErrorOrNull> => {
	const [record, findError] = await invitationCodesRepository.findByEmailAndCode(email, code);
	if (findError) return findError;

	const { valid, reason } = evaluate(record);
	if (!valid) {
		return new ErrorWithCategory(`Invitation code invalid: ${reason ?? "unknown"}`, ErrorCategory.BusinessLogic);
	}

	return invitationCodesRepository.markUsed(record!.id, trx);
};
