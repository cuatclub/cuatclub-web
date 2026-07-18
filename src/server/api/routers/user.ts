import { TRPCError } from "@trpc/server";
import { UpdateUserRequestSchema, UpdateProfileRequestSchema } from "../dto/user.dto";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { getTRPCError } from "@/utils/error";
import { user } from "@/server/db/auth-schema";
import z from "zod";
import { eq } from "drizzle-orm";
import { userServiceImpl } from "@/server/api/service/user.service";
import { db } from "@/server/db";
import { interestXUser } from "@/server/db/interestXUser";
import { auth } from "@/utils/auth";

export const userRouter = createTRPCRouter({
  getOrganizerUser: adminProcedure.query(async () => {
    const [res, error] = await userServiceImpl.getByFilter(eq(user.role, "ORGANIZATION"));
    if (error) throw new TRPCError(getTRPCError(error));
    return res;
  }),

  createOrganizerAccount: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fallbackName = input.email.split("@")[0] ?? "Organizer";

      try {
        const result = await auth.api.signUpEmail({
          headers: ctx.headers,
          body: {
            email: input.email,
            password: input.password,
            name: input.name ?? fallbackName,
            role: "ORGANIZATION",
          },
        });

        return {
          id: result.user.id,
          email: result.user.email,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Unable to create organizer account",
        });
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const record = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        faculty: true,
        interests: {
          with: {
            interest: true,
          },
        },
      },
    });

    if (!record) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      id: record.id,
      name: record.name,
      image: record.image,
      facultyId: record.facultyId,
      isReceiveMail: record.isReceiveMail,
      notifyEventReminders: record.notifyEventReminders,
      notifyMatchingEvents: record.notifyMatchingEvents,
      notifyClubUpdates: record.notifyClubUpdates,
      interests: record.interests.map((i) => i.interestId),
    };
  }),

  /** Self-service profile + notification preferences update (settings page). */
  updateProfile: protectedProcedure
    .input(UpdateProfileRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const res = await userServiceImpl.update(eq(user.id, userId), input);
      if (res) return new TRPCError(getTRPCError(res));
      return null;
    }),

  updateOnboardingInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().optional(),
        facultyId: z.string().optional(),
        isReceiveMail: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const res = await userServiceImpl.update(eq(user.id, userId), input);
      if (res) return new TRPCError(getTRPCError(res));
      return null;
    }),

  updateInterests: protectedProcedure
    .input(
      z.object({
        interests: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await db.transaction(async (tx) => {
        await tx
          .delete(interestXUser)
          .where(eq(interestXUser.userId, userId));

        if (input.interests.length > 0) {
          await tx.insert(interestXUser).values(
            input.interests.map((interestId) => ({
              userId,
              interestId,
            })),
          );
        }
      });

      return null;
    }),

  /** Marks onboarding wizard done for ATTENDEE or ORGANIZATION; refetch session with disableCookieCache after. */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const role = ctx.session.user.role;
    if (role !== "ORGANIZATION" && role !== "ATTENDEE") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Onboarding not applicable for this role" });
    }
    const userId = ctx.session.user.id;
    const res = await userServiceImpl.update(eq(user.id, userId), {
      onboardingComplete: true,
    });
    if (res) {
      const e = getTRPCError(res);
      throw new TRPCError({ code: e.code, message: e.message });
    }
    return null;
  }),

  update: protectedProcedure.input(UpdateUserRequestSchema).mutation(async ({ input }) => {
    const res = await userServiceImpl.update(eq(user.id, input.id), input);
    if (res) return new TRPCError(getTRPCError(res));
    return null;
  }),

  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    const res = await userServiceImpl.delete(eq(user.id, input.id));
    if (res) return new TRPCError(getTRPCError(res));
    return null;
  }),
});
