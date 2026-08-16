import { z } from "zod";
import { CategoryOutputDTOSchema } from "@/server/api/modules/master-data/dto/category.dto";

export type GetAllCategoriesInputDTO = Record<string, never>;

export const GetAllCategoriesInputDTOSchema = z.object({});

export const GetAllCategoriesOutputDTOSchema = z.array(CategoryOutputDTOSchema);

export type GetAllCategoriesOutputDTO = z.infer<typeof GetAllCategoriesOutputDTOSchema>;
