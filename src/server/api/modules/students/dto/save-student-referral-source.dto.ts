import { z } from "zod";
import { referralSourceEnum } from "@/server/db/schema/students";

export const SaveStudentReferralSourceInputDTOSchema = z
  .object({
    source: z.enum(referralSourceEnum.enumValues),
    other: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.source !== "OTHER" || !!data.other, {
    message: "Please specify how you found us.",
    path: ["other"],
  });

export type SaveStudentReferralSourceInputDTO = z.infer<
  typeof SaveStudentReferralSourceInputDTOSchema
>;

export const SaveStudentReferralSourceOutputDTOSchema = z.object({
  registrationStatus: z.literal("COMPLETED"),
});

export type SaveStudentReferralSourceOutputDTO = z.infer<
  typeof SaveStudentReferralSourceOutputDTOSchema
>;
