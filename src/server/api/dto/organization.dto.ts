import { type organization, categoryEnum } from "@/server/db/organization";
import { type User } from "@/server/api/dto/user.dto";
import type { Interest } from "@/server/api/dto/interest.dto";
import { z, type ZodSchema } from "zod";

export type Organization = typeof organization.$inferSelect;
export type OrganizationWithUser = Organization & {
	user: User;
	interests: Array<{
		interestId: string;
		organizationId: string;
		interest: Interest;
	}>;
};
export type CategoryEnum = typeof categoryEnum.enumValues;

export type CreateOrganizationRequest = Omit<typeof organization.$inferInsert, "id" | "createdAt" | "updatedAt">;

const SmallIntSchema = z.number()
    .int()
    .min(-32768)
    .max(32767);

const RecruitmentPeriodSchema = z.object({
    allYear: z.boolean().optional(),
    start: z.date().optional(),
    end: z.date().optional(),
});

const SocialsSchema = z.object({
    signUpForm: z.string().optional(),
    discord: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    line: z.string().optional(),
});

const OwnerContactSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    line: z.string().optional(),
});

const GallerySchema = z.array(z.string());

export const CreateOrganizationRequestSchema: ZodSchema<CreateOrganizationRequest> = z.object({
    name: z.string().min(1),
    category: z.enum(categoryEnum.enumValues),
    averageHoursPerWeek: SmallIntSchema.optional(),
    bio: z.string(),
    detailedDescription: z.string().nullable().optional(),
    gallery: GallerySchema.optional(),
    recruitmentPeriod: RecruitmentPeriodSchema,
    facultyId: z.string().nullable().optional(),
    userId: z.string().uuid(),
    isBanned: z.boolean(),
    ownerContact: OwnerContactSchema.optional(),
    socials: SocialsSchema.optional(),
    image: z.string().nullable().optional(),
});

export const UpdateOrganizationRequestSchema = z.object({
    id: z.string().uuid(),
    category: z.enum(categoryEnum.enumValues).optional(),
    averageHoursPerWeek: SmallIntSchema.optional(),
    bio: z.string().optional(),
    detailedDescription: z.string().nullable().optional(),
    gallery: GallerySchema.optional(),
    recruitmentPeriod: RecruitmentPeriodSchema.optional(),
    userId: z.string().uuid().optional(),
    isBanned: z.boolean().optional(),
    ownerContact: OwnerContactSchema.optional(),
    socials: SocialsSchema.optional(),
    name: z.string().optional(),
    facultyId: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
});

/** Current user's org snapshot for onboarding / profile. */
export type OrganizationMineDTO = {
    id: string;
    name: string;
    facultyId: string | null;
    bio: string | null;
    detailedDescription: string | null;
    gallery: string[];
    image: string | null;
    ownerContact: Organization["ownerContact"];
    socials: Organization["socials"];
    interests: string[];
};

export const UpdateMineInfoStepSchema = z.object({
    name: z.string().min(1),
    facultyId: z.string().min(1),
    bio: z.string().min(1),
    image: z.string().min(1).optional(),
});

/** ขั้น Contact — socials */
export const UpdateMineSocialsStepSchema = z.object({
    instagram: z.string().optional(),
    discord: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    line: z.string().optional(),
    signUpForm: z.string().optional(),
});

/** ขั้น Category — interest_x_organization */
export const SetMineInterestsStepSchema = z.object({
    interestIds: z.array(z.string()),
});

export type UpdateMineInfoStepInput = z.infer<typeof UpdateMineInfoStepSchema>;
export type UpdateMineSocialsStepInput = z.infer<typeof UpdateMineSocialsStepSchema>;
export type SetMineInterestsStepInput = z.infer<typeof SetMineInterestsStepSchema>;
