import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  DeleteImagesOutputDTOSchema,
  DeleteImagesInputDTOSchema,
  GetPresignedUrlsInputDTOSchema,
  GetPresignedUrlsOutputDTOSchema,
} from "@/server/api/modules/s3/dto/index";
import { getPresignedUrls, deleteImages } from "@/server/api/modules/s3/usecases/index";

export const s3Router = createTRPCRouter({
  getPresignedUrls: protectedProcedure
    .input(GetPresignedUrlsInputDTOSchema)
    .output(GetPresignedUrlsOutputDTOSchema)
    .mutation(async ({ input, ctx }) => getPresignedUrls(ctx.session.user.id, input)),

  deleteImages: protectedProcedure
    .input(DeleteImagesInputDTOSchema)
    .output(DeleteImagesOutputDTOSchema)
    .mutation(async ({ input, ctx }) => deleteImages(ctx.session.user.id, input)),
});
