import { env } from "@/config/env";
import { chunk } from "@/server/utils";

const MULTICAST_URL = "https://api.line.me/v2/bot/message/multicast";

const SEND_FAILURE_MESSAGE = "Unable to send LINE message right now. Please try again later.";

export const LINE_MULTICAST_MAX_RECIPIENTS = 500;

/** Bounds each request: callers await the send, so a stalled LINE would otherwise stall them. */
export const LINE_REQUEST_TIMEOUT_MS = 5_000;

/** Extension point: add a Flex variant here (plus a template); callers don't change. */
export type LineMessage = { type: "text"; text: string };

export interface MulticastViaLineParams {
  to: string[];
  messages: LineMessage[];
}

async function readLineErrorMessage(res: Response): Promise<string | undefined> {
  const body: unknown = await res.json().catch(() => undefined);
  if (typeof body === "object" && body !== null && "message" in body) {
    return typeof body.message === "string" ? body.message : undefined;
  }
  return undefined;
}

/**
 * Talks to the LINE Messaging API directly. Sends one multicast per 500 recipients and stops at
 * the first failure — chunks before it have already been delivered.
 * Never logs recipient IDs or message text.
 */
export async function multicastViaLine(params: MulticastViaLineParams): Promise<void> {
  for (const recipients of chunk(params.to, LINE_MULTICAST_MAX_RECIPIENTS)) {
    let res: Response;
    try {
      res = await fetch(MULTICAST_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: recipients, messages: params.messages }),
        signal: AbortSignal.timeout(LINE_REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      console.error("line: multicast threw", {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : undefined,
        recipients: recipients.length,
      });
      throw new Error(SEND_FAILURE_MESSAGE);
    }

    if (!res.ok) {
      console.error("line: multicast failed", {
        status: res.status,
        message: await readLineErrorMessage(res),
        recipients: recipients.length,
      });
      throw new Error(SEND_FAILURE_MESSAGE);
    }
  }
}
