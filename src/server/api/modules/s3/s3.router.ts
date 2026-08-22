import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  GetPresignedUrlsInputDTOSchema,
  GetPresignedUrlsOutputDTOSchema,
} from "@/server/api/modules/s3/dto/index";
import { getPresignedUrls } from "./usecases/get-presigned-urls.usecase";

export const s3Router = createTRPCRouter({
  getPresignedUrls: protectedProcedure
    .input(GetPresignedUrlsInputDTOSchema)
    .output(GetPresignedUrlsOutputDTOSchema)
    .mutation(async ({ input }) => getPresignedUrls(input)),
});
