import { and, eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { studentClub } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IClubFollowsRepository {
  isFollowing(studentId: string, clubId: string, client?: DbClient): Promise<boolean>;
  follow(studentId: string, clubId: string, client?: DbClient): Promise<void>;
  unfollow(studentId: string, clubId: string, client?: DbClient): Promise<void>;
}

class ClubFollowsRepository implements IClubFollowsRepository {
  async isFollowing(studentId: string, clubId: string, client: DbClient = db): Promise<boolean> {
    const row = await client.query.studentClub
      .findFirst({
        where: and(eq(studentClub.studentId, studentId), eq(studentClub.clubId, clubId)),
      })
      .catch(wrapRepoError);

    return Boolean(row);
  }

  async follow(studentId: string, clubId: string, client: DbClient = db): Promise<void> {
    await client
      .insert(studentClub)
      .values({ studentId, clubId })
      .onConflictDoNothing({ target: [studentClub.studentId, studentClub.clubId] })
      .catch(wrapRepoError);
  }

  async unfollow(studentId: string, clubId: string, client: DbClient = db): Promise<void> {
    await client
      .delete(studentClub)
      .where(and(eq(studentClub.studentId, studentId), eq(studentClub.clubId, clubId)))
      .catch(wrapRepoError);
  }
}

export const clubFollowsRepository = new ClubFollowsRepository();
