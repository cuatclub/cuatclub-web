import { z } from "zod";

export const AdminDeleteClubInputDTOSchema = z.object({ id: z.string().uuid() });
export type AdminDeleteClubInputDTO = z.infer<typeof AdminDeleteClubInputDTOSchema>;

export const AdminDeleteClubOutputDTOSchema = z.object({ success: z.literal(true) });
export type AdminDeleteClubOutputDTO = z.infer<typeof AdminDeleteClubOutputDTOSchema>;
