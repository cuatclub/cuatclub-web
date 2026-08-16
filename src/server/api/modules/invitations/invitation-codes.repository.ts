import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import { wrapRepoError, conflict } from "@/server/errors";
import {
  InvitationCode,
  type InvitationCodeRow,
} from "@/server/api/modules/invitations/invitation-code.entity";
import { generateInviteCode } from "@/server/api/modules/invitations/invite-code";

export interface CreateInvitationCodeParams {
  email: string;
  expiredAt: Date;
}

export interface IInvitationCodesRepository {
  lockEmailForWrite(email: string, client?: DbClient): Promise<void>;
  create(req: CreateInvitationCodeParams, client?: DbClient): Promise<InvitationCode>;
  getActiveByEmail(email: string, client?: DbClient): Promise<InvitationCode | null>;
  invalidateActiveByEmail(email: string, client?: DbClient): Promise<void>;
}

// A row is "active" iff it hasn't been consumed and hasn't expired yet — this predicate is the
// single source of truth for that concept and must stay consistent with how #108 later validates.
const activeFilter = (email: string) =>
  and(
    eq(invitationCodes.email, email),
    isNull(invitationCodes.usedAt),
    gt(invitationCodes.expiredAt, new Date())
  );

const MAX_CODE_COLLISION_RETRIES = 5;

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

class InvitationCodesRepository implements IInvitationCodesRepository {
  // `client` defaults to the module-level `db` so callers only need to pass one explicitly
  // when running inside unitOfWork.run() (see db/unit-of-work.ts).

  // Postgres transaction-scoped advisory lock, keyed by email. Must be called first thing
  // inside the same unitOfWork.run() transaction that then invalidates the old active code and
  // inserts the new one — it serializes concurrent generate-code calls for the same email so
  // two requests can never both see "no active code" and each commit their own active row.
  // Auto-released on commit/rollback, no unlock call needed.
  async lockEmailForWrite(email: string, client: DbClient = db): Promise<void> {
    await client
      .execute(sql`select pg_advisory_xact_lock(hashtext(${email}))`)
      .catch(wrapRepoError);
  }

  async create(req: CreateInvitationCodeParams, client: DbClient = db): Promise<InvitationCode> {
    for (let attempt = 0; attempt < MAX_CODE_COLLISION_RETRIES; attempt++) {
      const inviteCode = generateInviteCode();
      try {
        // Each attempt runs in its own nested transaction (a SAVEPOINT when `client` is already
        // inside a transaction). Without this, a unique-violation on `client` directly aborts
        // the whole outer transaction, and every subsequent statement — including the retry
        // itself — fails with "current transaction is aborted" instead of actually retrying.
        const res = await client.transaction(async (tx) => {
          return tx
            .insert(invitationCodes)
            .values({ email: req.email, inviteCode, expiredAt: req.expiredAt })
            .returning();
        });
        return InvitationCode.toEntity(res[0]!);
      } catch (err) {
        if (isUniqueViolation(err)) continue;
        wrapRepoError(err);
      }
    }
    // Astronomically unlikely at ~62^6 combinations — surfaces as a clear 409 rather than a
    // silently duplicated/lost code if it ever does happen.
    throw conflict("Could not generate a unique invitation code. Please try again.");
  }

  async getActiveByEmail(email: string, client: DbClient = db): Promise<InvitationCode | null> {
    const res = await client.query.invitationCodes
      .findFirst({ where: activeFilter(email) })
      .catch(wrapRepoError);

    return res ? InvitationCode.toEntity(res as InvitationCodeRow) : null;
  }

  async invalidateActiveByEmail(email: string, client: DbClient = db): Promise<void> {
    await client
      .update(invitationCodes)
      .set({ expiredAt: new Date() })
      .where(activeFilter(email))
      .catch(wrapRepoError);
  }
}

export const invitationCodesRepository = new InvitationCodesRepository();
