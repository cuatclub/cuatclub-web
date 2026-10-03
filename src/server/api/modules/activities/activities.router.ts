import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createActivity,
  deleteActivity,
  deleteActivityPoster,
  getActivityPosterUploadUrl,
  getMyActivities,
  updateActivity,
} from "@/server/api/modules/activities/usecases";
import {
  CreateActivityInputDTOSchema,
  CreateActivityOutputDTOSchema,
  DeleteActivityInputDTOSchema,
  DeleteActivityOutputDTOSchema,
  DeleteActivityPosterInputDTOSchema,
  DeleteActivityPosterOutputDTOSchema,
  GetActivityPosterUploadUrlInputDTOSchema,
  GetActivityPosterUploadUrlOutputDTOSchema,
  GetMyActivitiesInputDTOSchema,
  GetMyActivitiesOutputDTOSchema,
  UpdateActivityInputDTOSchema,
  UpdateActivityOutputDTOSchema,
} from "@/server/api/modules/activities/dto";

export const activitiesRouter = createTRPCRouter({
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

  getMine: protectedProcedure
    .input(GetMyActivitiesInputDTOSchema)
    .output(GetMyActivitiesOutputDTOSchema)
    .query(async ({ ctx, input }) => getMyActivities(ctx.session.user.id, input)),

  update: protectedProcedure
    .input(UpdateActivityInputDTOSchema)
    .output(UpdateActivityOutputDTOSchema)
    .mutation(async ({ ctx, input }) => updateActivity(ctx.session.user.id, input)),

  delete: protectedProcedure
    .input(DeleteActivityInputDTOSchema)
    .output(DeleteActivityOutputDTOSchema)
    .mutation(async ({ ctx, input }) => deleteActivity(ctx.session.user.id, input)),
});
