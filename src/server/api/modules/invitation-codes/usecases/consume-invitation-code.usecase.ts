import type { db } from "@/server/db";
import { invitationCodesRepository } from "@/server/api/modules/invitation-codes/invitation-codes.repository";
import { evaluate } from "@/server/api/modules/invitation-codes/usecases/validate-invitation-code.usecase";
import { AppError } from "@/server/errors";

type Trx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Internal usecase — not exposed on the controller. Called from clubs.register
 * after invite-code validation, inside the caller's transaction.
 */
export const consumeInvitationCode = async (email: string, code: string, trx?: Trx): Promise<void> => {
	const [record, findError] = await invitationCodesRepository.findByEmailAndCode(email, code);
	if (findError) throw findError;

	const { valid, reason } = evaluate(record);
	if (!valid) {
		throw new AppError("CONFLICT", `Invitation code invalid: ${reason ?? "unknown"}`);
	}

	const markUsedError = await invitationCodesRepository.markUsed(record!.id, trx);
	if (markUsedError) throw markUsedError;
};
