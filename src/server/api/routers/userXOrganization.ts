import { TRPCError } from "@trpc/server";
import {
  FollowRequestSchema,
  GetFollowersRequestSchema,
  GetFollowingRequestSchema,
  IsFollowingRequestSchema,
  UnfollowRequestSchema,
} from "../dto/userXOrganization.dto";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { ErrorCategory, ErrorWithCategory, getTRPCError } from "@/utils/error";
import { and, eq } from "drizzle-orm";
import { userXOrganizationServiceImpl } from "../service/userXOrganization.service";
import { userXOrganization } from "@/server/db/userXOrganization";

export const userXOrganizationRouter = createTRPCRouter({
  follow: protectedProcedure
    .input(FollowRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // The actor is always the session user — never taken from the payload.
      const [res, error] = await userXOrganizationServiceImpl.create({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      if (error) throw new TRPCError(getTRPCError(error));

      return res;
    }),

  unfollow: protectedProcedure
    .input(UnfollowRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const error = await userXOrganizationServiceImpl.delete(
        and(
          eq(userXOrganization.userId, ctx.session.user.id),
          eq(userXOrganization.organizationId, input.organizationId),
        )!,
      );
      if (error) throw new TRPCError(getTRPCError(error));

      return null;
    }),

  isFollowing: protectedProcedure
    .input(IsFollowingRequestSchema)
    .query(async ({ ctx, input }) => {
      const [res, error] = await userXOrganizationServiceImpl.getOneByFilter(
        and(
          eq(userXOrganization.userId, ctx.session.user.id),
          eq(userXOrganization.organizationId, input.organizationId),
        )!,
      );
      if (error) {
        // Not following is a normal UI state, not a missing resource.
        if (error instanceof ErrorWithCategory && error.category === ErrorCategory.ResourceNotFound) {
          return false;
        }
        throw new TRPCError(getTRPCError(error));
      }

      return res !== null;
    }),

  getFollowedOrganizations: protectedProcedure
    .input(GetFollowingRequestSchema)
    .query(async ({ input }) => {
      const [res, error] = await userXOrganizationServiceImpl.getFollowedOrganizations(
        eq(userXOrganization.userId, input.userId),
      );
      if (error) throw new TRPCError(getTRPCError(error));

      return res;
    }),

  getFollowers: protectedProcedure
    .input(GetFollowersRequestSchema)
    .query(async ({ input }) => {
      const [res, error] = await userXOrganizationServiceImpl.getFollowers(
        eq(userXOrganization.organizationId, input.organizationId),
      );
      if (error) throw new TRPCError(getTRPCError(error));

      return res;
    }),

  // Public so follower counts render for logged-out visitors on club and post pages.
  countFollowers: publicProcedure
    .input(GetFollowersRequestSchema)
    .query(async ({ input }) => {
      const [res, error] = await userXOrganizationServiceImpl.countFollowers(
        eq(userXOrganization.organizationId, input.organizationId),
      );
      if (error) throw new TRPCError(getTRPCError(error));

      return res;
    }),
});
