import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listFaculties } from "@/server/api/modules/faculties/usecases";
import { ok } from "@/server/response";

export const facultiesRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		const res = await listFaculties();
		return ok(res);
	}),
});
