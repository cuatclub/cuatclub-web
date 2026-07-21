import { and, asc, desc, eq, type SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import type { CalendarItem, CreateCalendarItemRequest } from "@/server/api/dto/calendarItem.dto";
import { calendarItem } from "@/server/db/calendarItem";
import { post } from "@/server/db/post";
import { user } from "@/server/db/auth-schema";
import { organization } from "@/server/db/organization";

export interface ICalendarItemService {
	create(req: CreateCalendarItemRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]>;
	getByMonth(filter?: SQL): Promise<[any[], ErrorOrNull]>;
	getAllByUserId(filter?: SQL): Promise<[any[], ErrorOrNull]>; // getAll
	getOneByUserId(filter: SQL): Promise<[any | null, ErrorOrNull]>;
	getOneByFilter(filter: SQL): Promise<[any | null, ErrorOrNull]>;
	update(filter: SQL, update: Partial<CalendarItem>, trx?: typeof db): Promise<[string | null, ErrorOrNull]>;
	delete(filter: SQL): Promise<ErrorOrNull>;
}

class CalendarItemService implements ICalendarItemService {
	async create(req: CreateCalendarItemRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]> {
		const database = trx ?? db;
		const id = randomUUID();
		const res = await database
			.insert(calendarItem)
			.values({ ...req, id })
			.returning({ id: calendarItem.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res[0]?.id ?? null, null];
	}

	async getByMonth(filter?: SQL): Promise<[any[], ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(calendarItem)
			.innerJoin(post, eq(calendarItem.postId, post.id))
			.innerJoin(organization, eq(post.organizationId, organization.id))
			.innerJoin(user, eq(organization.userId, user.id))
			.where(filter)
			.orderBy(desc(post.date), asc(post.title));

		if (tmp instanceof Error) return [[], tmp];
		const res: any[] = [];
		if (tmp.length > 0) {
			tmp.forEach((t: (typeof tmp)[0]) => {
				res.push({
					...t.post,
					...t.organization,
					...t.user,
					...t.calendar_item,
					userImage: t.user.image,
					postCreatedAt: t.post.createdAt,
					postUpdatedAt: t.post.updatedAt,
				});
			});
		}

		return [res, null];
	}

	async getAllByUserId(filter?: SQL): Promise<[any[], ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(calendarItem)
			.innerJoin(post, eq(calendarItem.postId, post.id))
			.innerJoin(organization, eq(post.organizationId, organization.id))
			.innerJoin(user, eq(organization.userId, user.id))
			.where(filter)
			.orderBy(desc(post.date), asc(post.title));

		if (tmp instanceof Error) return [[], tmp];
		const res: any[] = [];
		if (tmp.length > 0) {
			tmp.forEach((t: (typeof tmp)[0]) => {
				res.push({
					...t.post,
					...t.organization,
					...t.user,
					...t.calendar_item,
					userImage: t.user.image,
					image: t.post.image,
				});
			});
		}

		return [res, null];
	}

	async getOneByUserId(filter: SQL): Promise<[CalendarItem | null, ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(calendarItem)
			.innerJoin(post, eq(calendarItem.postId, post.id))
			.innerJoin(organization, eq(post.organizationId, organization.id))
			.innerJoin(user, eq(organization.userId, user.id))
			.where(filter)
			.orderBy(desc(post.date), asc(post.title));

		if (tmp instanceof Error) return [null, tmp];
		const res: any[] = [];
		if (tmp.length > 0) {
			tmp.forEach((t: (typeof tmp)[0]) => {
				res.push({
					...t.post,
					...t.organization,
					...t.user,
					...t.calendar_item,
					userImage: t.user.image,
					image: t.post.image,
				});
			});
		}
		if (res.length == 0)
			return [null, new ErrorWithCategory("Calendar item not found", ErrorCategory.ResourceNotFound)];
		return [res[0], null];
	}

	/** Existence check for calendar_item rows (e.g. claim flow). Empty result is [null, null], not an error. */
	async getOneByFilter(filter: SQL): Promise<[any | null, ErrorOrNull]> {
		const tmp = await db
			.select()
			.from(calendarItem)
			.where(filter)
			.limit(1)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (tmp instanceof Error) return [null, tmp];
		if (tmp.length === 0) return [null, null];
		return [tmp[0], null];
	}

	async update(filter: SQL, update: Partial<CalendarItem>, trx?: typeof db): Promise<[string | null, ErrorOrNull]> {
		const database = trx ?? db;

		const res = await database
			.update(calendarItem)
			.set({ ...update, updatedAt: new Date() })
			.where(filter)
			.returning({ updatedId: calendarItem.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		if (res.length === 0)
			return [null, new ErrorWithCategory("Calendar item not found", ErrorCategory.ResourceNotFound)];
		return [res[0]?.updatedId ?? null, null];
	}

	async delete(filter: SQL): Promise<ErrorOrNull> {
		const res = await db
			.delete(calendarItem)
			.where(filter)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		return null;
	}
}

export const calendarItemServiceImpl = new CalendarItemService();
