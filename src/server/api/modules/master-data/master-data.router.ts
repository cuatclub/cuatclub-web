import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getAllFaculties, getAllCategories } from "@/server/api/modules/master-data/usecases";
import {
  GetAllFacultiesInputDTOSchema,
  GetAllFacultiesOutputDTOSchema,
  GetAllCategoriesInputDTOSchema,
  GetAllCategoriesOutputDTOSchema,
} from "@/server/api/modules/master-data/dto";

const facultiesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllFacultiesInputDTOSchema)
    .output(GetAllFacultiesOutputDTOSchema)
    .query(async () => getAllFaculties()),
});

const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllCategoriesInputDTOSchema)
    .output(GetAllCategoriesOutputDTOSchema)
    .query(async () => getAllCategories()),
});

export const masterDataRouter = createTRPCRouter({
  faculties: facultiesRouter,
  categories: categoriesRouter,
});
