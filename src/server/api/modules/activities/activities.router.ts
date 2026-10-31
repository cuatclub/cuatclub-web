import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  createActivity,
  deleteActivity,
  deleteActivityPoster,
  getActivityById,
  getActivityPosterUploadUrl,
  getMyActivities,
  updateActivity,
  getAllActivities,
  getSavedActivities,
  getSavedActivityIds,
  saveActivity,
  unsaveActivity,
} from "@/server/api/modules/activities/usecases";
import {
  CreateActivityInputDTOSchema,
  CreateActivityOutputDTOSchema,
  DeleteActivityInputDTOSchema,
  DeleteActivityOutputDTOSchema,
  DeleteActivityPosterInputDTOSchema,
  DeleteActivityPosterOutputDTOSchema,
  GetActivityByIdInputDTOSchema,
  GetActivityByIdOutputDTOSchema,
  GetActivityPosterUploadUrlInputDTOSchema,
  GetActivityPosterUploadUrlOutputDTOSchema,
  GetMyActivitiesInputDTOSchema,
  GetMyActivitiesOutputDTOSchema,
  UpdateActivityInputDTOSchema,
  UpdateActivityOutputDTOSchema,
  GetAllActivitiesInputDTOSchema,
  GetAllActivitiesOutputDTOSchema,
  GetSavedActivitiesInputDTOSchema,
  GetSavedActivitiesOutputDTOSchema,
  GetSavedActivityIdsInputDTOSchema,
  GetSavedActivityIdsOutputDTOSchema,
  SaveActivityInputDTOSchema,
  SaveActivityOutputDTOSchema,
  UnsaveActivityInputDTOSchema,
  UnsaveActivityOutputDTOSchema,
} from "@/server/api/modules/activities/dto";

export const activitiesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllActivitiesInputDTOSchema)
    .output(GetAllActivitiesOutputDTOSchema)
    .query(async ({ input }) => getAllActivities(input)),

  getById: publicProcedure
    .input(GetActivityByIdInputDTOSchema)
    .output(GetActivityByIdOutputDTOSchema)
    .query(async ({ input }) => getActivityById(input)),

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

  save: protectedProcedure
    .input(SaveActivityInputDTOSchema)
    .output(SaveActivityOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveActivity(ctx.session.user.id, input)),

  unsave: protectedProcedure
    .input(UnsaveActivityInputDTOSchema)
    .output(UnsaveActivityOutputDTOSchema)
    .mutation(async ({ ctx, input }) => unsaveActivity(ctx.session.user.id, input)),

  getSaved: protectedProcedure
    .input(GetSavedActivitiesInputDTOSchema)
    .output(GetSavedActivitiesOutputDTOSchema)
    .query(async ({ ctx, input }) => getSavedActivities(ctx.session.user.id, input)),

  getSavedIds: protectedProcedure
    .input(GetSavedActivityIdsInputDTOSchema)
    .output(GetSavedActivityIdsOutputDTOSchema)
    .query(async ({ ctx }) => getSavedActivityIds(ctx.session.user.id)),
});
