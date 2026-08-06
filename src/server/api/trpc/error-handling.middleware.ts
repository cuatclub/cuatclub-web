import { t, TRPCError } from "@/server/api/trpc/init";
import { AppError, type ErrorCode } from "@/server/errors";

const ERROR_CODE_TO_TRPC_CODE: Record<ErrorCode, TRPCError["code"]> = {
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	VALIDATION: "BAD_REQUEST",
	CONFLICT: "CONFLICT",
	INTERNAL: "INTERNAL_SERVER_ERROR",
};

// Converts any AppError thrown by a usecase into the matching TRPCError.
// Routers never need their own try/catch — this runs for every procedure.
export const errorHandlingMiddleware = t.middleware(async ({ next }) => {
	const result = await next();
	if (result.ok) return result;

	const cause = result.error.cause;
	if (cause instanceof AppError) {
		throw new TRPCError({
			code: ERROR_CODE_TO_TRPC_CODE[cause.code],
			message: cause.message,
			cause,
		});
	}

	return result;
});
