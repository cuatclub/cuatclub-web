import { describe, expect, it } from "vitest";

import {
  ACTIVITY_TYPE_REQUIRED_MESSAGE,
  CATEGORY_REQUIRED_MESSAGE,
  studentPreferenceSchema,
} from "./student-preference-schema";

const messages = (input: Record<string, unknown>) => {
  const result = studentPreferenceSchema.safeParse(input);
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues.map((issue) => issue.message);
};

describe("studentPreferenceSchema", () => {
  it("accepts one tag in each group", () => {
    expect(
      studentPreferenceSchema.safeParse({ categoryIds: [1], activityTypeIds: [2, 3] }).success
    ).toBe(true);
  });

  it("requires at least one category and one activity type", () => {
    expect(messages({ categoryIds: [], activityTypeIds: [] })).toEqual([
      CATEGORY_REQUIRED_MESSAGE,
      ACTIVITY_TYPE_REQUIRED_MESSAGE,
    ]);
  });

  it("reports only the group that is empty", () => {
    expect(messages({ categoryIds: [1], activityTypeIds: [] })).toEqual([
      ACTIVITY_TYPE_REQUIRED_MESSAGE,
    ]);
  });
});
