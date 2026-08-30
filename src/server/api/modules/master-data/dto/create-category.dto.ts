import type { z } from "zod";
import {
  CategoryBaseInputDTOSchema,
  CategoryOutputDTOSchema,
} from "@/server/api/modules/master-data/dto/category.dto";

export const CreateCategoryInputDTOSchema = CategoryBaseInputDTOSchema;

export type CreateCategoryInputDTO = z.infer<typeof CreateCategoryInputDTOSchema>;

export const CreateCategoryOutputDTOSchema = CategoryOutputDTOSchema;

export type CreateCategoryOutputDTO = z.infer<typeof CreateCategoryOutputDTOSchema>;
