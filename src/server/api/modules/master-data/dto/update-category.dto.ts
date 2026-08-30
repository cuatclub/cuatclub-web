import { z } from "zod";
import {
  CategoryBaseInputDTOSchema,
  CategoryOutputDTOSchema,
} from "@/server/api/modules/master-data/dto/category.dto";

export const UpdateCategoryInputDTOSchema = CategoryBaseInputDTOSchema.extend({
  id: z.number().int().positive(),
});

export type UpdateCategoryInputDTO = z.infer<typeof UpdateCategoryInputDTOSchema>;

export const UpdateCategoryOutputDTOSchema = CategoryOutputDTOSchema;

export type UpdateCategoryOutputDTO = z.infer<typeof UpdateCategoryOutputDTOSchema>;
