import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listCategories } from "@/server/api/modules/categories/usecases/list-categories.usecase";
import { getTRPCError } from "@/server/error";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		const [res, error] = await listCategories();
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),
});
