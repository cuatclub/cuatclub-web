import { and, eq, gt, isNull } from "drizzle-orm";
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
  async create(req: CreateInvitationCodeParams, client: DbClient = db): Promise<InvitationCode> {
    for (let attempt = 0; attempt < MAX_CODE_COLLISION_RETRIES; attempt++) {
      const inviteCode = generateInviteCode();
      try {
        const res = await client
          .insert(invitationCodes)
          .values({ email: req.email, inviteCode, expiredAt: req.expiredAt })
          .returning();
        return InvitationCode.toEntity(res[0]!);
      } catch (err) {
        if (isUniqueViolation(err)) continue;
        wrapRepoError(err);
      }
    }
    // Astronomically unlikely at ~32^6 combinations — surfaces as a clear 409 rather than a
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
