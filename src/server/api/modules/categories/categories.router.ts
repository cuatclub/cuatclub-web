import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listCategories } from "@/server/api/modules/categories/usecases";
import { ok } from "@/server/response";

export const categoriesRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		const res = await listCategories();
		return ok(res);
	}),
});
