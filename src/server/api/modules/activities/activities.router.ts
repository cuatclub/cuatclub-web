import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createActivity,
  deleteActivityPoster,
  getActivityPosterUploadUrl,
} from "@/server/api/modules/activities/usecases";
import {
  CreateActivityInputDTOSchema,
  CreateActivityOutputDTOSchema,
  DeleteActivityPosterInputDTOSchema,
  DeleteActivityPosterOutputDTOSchema,
  GetActivityPosterUploadUrlInputDTOSchema,
  GetActivityPosterUploadUrlOutputDTOSchema,
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
});
