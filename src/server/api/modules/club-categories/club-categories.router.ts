import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createClubCategory,
  deleteClubCategory,
  getCategoriesByClubId,
  getClubsByCategoryId,
  updateClubCategory,
} from "@/server/api/modules/club-categories/usecases";
import {
  CreateClubCategoryInputDTOSchema,
  CreateClubCategoryOutputDTOSchema,
  DeleteClubCategoryInputDTOSchema,
  DeleteClubCategoryOutputDTOSchema,
  GetCategoriesByClubIdInputDTOSchema,
  GetCategoriesByClubIdOutputDTOSchema,
  GetClubsByCategoryIdInputDTOSchema,
  GetClubsByCategoryIdOutputDTOSchema,
  UpdateClubCategoryInputDTOSchema,
  UpdateClubCategoryOutputDTOSchema,
} from "@/server/api/modules/club-categories/dto";

export const clubCategoriesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateClubCategoryInputDTOSchema)
    .output(CreateClubCategoryOutputDTOSchema)
    .mutation(async ({ input }) => createClubCategory(input)),

  update: protectedProcedure
    .input(UpdateClubCategoryInputDTOSchema)
    .output(UpdateClubCategoryOutputDTOSchema)
    .mutation(async ({ input }) => updateClubCategory(input)),

  delete: protectedProcedure
    .input(DeleteClubCategoryInputDTOSchema)
    .output(DeleteClubCategoryOutputDTOSchema)
    .mutation(async ({ input }) => deleteClubCategory(input)),

  getCategoriesByClubId: protectedProcedure
    .input(GetCategoriesByClubIdInputDTOSchema)
    .output(GetCategoriesByClubIdOutputDTOSchema)
    .query(async ({ input }) => getCategoriesByClubId(input)),

  getClubsByCategoryId: protectedProcedure
    .input(GetClubsByCategoryIdInputDTOSchema)
    .output(GetClubsByCategoryIdOutputDTOSchema)
    .query(async ({ input }) => getClubsByCategoryId(input)),
});
