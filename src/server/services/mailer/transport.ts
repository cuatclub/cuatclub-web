import { Resend } from "resend";
import { env } from "@/config/env";

const resend = new Resend(env.RESEND_API_KEY);

const SEND_FAILURE_MESSAGE = "Unable to send email right now. Please try again later.";

function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "***";
  const domain = email.slice(atIndex);
  return `${email[0]}***${domain}`;
}

export interface SendViaResendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendViaResendResult {
  messageId: string;
}

/** Talks to the Resend API directly. */
export async function sendViaResend(params: SendViaResendParams): Promise<SendViaResendResult> {
  try {
    const res = await resend.emails.send({
      from: `CUatClub <${env.EMAIL_FROM}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (res.error) {
      console.error("mailer: resend delivery failed", {
        name: res.error.name,
        statusCode: res.error.statusCode,
        recipient: maskEmail(params.to),
      });
      throw new Error(SEND_FAILURE_MESSAGE);
    }

    if (!res.data?.id) {
      console.error("mailer: resend returned no message id", {
        recipient: maskEmail(params.to),
      });
      throw new Error(SEND_FAILURE_MESSAGE);
    }

    return { messageId: res.data.id };
  } catch (err) {
    if (err instanceof Error && err.message === SEND_FAILURE_MESSAGE) throw err;

    const name = err instanceof Error ? err.name : undefined;
    const message = err instanceof Error ? err.message : undefined;
    console.error("mailer: resend send threw", {
      name,
      message,
      recipient: maskEmail(params.to),
    });
    throw new Error(SEND_FAILURE_MESSAGE);
  }
}
