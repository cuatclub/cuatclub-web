import type { SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import type { Post, CreatePostRequest } from "@/server/api/dto/post.dto";
import { post } from "@/server/db/post";
import { user } from "@/server/db/auth-schema";
import { organization } from "@/server/db/organization";
import { interestXPost } from "@/server/db/interestXPost";
import { interestXUser } from "@/server/db/interestXUser";
import { signToken } from "@/server/utils/signedTokens";
import { bulkSendMail } from "@/server/utils/mailer";
import { ActivityCardMail } from "@/components/ui/ActivityCardMail";
import { activityType } from "@/server/db/activityType";

export interface IPostService {
	create(req: CreatePostRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]>;
	getAll(): Promise<[any[], ErrorOrNull]>;
	getOne(id: string): Promise<[any | null, ErrorOrNull]>;
	getBySearch(input: {
		searchQuery?: string;
		createdByAsc: boolean;
	}): Promise<[Post[], ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[any[] | [], ErrorOrNull]>;
	getOneByFilter(filter: SQL): Promise<[Post | null, ErrorOrNull]>;
	update(filter: SQL, update: Partial<Post>, trx?: typeof db): Promise<ErrorOrNull>;
	delete(filter: SQL): Promise<ErrorOrNull>;
}

class PostService implements IPostService {
	async create(
		req: CreatePostRequest,
		trx?: typeof db,
		interestIds?: string[],
	): Promise<[string | null, ErrorOrNull]> {
		const database = trx ?? db;
		const id = randomUUID();
		const res = await database
			.insert(post)
			.values({ ...req, id })
			.returning({ id: post.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		const postId = res[0]?.id ?? null;
		if (!postId) return [null, new PostgreSQLError()];

		if (interestIds && interestIds.length > 0) {
			const interestRes = await database
				.insert(interestXPost)
				.values(
					interestIds.map((interestId) => ({
						interestId,
						postId,
					})),
				)
				.catch((e) => {
					console.log(e);
					return new PostgreSQLError();
				});

			if (interestRes instanceof Error) return [null, interestRes];
		}

		await this.sendPostNotification(postId, req.title, req.image, req.description, req.organizationId).catch(
			(e) => {
				console.log("Mail send failed: ", e);
			},
		);

		return [postId, null];
	}

	private async sendPostNotification(
		postId: string,
		postTitle: string,
		postImage: string,
		postDescription: string | null | undefined,
		organizationId: string,
	): Promise<void> {
		const postInterestRows = await db
			.select({ interestId: interestXPost.interestId })
			.from(interestXPost)
			.where(eq(interestXPost.postId, postId));

		if (postInterestRows.length === 0) return;

		const postInterestIds = postInterestRows.map((r) => r.interestId);

		const recipientRows = await db
			.select({
				userId: user.id,
				email: user.email,
				name: user.name,
			})
			.from(interestXUser)
			.innerJoin(user, eq(interestXUser.userId, user.id))
			.where(and(inArray(interestXUser.interestId, postInterestIds), eq(user.isReceiveMail, true)));

		// One email per user (same user may match multiple post interests).
		const subscribers = [...new Map(recipientRows.map((r) => [r.userId, r])).values()];

		const orgUser = await db.query.organization.findFirst({
			where: (organization, { eq }) => eq(organization.id, organizationId),
			with: {
				user: {
					columns: { name: true },
				},
			},
		});
		const organizationName = orgUser?.user?.name ?? "";

		if (subscribers.length === 0) return;
		const appBase = env.BETTER_AUTH_URL.replace(/\/$/, "");

		const messages = subscribers.map((subscriber) => {
			const token = signToken(postId);
			const claimLink = `${appBase}/api/calendar/claim?token=${token}`;
			return {
				to: subscriber.email,
				subject: `กิจกรรมใหม่จาก  ${organizationName} - ${postTitle}`,
				text: `มีกิจกรรมใหม่ "${postTitle}" คลิกลิงก์เพื่อเพิ่มลงในปฏิทิน: ${claimLink}`,
				html: ActivityCardMail({ postTitle, postImage, claimLink, postDescription, organizationName }),
			};
		});

		await bulkSendMail(messages);
	}
	async getAll(): Promise<[Post[], ErrorOrNull]> {
		const res = await db.query.post
			.findMany({
				orderBy: [desc(post.createdAt)],
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}

	async getOne(id: string): Promise<[any | null, ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(post)
			.innerJoin(organization, eq(post.organizationId, organization.id))
			.innerJoin(user, eq(organization.userId, user.id))
      .innerJoin(activityType, eq(post.activityTypeId, activityType.id))
			.where(eq(post.id, id))
			.orderBy(desc(post.date), asc(post.title));

		if (tmp instanceof Error) return [null, tmp];
		const res: any[] = [];
		if (tmp.length > 0) {
			tmp.forEach((t: any) => {
				res.push({
					...t.organization,
					...t.user,
					...t.post,
					userImage: t.organization.image,
					image: t.post.image,
          activityTypeName: t.activity_type.name
				});
			});
		}
		if (res.length == 0) return [null, new ErrorWithCategory("Calendar item not found", ErrorCategory.ResourceNotFound)];
		return [res[0], null];
	}

	async getBySearch(input: {
		searchQuery?: string;
		createdByAsc: boolean;
	}): Promise<[Post[], ErrorOrNull]> {
		try {
			const conditions = [];

			if (input.searchQuery && input.searchQuery.trim().length > 0) {
				const searchTerm = `%${input.searchQuery.trim()}%`;
				conditions.push(or(ilike(post.title, searchTerm), ilike(post.description, searchTerm)));
			}
			const orderBy = input.createdByAsc ? asc(post.createdAt) : desc(post.createdAt);

			const res = await db.query.post.findMany({
				where: conditions.length > 0 ? and(...conditions) : undefined,
				orderBy: [orderBy],
			});

			return [res, null];
		} catch (e) {
			console.log(e);
			return [[], new PostgreSQLError()];
		}
	}

	async getByFilter(filter?: SQL): Promise<[any[], ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(post)
			.innerJoin(organization, eq(post.organizationId, organization.id))
			.innerJoin(user, eq(organization.userId, user.id))
      .innerJoin(activityType, eq(post.activityTypeId, activityType.id))
			.where(filter)
			.orderBy(desc(post.date), asc(post.title));
		if (tmp instanceof Error) return [[], tmp];
		const res: any[] = [];
		if (tmp.length > 0) {
			tmp.forEach((t: any) => {
				res.push({
					...t.organization,
					...t.user,
					...t.post,
					userImage: t.user.image,
					image: t.post.image,
					id: t.post.id,
          activityTypeName: t.activity_type.name
				});
			});
		}
		return [res, null];
	}

	async getOneByFilter(filter: SQL): Promise<[Post | null, ErrorOrNull]> {
		const res = await db.query.post.findFirst({ where: filter }).catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, new ErrorWithCategory("Post not found", ErrorCategory.ResourceNotFound)];
		return [res, null];
	}

	async update(filter: SQL, update: Partial<Post>, trx?: typeof db): Promise<ErrorOrNull> {
		const database = trx ?? db;

		const res = await database
			.update(post)
			.set({ ...update, updatedAt: new Date() })
			.where(filter)
			.returning({ updatedId: post.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		if (res.length === 0) return new ErrorWithCategory("Post not found", ErrorCategory.ResourceNotFound);
		return null;
	}

	async delete(filter: SQL): Promise<ErrorOrNull> {
		const res = await db
			.delete(post)
			.where(filter)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		return null;
	}
}

export const postServiceImpl = new PostService();
