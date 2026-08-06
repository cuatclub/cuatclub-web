import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export interface SendMailParams {
	to: string | string[];
	subject: string;
	text: string;
	html?: string;
	/**
	 * Attachments:
	 * - `path` for remote files (public URL)
	 * - `content` for base64 or Buffer content
	 * - `filename` is required
	 * - `contentType` (optional) to override MIME type
	 */
	attachments?: Array<{
		filename: string;
		path?: string;
		content?: string | Buffer;
		contentType?: string;
	}>;
}

/** Same fields as {@link SendMailParams}, single `to` — used by {@link bulkSendMail}. */
export type BulkSendMailItem = Omit<SendMailParams, "to"> & { to: string };

/**
 * Send an email via Resend.
 * Requires at least `text` or `html`.
 */
export async function sendMail(params: SendMailParams) {
	const payload: Parameters<typeof resend.emails.send>[0] = {
		from: `CUATClub <${env.EMAIL_FROM}>`,
		...params,
	};

	try {
		const res = await resend.emails.send(payload);
		if (res.error) throw new Error(res.error.message);
	} catch (err) {
		console.error("✉️ Resend error:", err);
		throw new Error("Unable to send email right now. Please try again later.");
	}
}

/** https://resend.com/docs/api-reference/emails/send-batch-emails */
const RESEND_BATCH_MAX = 100;

/** Free tier: 2 API requests/sec — space single `emails.send` calls (attachments) slightly under that. */
const RESEND_ATTACHMENT_SEND_GAP_MS = 550;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function hasAttachments(item: BulkSendMailItem): boolean {
	return item.attachments !== undefined && item.attachments.length > 0;
}

/**
 * Send many emails: Resend **batch** for messages without attachments; **`sendMail`** per message when attachments are set (batch API does not support attachments).
 */
export async function bulkSendMail(items: BulkSendMailItem[]): Promise<void> {
	if (items.length === 0) return;

	const from = `CUATClub <${env.EMAIL_FROM}>`;

	const withAttachments = items.filter(hasAttachments);
	const batchable = items.filter((i) => !hasAttachments(i));

	for (let i = 0; i < batchable.length; i += RESEND_BATCH_MAX) {
		const chunk = batchable.slice(i, i + RESEND_BATCH_MAX);
		const payload = chunk.map((item): Parameters<typeof resend.batch.send>[0][number] => {
			const { attachments: _omit, ...rest } = item;
			return { from, ...rest };
		});

		try {
			const res = await resend.batch.send(payload);
			if (res.error) throw new Error(res.error.message);
		} catch (err) {
			console.error("✉️ Resend batch error:", err);
			throw new Error("Unable to send email right now. Please try again later.");
		}
	}

	const lastAttachmentIdx = withAttachments.length - 1;
	for (let i = 0; i < withAttachments.length; i++) {
		await sendMail(withAttachments[i]!);
		if (i !== lastAttachmentIdx) {
			await sleep(RESEND_ATTACHMENT_SEND_GAP_MS);
		}
	}
}
