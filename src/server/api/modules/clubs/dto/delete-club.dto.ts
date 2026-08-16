import { z } from "zod";

export const DeleteClubInputDTOSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteClubInputDTO = z.infer<typeof DeleteClubInputDTOSchema>;

export const DeleteClubOutputDTOSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteClubOutputDTO = z.infer<typeof DeleteClubOutputDTOSchema>;
