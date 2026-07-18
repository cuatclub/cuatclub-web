import { and, eq, gt, isNull, lt, lte, or } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { calendarItem } from "@/server/db/calendarItem";
import { eventReminderDelivery } from "@/server/db/eventReminderDelivery";
import { post } from "@/server/db/post";
import { bulkSendMail, type BulkSendMailItem } from "@/server/utils/mailer";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const STALE_CLAIM_MS = 60 * 60 * 1000;
const DELIVERY_BATCH_SIZE = 100;
const MAX_REMINDERS_PER_RUN = 500;

type ReminderCandidate = {
	userId: string;
	postId: string;
	email: string;
	name: string;
	postTitle: string;
	deadline: Date;
};

const candidateKey = ({ userId, postId }: Pick<ReminderCandidate, "userId" | "postId">) => `${userId}:${postId}`;

const deliveryFilter = (candidates: Array<Pick<ReminderCandidate, "userId" | "postId">>) =>
	or(
		...candidates.map((candidate) =>
			and(
				eq(eventReminderDelivery.userId, candidate.userId),
				eq(eventReminderDelivery.postId, candidate.postId),
			),
		),
	)!;

const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return entities[character] ?? character;
	});

const toMessage = (candidate: ReminderCandidate): BulkSendMailItem => {
	const postUrl = `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/posts/${candidate.postId}`;
	const deadline = new Intl.DateTimeFormat("th-TH", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Bangkok",
	}).format(candidate.deadline);
	const recipientName = escapeHtml(candidate.name);
	const postTitle = escapeHtml(candidate.postTitle);

	return {
		to: candidate.email,
		subject: `ใกล้ถึงกำหนดการ ${candidate.postTitle}`,
		text: `สวัสดี ${candidate.name} กิจกรรม "${candidate.postTitle}" ที่คุณบันทึกไว้จะถึงกำหนดในวันที่ ${deadline}: ${postUrl}`,
		html: `<p>สวัสดี ${recipientName}</p><p>กิจกรรม <strong>${postTitle}</strong> ที่คุณบันทึกไว้จะถึงกำหนดในวันที่ ${deadline}</p><p><a href="${postUrl}">ดูรายละเอียดกิจกรรม</a></p>`,
	};
};

class EventReminderService {
	async sendDueReminders(now = new Date()): Promise<{ sent: number; eligible: number }> {
		const staleBefore = new Date(now.getTime() - STALE_CLAIM_MS);
		await db
			.delete(eventReminderDelivery)
			.where(and(isNull(eventReminderDelivery.sentAt), lt(eventReminderDelivery.claimedAt, staleBefore)));

		const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);
		const candidates = await db
			.select({
				userId: user.id,
				postId: post.id,
				email: user.email,
				name: user.name,
				postTitle: post.title,
				deadline: post.date,
			})
			.from(calendarItem)
			.innerJoin(user, eq(calendarItem.userId, user.id))
			.innerJoin(post, eq(calendarItem.postId, post.id))
			.leftJoin(
				eventReminderDelivery,
				and(
					eq(eventReminderDelivery.userId, calendarItem.userId),
					eq(eventReminderDelivery.postId, calendarItem.postId),
				),
			)
			.where(
				and(
					eq(user.isReceiveMail, true),
					eq(user.notifyEventReminders, true),
					gt(post.date, now),
					lte(post.date, windowEnd),
					isNull(eventReminderDelivery.userId),
				),
			)
			.limit(MAX_REMINDERS_PER_RUN);

		if (candidates.length === 0) return { sent: 0, eligible: 0 };

		const claims = await db
			.insert(eventReminderDelivery)
			.values(candidates.map(({ userId, postId }) => ({ userId, postId, claimedAt: now })))
			.onConflictDoNothing()
			.returning({
				userId: eventReminderDelivery.userId,
				postId: eventReminderDelivery.postId,
			});
		const claimedKeys = new Set(claims.map(candidateKey));
		const claimedCandidates = candidates.filter((candidate) => claimedKeys.has(candidateKey(candidate)));

		let sent = 0;
		try {
			for (let index = 0; index < claimedCandidates.length; index += DELIVERY_BATCH_SIZE) {
				const chunk = claimedCandidates.slice(index, index + DELIVERY_BATCH_SIZE);
				await bulkSendMail(chunk.map(toMessage));
				await db
					.update(eventReminderDelivery)
					.set({ sentAt: new Date() })
					.where(deliveryFilter(chunk));
				sent += chunk.length;
			}
		} catch (error) {
			const unsent = claimedCandidates.slice(sent);
			if (unsent.length > 0) {
				await db
					.delete(eventReminderDelivery)
					.where(and(isNull(eventReminderDelivery.sentAt), deliveryFilter(unsent)));
			}
			throw error;
		}

		return { sent, eligible: candidates.length };
	}
}

export const eventReminderServiceImpl = new EventReminderService();
