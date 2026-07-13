import { type organization, categoryEnum } from "@/server/db/organization";
import { type User } from "@/server/api/dto/user.dto";
import { z, type ZodSchema } from "zod";

export type Organization = typeof organization.$inferSelect;
export type OrganizationWithUser = Organization & { user: User };
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
    discord: z.string(),
    instagram: z.string(),
});

export const CreateOrganizationRequestSchema: ZodSchema<CreateOrganizationRequest> = z.object({
    name: z.string().min(1),
    category: z.enum(categoryEnum.enumValues),
    averageHoursPerWeek: SmallIntSchema.optional(),
    bio: z.string(),
    recruitmentPeriod: RecruitmentPeriodSchema,
    facultyId: z.string().nullable().optional(),
    userId: z.string().uuid(),
    isBanned: z.boolean(),
    socials: SocialsSchema,
    image: z.string().nullable().optional(),
});

export const UpdateOrganizationRequestSchema = z.object({
    id: z.string().uuid(),
    category: z.enum(categoryEnum.enumValues).optional(),
    averageHoursPerWeek: SmallIntSchema.optional(),
    bio: z.string().optional(),
    recruitmentPeriod: RecruitmentPeriodSchema.optional(),
    userId: z.string().uuid().optional(),
    isBanned: z.boolean().optional(),
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
    image: string | null;
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
    instagram: z.string().min(1),
    discord: z.string().min(1),
    signUpForm: z.string().optional(),
});

/** ขั้น Category — interest_x_organization */
export const SetMineInterestsStepSchema = z.object({
    interestIds: z.array(z.string()),
});

export type UpdateMineInfoStepInput = z.infer<typeof UpdateMineInfoStepSchema>;
export type UpdateMineSocialsStepInput = z.infer<typeof UpdateMineSocialsStepSchema>;
export type SetMineInterestsStepInput = z.infer<typeof SetMineInterestsStepSchema>;

/**
 * Club discovery (`/clubs`).
 *
 * `interestIds` is what the UI labels "Category". It is NOT `organization.category`,
 * which is the internal CLUB / EVENT enum and is never shown to students.
 */
export const DiscoverClubsRequestSchema = z.object({
    q: z.string().trim().max(100).optional(),
    facultyIds: z.array(z.string().min(1)).max(50).optional(),
    interestIds: z.array(z.string().min(1)).max(50).optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(24).default(6),
});

export type DiscoverClubsRequest = z.infer<typeof DiscoverClubsRequestSchema>;

/** One card in the discovery grid. Carries no owner/user fields — this is a public response. */
export type ClubCardDTO = {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
    faculty: { id: string; name: string } | null;
    interests: Array<{ id: string; name: string; icon: string }>;
    followerCount: number;
    eventCount: number;
    /** Always false for logged-out visitors. */
    isFollowing: boolean;
};

export type DiscoverClubsResponse = {
    items: ClubCardDTO[];
    /** Clubs matching q + filters, across all pages. `0` is what drives the empty state. */
    total: number;
    /** Echoed back clamped: a page past the end returns the last page. */
    page: number;
    pageCount: number;
};