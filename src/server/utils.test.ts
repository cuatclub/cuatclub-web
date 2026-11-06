import { describe, expect, it } from "vitest";
import { chunk } from "@/server/utils";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `U${i}`);

describe("chunk", () => {
  it("returns no chunks for an empty list", () => {
    expect(chunk([], 500)).toEqual([]);
  });

  it("keeps exactly one full chunk intact", () => {
    expect(chunk(ids(500), 500).map((c) => c.length)).toEqual([500]);
  });

  it("splits past the limit and keeps order", () => {
    const chunks = chunk(ids(1001), 500);
    expect(chunks.map((c) => c.length)).toEqual([500, 500, 1]);
    expect(chunks[2]).toEqual(["U1000"]);
  });
});
