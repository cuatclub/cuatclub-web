import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createAffiliation,
  createCategory,
  getAllAffiliations,
  getAllCategories,
  updateAffiliation,
  updateCategory,
  deleteCategory,
  deleteAffiliation,
} from "@/server/api/modules/master-data/usecases";
import {
  CreateAffiliationInputDTOSchema,
  CreateAffiliationOutputDTOSchema,
  CreateCategoryInputDTOSchema,
  CreateCategoryOutputDTOSchema,
  GetAllAffiliationsInputDTOSchema,
  GetAllAffiliationsOutputDTOSchema,
  GetAllCategoriesInputDTOSchema,
  GetAllCategoriesOutputDTOSchema,
  UpdateAffiliationInputDTOSchema,
  UpdateAffiliationOutputDTOSchema,
  UpdateCategoryInputDTOSchema,
  UpdateCategoryOutputDTOSchema,
  DeleteCategoryInputDTOSchema,
  DeleteCategoryOutputDTOSchema,
  DeleteAffiliationInputDTOSchema,
  DeleteAffiliationOutputDTOSchema,
} from "@/server/api/modules/master-data/dto";

const affiliationsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllAffiliationsInputDTOSchema)
    .output(GetAllAffiliationsOutputDTOSchema)
    .query(async () => getAllAffiliations()),
  create: adminProcedure
    .input(CreateAffiliationInputDTOSchema)
    .output(CreateAffiliationOutputDTOSchema)
    .mutation(async ({ input }) => createAffiliation(input)),
  update: adminProcedure
    .input(UpdateAffiliationInputDTOSchema)
    .output(UpdateAffiliationOutputDTOSchema)
    .mutation(async ({ input }) => updateAffiliation(input)),
  delete: adminProcedure
    .input(DeleteAffiliationInputDTOSchema)
    .output(DeleteAffiliationOutputDTOSchema)
    .mutation(async ({ input }) => deleteAffiliation(input)),
});

const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllCategoriesInputDTOSchema)
    .output(GetAllCategoriesOutputDTOSchema)
    .query(async () => getAllCategories()),
  create: adminProcedure
    .input(CreateCategoryInputDTOSchema)
    .output(CreateCategoryOutputDTOSchema)
    .mutation(async ({ input }) => createCategory(input)),
  update: adminProcedure
    .input(UpdateCategoryInputDTOSchema)
    .output(UpdateCategoryOutputDTOSchema)
    .mutation(async ({ input }) => updateCategory(input)),
  delete: adminProcedure
    .input(DeleteCategoryInputDTOSchema)
    .output(DeleteCategoryOutputDTOSchema)
    .mutation(async ({ input }) => deleteCategory(input)),
});

export const masterDataRouter = createTRPCRouter({
  affiliations: affiliationsRouter,
  categories: categoriesRouter,
});
