import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  createActivity,
  deleteActivityPoster,
  getActivityPosterUploadUrl,
  getAllActivities,
} from "@/server/api/modules/activities/usecases";
import {
  CreateActivityInputDTOSchema,
  CreateActivityOutputDTOSchema,
  DeleteActivityPosterInputDTOSchema,
  DeleteActivityPosterOutputDTOSchema,
  GetActivityPosterUploadUrlInputDTOSchema,
  GetActivityPosterUploadUrlOutputDTOSchema,
  GetAllActivitiesInputDTOSchema,
  GetAllActivitiesOutputDTOSchema,
} from "@/server/api/modules/activities/dto";

export const activitiesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllActivitiesInputDTOSchema)
    .output(GetAllActivitiesOutputDTOSchema)
    .query(async ({ input }) => getAllActivities(input)),

  getPosterUploadUrl: protectedProcedure
    .input(GetActivityPosterUploadUrlInputDTOSchema)
    .output(GetActivityPosterUploadUrlOutputDTOSchema)
    .mutation(async ({ ctx, input }) => getActivityPosterUploadUrl(ctx.session.user.id, input)),

  deletePoster: protectedProcedure
    .input(DeleteActivityPosterInputDTOSchema)
    .output(DeleteActivityPosterOutputDTOSchema)
    .mutation(async ({ ctx, input }) => deleteActivityPoster(ctx.session.user.id, input)),

  create: protectedProcedure
    .input(CreateActivityInputDTOSchema)
    .output(CreateActivityOutputDTOSchema)
    .mutation(async ({ ctx, input }) => createActivity(ctx.session.user.id, input)),
});
