import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";
import { AffiliationOutputDTOSchema } from "@/server/api/modules/master-data/dto/affiliation.dto";
import { CategoryOutputDTOSchema } from "@/server/api/modules/master-data/dto/category.dto";

export const GetClubByIdInputDTOSchema = z.object({ clubId: z.string().uuid() });

export type GetClubByIdInputDTO = z.infer<typeof GetClubByIdInputDTOSchema>;

export const GetClubByIdOutputDTOSchema = ClubOutputDTOSchema.pick({
  id: true,
  shortDescription: true,
  longDescription: true,
  imageUrls: true,
  contacts: true,
}).extend({
  name: z.string(),
  logoUrl: z.string().nullable(),
  affiliation: AffiliationOutputDTOSchema.nullable(),
  categories: z.array(CategoryOutputDTOSchema),
});

export type GetClubByIdOutputDTO = z.infer<typeof GetClubByIdOutputDTOSchema>;
