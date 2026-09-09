import { z } from "zod";
import { FacultyOutputDTOSchema } from "@/server/api/modules/master-data/dto/faculty.dto";

export type GetAllFacultiesInputDTO = Record<string, never>;

export const GetAllFacultiesInputDTOSchema = z.object({});

export const GetAllFacultiesOutputDTOSchema = z.array(FacultyOutputDTOSchema);

export type GetAllFacultiesOutputDTO = z.infer<typeof GetAllFacultiesOutputDTOSchema>;
