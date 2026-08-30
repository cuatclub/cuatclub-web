import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";
import { AffiliationOutputDTOSchema } from "@/server/api/modules/master-data/dto/affiliation.dto";
import { CategoryOutputDTOSchema } from "@/server/api/modules/master-data/dto/category.dto";

export const ClubSortOptionSchema = z.enum(["NAME_ASC", "NAME_DESC"]);

export type ClubSortOption = z.infer<typeof ClubSortOptionSchema>;

export const GetAllClubsInputDTOSchema = z.object({
  search: z.string().trim().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  affiliationIds: z.array(z.number().int().positive()).optional(),
  sort: ClubSortOptionSchema.default("NAME_ASC"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(9),
});

export type GetAllClubsInputDTO = z.infer<typeof GetAllClubsInputDTOSchema>;

export const ClubListItemDTOSchema = ClubOutputDTOSchema.pick({
  id: true,
  shortDescription: true,
}).extend({
  name: z.string(),
  email: z.string(),
  logoUrl: z.string().nullable(),
  affiliation: AffiliationOutputDTOSchema.nullable(),
  categories: z.array(CategoryOutputDTOSchema),
});

export type ClubListItemDTO = z.infer<typeof ClubListItemDTOSchema>;

export const GetAllClubsOutputDTOSchema = z.object({
  clubs: z.array(ClubListItemDTOSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type GetAllClubsOutputDTO = z.infer<typeof GetAllClubsOutputDTOSchema>;
