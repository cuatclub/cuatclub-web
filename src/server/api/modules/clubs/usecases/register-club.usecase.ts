import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { auth } from "@/utils/auth";
import { clubsRepository } from "@/server/api/modules/clubs/repository/clubs.repository";
import { validateInvitationCode } from "@/server/api/modules/invitation-codes/usecases/validate-invitation-code.usecase";
import { consumeInvitationCode } from "@/server/api/modules/invitation-codes/usecases/consume-invitation-code.usecase";
import type { RegisterClubRequest, RegisterClubResult } from "@/server/api/modules/clubs/dto/register-club.dto";
import { ErrorCategory, ErrorWithCategory, PostgreSQLError, type ErrorOrNull } from "@/utils/error";

/**
 * better-auth's own writes (signUpEmail) don't participate in our db.transaction(),
 * so this can't be fully atomic: if the clubs-row/invite-code-consume step fails after
 * the better-auth user was created, we compensate by deleting that user.
 */
export const registerClub = async (
	req: RegisterClubRequest,
	headers: Headers,
): Promise<[RegisterClubResult | null, ErrorOrNull]> => {
	const [{ valid, reason }, validateError] = await validateInvitationCode({
		email: req.email,
		code: req.inviteCode,
	});
	if (validateError) return [null, validateError];
	if (!valid) {
		return [
			null,
			new ErrorWithCategory(`Invitation code invalid: ${reason ?? "unknown"}`, ErrorCategory.BusinessLogic),
		];
	}

	const signUpRes = await auth.api
		.signUpEmail({
			headers,
			body: { email: req.email, password: req.password, name: req.email, role: "CLUB" },
		})
		.catch((e) => {
			console.log(e);
			return new ErrorWithCategory("Failed to create account", ErrorCategory.BusinessLogic);
		});

	if (signUpRes instanceof Error) return [null, signUpRes];
	const userId = signUpRes.user.id;

	await db
		.update(user)
		.set({ role: "CLUB" })
		.where(eq(user.id, userId))
		.catch((e) => console.log(e));

	try {
		const clubId = await db.transaction(async (tx) => {
			const [id, insertError] = await clubsRepository.insertPending({ userId, email: req.email }, tx);
			if (insertError) throw insertError;

			const consumeError = await consumeInvitationCode(req.email, req.inviteCode, tx);
			if (consumeError) throw consumeError;

			return id;
		});

		return [{ clubId: clubId! }, null];
	} catch (e) {
		await db
			.delete(user)
			.where(eq(user.id, userId))
			.catch((cleanupErr) => console.log(cleanupErr));

		if (e instanceof ErrorWithCategory || e instanceof PostgreSQLError) return [null, e];
		console.log(e);
		return [null, new PostgreSQLError()];
	}
};
