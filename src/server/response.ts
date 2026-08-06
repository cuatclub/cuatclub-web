import { z, type ZodType } from "zod";

export type ApiSuccess<T> = { success: true; data: T };

export function ok<T>(data: T): ApiSuccess<T> {
	return { success: true, data };
}

export const ApiResponseSchema = <T extends ZodType>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		data: dataSchema,
	});
