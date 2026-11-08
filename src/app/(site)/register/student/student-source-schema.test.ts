import { describe, expect, it } from "vitest";

import {
  REFERRAL_SOURCE_OPTIONS,
  SOURCE_OTHER_REQUIRED_MESSAGE,
  SOURCE_REQUIRED_MESSAGE,
  studentSourceSchema,
} from "./student-source-schema";

const messages = (input: Record<string, unknown>) => {
  const result = studentSourceSchema.safeParse(input);
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues.map((issue) => issue.message);
};

describe("studentSourceSchema", () => {
  it("accepts every non-other option without free text", () => {
    for (const { value } of REFERRAL_SOURCE_OPTIONS) {
      if (value === "OTHER") continue;
      expect(studentSourceSchema.safeParse({ source: value }).success).toBe(true);
    }
  });

  it("requires a choice", () => {
    expect(messages({})).toEqual([SOURCE_REQUIRED_MESSAGE]);
  });

  it("requires free text only for the other option", () => {
    expect(messages({ source: "OTHER" })).toEqual([SOURCE_OTHER_REQUIRED_MESSAGE]);
    expect(messages({ source: "OTHER", other: "   " })).toEqual([SOURCE_OTHER_REQUIRED_MESSAGE]);
    expect(studentSourceSchema.safeParse({ source: "OTHER", other: "Facebook" }).success).toBe(
      true
    );
  });
});
