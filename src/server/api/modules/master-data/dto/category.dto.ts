import { z } from "zod";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const CategoryOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
  fontColor: z.string(),
  backgroundColor: z.string(),
});

export type CategoryOutputDTO = z.infer<typeof CategoryOutputDTOSchema>;

export const CategoryBaseInputDTOSchema = z.object({
  label: z.string().trim().min(1).max(50),
  fontColor: z.string().regex(HEX_COLOR_REGEX, "Must be a hex color, e.g. #475569"),
  backgroundColor: z.string().regex(HEX_COLOR_REGEX, "Must be a hex color, e.g. #E2E8F0"),
});
