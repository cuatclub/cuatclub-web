import { afterEach, describe, expect, it, vi } from "vitest";
import { LINE_REQUEST_TIMEOUT_MS, multicastViaLine } from "@/server/services/line/transport";

vi.mock("@/config/env", () => ({
  env: { LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "test-token" },
}));

const hangUntilAborted = (_url: string | URL | Request, init?: RequestInit) =>
  new Promise<Response>((_, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"))
    );
  });

describe("multicastViaLine", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("gives up on a request LINE never answers, without logging recipient IDs", async () => {
    const timeout = new AbortController();
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout.signal);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn(hangUntilAborted));

    const sending = multicastViaLine({
      to: ["U-secret-line-id"],
      messages: [{ type: "text", text: "hi" }],
    });

    expect(timeoutSpy).toHaveBeenCalledWith(LINE_REQUEST_TIMEOUT_MS);
    timeout.abort();

    await expect(sending).rejects.toThrow("Unable to send LINE message right now");
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("U-secret-line-id");
  });
});
