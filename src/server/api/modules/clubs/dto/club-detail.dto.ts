import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";
import {
  AffiliationOutputDTOSchema,
  CategoryOutputDTOSchema,
} from "@/server/api/modules/master-data/dto";

export const ClubDetailOutputDTOSchema = ClubOutputDTOSchema.pick({
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

export type ClubDetailOutputDTO = z.infer<typeof ClubDetailOutputDTOSchema>;
