import { z } from "zod";

export const FollowOrganizationRequestSchema = z.object({
	organizationId: z.string().uuid(),
});

export type FollowOrganizationRequest = z.infer<typeof FollowOrganizationRequestSchema>;
