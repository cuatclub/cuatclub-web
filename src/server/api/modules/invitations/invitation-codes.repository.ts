import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import { wrapRepoError } from "@/server/errors";
import { InvitationCode } from "@/server/api/modules/invitations/invitation-code.entity";

export interface CreateInvitationCodeParams {
  email: string;
  inviteCode: string;
  expiredAt: Date;
}

export interface IInvitationCodesRepository {
  findByEmail(email: string, client?: DbClient): Promise<InvitationCode | null>;
  revoke(id: string, client?: DbClient): Promise<void>;
  markUsed(id: string, client?: DbClient): Promise<void>;
  create(req: CreateInvitationCodeParams, client?: DbClient): Promise<InvitationCode>;
}

class InvitationCodesRepository implements IInvitationCodesRepository {
  // `client` defaults to the module-level `db` so callers only need to pass one explicitly
  // when running inside unitOfWork.run() (see db/unit-of-work.ts).

  // `revoke` only ever touches `expiredAt`, never `usedAt`, so a given email can have several
  // rows with `usedAt IS NULL` over time (each past-invalidated code plus the current one) —
  // ordering by `createdAt desc` is what makes this "the most recent one", not just "a" one.
  // Case-insensitive: registration and generation both normalise to lowercase now (see
  // register-club.dto.ts / generate-invitation-code.dto.ts), but this stays independent of that
  // so a row written any other way — or written before that normalisation existed — still matches.
  async findByEmail(email: string, client: DbClient = db): Promise<InvitationCode | null> {
    const res = await client.query.invitationCodes
      .findFirst({
        where: and(
          sql`lower(${invitationCodes.email}) = lower(${email})`,
          isNull(invitationCodes.usedAt)
        ),
        orderBy: desc(invitationCodes.createdAt),
      })
      .catch(wrapRepoError);

    return res ? InvitationCode.toEntity(res) : null;
  }

  async revoke(id: string, client: DbClient = db): Promise<void> {
    await client
      .update(invitationCodes)
      .set({ expiredAt: new Date() })
      .where(eq(invitationCodes.id, id))
      .catch(wrapRepoError);
  }

  // Marks a code consumed by registration — distinct from `revoke`, which only invalidates a
  // superseded code. `findByEmail` filters on `usedAt IS NULL`, so once this runs the code can
  // never be found (and therefore never reused) again.
  async markUsed(id: string, client: DbClient = db): Promise<void> {
    await client
      .update(invitationCodes)
      .set({ usedAt: new Date() })
      .where(eq(invitationCodes.id, id))
      .catch(wrapRepoError);
  }

  async create(req: CreateInvitationCodeParams, client: DbClient = db): Promise<InvitationCode> {
    const res = await client.insert(invitationCodes).values(req).returning().catch(wrapRepoError);

    return InvitationCode.toEntity(res[0]!);
  }
}

export const invitationCodesRepository = new InvitationCodesRepository();
