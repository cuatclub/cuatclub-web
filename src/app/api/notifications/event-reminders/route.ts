import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { eventReminderServiceImpl } from "@/server/api/service/eventReminder.service";

export const dynamic = "force-dynamic";

const secretsMatch = (actual: string, expected: string) => {
	const actualBuffer = Buffer.from(actual);
	const expectedBuffer = Buffer.from(expected);
	return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

async function runReminderJob(request: NextRequest) {
	const secret = env.CRON_SECRET;
	if (!secret) {
		return NextResponse.json({ error: "Reminder job is not configured" }, { status: 503 });
	}

	const authorization = request.headers.get("authorization") ?? "";
	const suppliedSecret = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
	if (!secretsMatch(suppliedSecret, secret)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await eventReminderServiceImpl.sendDueReminders();
		return NextResponse.json(result);
	} catch {
		return NextResponse.json({ error: "Unable to deliver reminders" }, { status: 500 });
	}
}

export const GET = runReminderJob;
export const POST = runReminderJob;
