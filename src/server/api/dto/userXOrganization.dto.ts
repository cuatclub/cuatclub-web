import type { userXOrganization } from "@/server/db/userXOrganization";
import type { User } from "@/server/api/dto/user.dto";
import { z } from "zod";

export type UserXOrganization = typeof userXOrganization.$inferSelect;

export type CreateUserXOrganizationRequest = typeof userXOrganization.$inferInsert;

/** Follower shape exposed by the API — never email or other PII. */
export type PublicUser = Pick<User, "id" | "name" | "image">;

// IDs here are better-auth text IDs, not UUIDs — z.string().uuid() would reject them.
// Mutations take no userId: the actor always comes from the session.
export const FollowRequestSchema = z.object({
  organizationId: z.string().min(1),
});

export const UnfollowRequestSchema = z.object({
  organizationId: z.string().min(1),
});

export const IsFollowingRequestSchema = z.object({
  organizationId: z.string().min(1),
});

export const GetFollowingRequestSchema = z.object({
  userId: z.string().min(1),
});

export const GetFollowersRequestSchema = z.object({
  organizationId: z.string().min(1),
});
