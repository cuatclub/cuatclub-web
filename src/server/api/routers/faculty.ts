import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { facultyServiceImpl } from "../service/faculty.service";
import {
  CreateFacultyRequestSchema,
  UpdateFacultyRequestSchema,
} from "@/server/api/dto/faculty.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";
import { faculty } from "@/server/db/faculty";
import { eq } from "drizzle-orm";

export const facultyRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const [res, error] = await facultyServiceImpl.getByFilter();
    if (error) throw new TRPCError(getTRPCError(error));
    return res;
  }),

  create: protectedProcedure
    .input(CreateFacultyRequestSchema)
    .mutation(async ({ input }) => {
      const [res, error] = await facultyServiceImpl.create(input);
      if (error) return new TRPCError(getTRPCError(error));
      return res;
    }),

  update: protectedProcedure
    .input(UpdateFacultyRequestSchema)
    .mutation(async ({ input }) => {
      const res = await facultyServiceImpl.update(eq(faculty.id, input.id), input);
      if (res) return new TRPCError(getTRPCError(res));
      return null;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const res = await facultyServiceImpl.delete(eq(faculty.id, input.id));
      if (res) return new TRPCError(getTRPCError(res));
      return null;
    }),
});