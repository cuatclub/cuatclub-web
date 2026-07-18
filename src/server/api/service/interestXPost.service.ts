import type { SQL } from "drizzle-orm";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import { interestXPost } from "@/server/db/interestXPost";
import { interest } from "@/server/db/interest";
import { post } from "@/server/db/post";
import { eq, inArray } from "drizzle-orm";

export type InterestXPost = typeof interestXPost.$inferSelect;
export type CreateInterestXPostRequest = typeof interestXPost.$inferInsert;
export type PostInterestTag = {
	postId: string;
	interestId: string;
	name: string;
};

export interface IInterestXPostService {
    getByFilter(filter?: SQL): Promise<[InterestXPost[], ErrorOrNull]>;
	getByPostIds(postIds: string[]): Promise<[PostInterestTag[], ErrorOrNull]>;
    getOneByFilter(filter: SQL): Promise<[InterestXPost | null, ErrorOrNull]>;
    create(req: CreateInterestXPostRequest): Promise<[InterestXPost | null, ErrorOrNull]>;
    update(filter: SQL, update: Partial<InterestXPost>): Promise<ErrorOrNull>;
    delete(filter: SQL): Promise<ErrorOrNull>;
}

class InterestXPostService implements IInterestXPostService {
	async getByPostIds(postIds: string[]): Promise<[PostInterestTag[], ErrorOrNull]> {
		const res = await db
			.select({
				postId: interestXPost.postId,
				interestId: interestXPost.interestId,
				name: interest.name,
			})
			.from(interestXPost)
			.innerJoin(interest, eq(interestXPost.interestId, interest.id))
			.where(inArray(interestXPost.postId, postIds))
			.catch(() => new PostgreSQLError());

		if (res instanceof Error) return [[], res];
		return [res, null];
	}

    async getByFilter(filter?: SQL): Promise<[InterestXPost[], ErrorOrNull]> {
        const res = await db
            .select()
            .from(interestXPost)
            .innerJoin(interest, eq(interestXPost.interestId, interest.id))
            .innerJoin(post, eq(interestXPost.postId, post.id))
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [[], res];
        const mapped = (res as Array<(typeof res)[0]>).map((r) => ({
            ...r.interest_x_post,
            ...r.interest,
            ...r.post
        }));
        return [mapped, null];
    }

    async getOneByFilter(filter: SQL): Promise<[InterestXPost | null, ErrorOrNull]> {
        const res = await db
            .select()
            .from(interestXPost)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [null, res];
        if (!res || (res as InterestXPost[]).length === 0)
            return [null, new ErrorWithCategory("InterestXPost not found", ErrorCategory.ResourceNotFound)];
        return [(res as InterestXPost[])[0]!, null];
    }

    async create(req: CreateInterestXPostRequest): Promise<[InterestXPost | null, ErrorOrNull]> {
        const res = await db
            .insert(interestXPost)
            .values(req)
            .returning()
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [null, res];
        return [(res as InterestXPost[])[0] ?? null, null];
    }

    async update(filter: SQL, update: Partial<InterestXPost>): Promise<ErrorOrNull> {
        const res = await db
            .update(interestXPost)
            .set(update)
            .where(filter)
            .returning()
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return res;
        if ((res as InterestXPost[]).length === 0)
            return new ErrorWithCategory("InterestXPost not found", ErrorCategory.ResourceNotFound);
        return null;
    }

    async delete(filter: SQL): Promise<ErrorOrNull> {
        const res = await db
            .delete(interestXPost)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return res;
        return null;
    }
}

export const interestXPostServiceImpl = new InterestXPostService();
