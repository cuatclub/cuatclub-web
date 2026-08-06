import { type user, roleEnum } from "@/server/db/auth-schema";
import { z, type ZodSchema } from "zod";

export type User = typeof user.$inferSelect;
export type roleEnum = typeof roleEnum.enumValues;

export type CreateUserRequest = Omit<typeof user.$inferInsert, "id" | "name" | "image" | "facultyId" | "isReceiveMail" | "createdAt" | "updatedAt">;

export const CreateUserRequestSchema: ZodSchema<CreateUserRequest> = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.enum(roleEnum.enumValues),
});

export const UpdateUserRequestSchema = z.object({
    id: z.string().uuid(),
    name: z.string().optional(),
    image: z.string().optional(),
    facultyId: z.number().int().optional(),
    isReceiveMail: z.boolean().optional(),
    notifyEventReminders: z.boolean().optional(),
    notifyMatchingEvents: z.boolean().optional(),
    notifyClubUpdates: z.boolean().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(roleEnum.enumValues).optional(),
});

export const UpdateProfileRequestSchema = z.object({
    name: z.string().min(1).optional(),
	username: z
		.string()
		.trim()
		.min(3)
		.max(30)
		.regex(/^[\p{L}\p{N}_.-]+$/u, "Username may contain letters, numbers, dots, underscores, and hyphens")
		.transform((value) => value.toLowerCase())
		.nullable()
		.optional(),
    facultyId: z.number().int().nullable().optional(),
    isReceiveMail: z.boolean().optional(),
    notifyEventReminders: z.boolean().optional(),
    notifyMatchingEvents: z.boolean().optional(),
    notifyClubUpdates: z.boolean().optional(),
});
