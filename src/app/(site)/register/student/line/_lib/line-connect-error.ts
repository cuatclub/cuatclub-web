export const LINE_CONNECT_CANCELLED_MESSAGE =
  "คุณยกเลิกการเชื่อมต่อ LINE สามารถลองใหม่หรือข้ามไปก่อนได้";
export const LINE_ALREADY_LINKED_MESSAGE = "บัญชี LINE นี้เชื่อมต่อกับบัญชี CUatClub อื่นอยู่แล้ว";
export const LINE_CONNECT_FAILED_MESSAGE = "เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

/**
 * Maps the `?error=` code that lands back on the connect page onto the banner copy.
 *
 * `access_denied` is LINE's own code for the student pressing Cancel on its consent
 * screen (routed here by /auth/error); `account_already_linked_to_different_user` is
 * better-auth's genericOAuth link callback refusing a LINE account another user owns.
 * Every other code is a failure the student can't act on beyond retrying, so it shares
 * one generic message rather than leaking better-auth's internal code names.
 */
export function getLineConnectErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "access_denied") return LINE_CONNECT_CANCELLED_MESSAGE;
  if (code === "account_already_linked_to_different_user") return LINE_ALREADY_LINKED_MESSAGE;
  return LINE_CONNECT_FAILED_MESSAGE;
}
