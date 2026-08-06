import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listFaculties } from "@/server/api/modules/faculties/usecases/listFaculties.usecase";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";

export const facultiesRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		const [res, error] = await listFaculties();
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),
});
