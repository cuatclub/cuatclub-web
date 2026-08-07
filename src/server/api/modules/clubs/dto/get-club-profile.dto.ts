import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export type GetClubProfileInputDTO = Record<string, never>;

export const GetClubProfileInputDTOSchema = z.object({});

export const GetClubProfileOutputDTOSchema = ClubOutputDTOSchema.extend({
  email: z.string(),
  role: z.enum(["STUDENT", "CLUB", "ADMIN"]),
});

export type GetClubProfileOutputDTO = z.infer<typeof GetClubProfileOutputDTOSchema>;
