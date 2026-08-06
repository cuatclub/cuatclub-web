import type { SQL } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import { type ErrorOrNull, ErrorWithCategory, ErrorCategory, PostgreSQLError } from "@/server/error";
import type { InvitationCode } from "@/server/api/modules/invitation-codes/dto/issue-invitation-code.dto";

type Trx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface IInvitationCodesRepository {
	insert(req: {
		email: string;
		inviteCode: string;
		expiredAt: Date;
	}): Promise<[InvitationCode | null, ErrorOrNull]>;
	findMany(filter?: SQL): Promise<[InvitationCode[], ErrorOrNull]>;
	findByEmailAndCode(email: string, code: string): Promise<[InvitationCode | null, ErrorOrNull]>;
	markUsed(id: string, trx?: Trx): Promise<ErrorOrNull>;
}

class InvitationCodesRepository implements IInvitationCodesRepository {
	async insert(req: {
		email: string;
		inviteCode: string;
		expiredAt: Date;
	}): Promise<[InvitationCode | null, ErrorOrNull]> {
		const id = randomUUID();
		const res = await db
			.insert(invitationCodes)
			.values({ ...req, id })
			.returning()
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res[0] ?? null, null];
	}

	async findMany(filter?: SQL): Promise<[InvitationCode[], ErrorOrNull]> {
		const res = await db.query.invitationCodes.findMany({ where: filter }).catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}

	async findByEmailAndCode(email: string, code: string): Promise<[InvitationCode | null, ErrorOrNull]> {
		const res = await db.query.invitationCodes
			.findFirst({
				where: and(eq(invitationCodes.email, email), eq(invitationCodes.inviteCode, code)),
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res ?? null, null];
	}

	async markUsed(id: string, trx?: Trx): Promise<ErrorOrNull> {
		const database = trx ?? db;
		const res = await database
			.update(invitationCodes)
			.set({ usedAt: new Date() })
			.where(eq(invitationCodes.id, id))
			.returning({ updatedId: invitationCodes.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		if (res.length === 0) {
			return new ErrorWithCategory("Invitation code not found", ErrorCategory.ResourceNotFound);
		}
		return null;
	}
}

export const invitationCodesRepository = new InvitationCodesRepository();
