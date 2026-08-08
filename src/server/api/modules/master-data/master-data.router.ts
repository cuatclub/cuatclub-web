import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getAllAffiliations, getAllCategories } from "@/server/api/modules/master-data/usecases";
import {
  GetAllAffiliationsInputDTOSchema,
  GetAllAffiliationsOutputDTOSchema,
  GetAllCategoriesInputDTOSchema,
  GetAllCategoriesOutputDTOSchema,
} from "@/server/api/modules/master-data/dto";

const affiliationsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllAffiliationsInputDTOSchema)
    .output(GetAllAffiliationsOutputDTOSchema)
    .query(async () => getAllAffiliations()),
});

const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllCategoriesInputDTOSchema)
    .output(GetAllCategoriesOutputDTOSchema)
    .query(async () => getAllCategories()),
});

export const masterDataRouter = createTRPCRouter({
  affiliations: affiliationsRouter,
  categories: categoriesRouter,
});
