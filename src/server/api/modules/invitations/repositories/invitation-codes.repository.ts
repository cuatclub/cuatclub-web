import { and, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import { clubs, user } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { InvitationCode } from "@/server/api/modules/invitations/invitation-code.entity";

export interface CreateInvitationCodeParams {
  email: string;
  inviteCode: string;
  expiredAt: Date;
}

export interface FindAllInvitationCodesParams {
  search?: string;
  page: number;
  pageSize: number;
}

export interface InvitationHistoryRow {
  code: InvitationCode;
  redeemedByClub: { id: string; name: string } | null;
}

export interface IInvitationCodesRepository {
  findByEmail(email: string, client?: DbClient): Promise<InvitationCode | null>;
  revoke(id: string, client?: DbClient): Promise<void>;
  markUsed(id: string, client?: DbClient): Promise<void>;
  create(req: CreateInvitationCodeParams, client?: DbClient): Promise<InvitationCode>;
  findAll(
    params: FindAllInvitationCodesParams,
    client?: DbClient
  ): Promise<{ items: InvitationHistoryRow[]; total: number }>;
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

  // Redemption isn't tracked on the invitation row itself — a code is "redeemed" once a user
  // account with a matching email owns a club, the same lookup `findByEmail` relies on
  // elsewhere, just widened here into a list join instead of a single lookup.
  async findAll(
    params: FindAllInvitationCodesParams,
    client: DbClient = db
  ): Promise<{ items: InvitationHistoryRow[]; total: number }> {
    const filter = params.search
      ? ilike(invitationCodes.email, `%${params.search.replace(/[\\%_]/g, "\\$&")}%`)
      : undefined;

    const [rows, totalRes] = await Promise.all([
      client
        .select({ code: invitationCodes, clubId: clubs.id, clubName: user.name })
        .from(invitationCodes)
        .leftJoin(user, sql`lower(${user.email}) = lower(${invitationCodes.email})`)
        .leftJoin(clubs, eq(clubs.userId, user.id))
        .where(filter)
        .orderBy(desc(invitationCodes.createdAt))
        .limit(params.pageSize)
        .offset((params.page - 1) * params.pageSize)
        .catch(wrapRepoError),
      client.select({ value: count() }).from(invitationCodes).where(filter).catch(wrapRepoError),
    ]);

    return {
      items: rows.map(({ code, clubId, clubName }) => ({
        code: InvitationCode.toEntity(code),
        redeemedByClub: clubId ? { id: clubId, name: clubName! } : null,
      })),
      total: totalRes[0]?.value ?? 0,
    };
  }
}

export const invitationCodesRepository = new InvitationCodesRepository();
