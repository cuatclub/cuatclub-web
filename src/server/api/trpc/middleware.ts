import { t } from "@/server/api/trpc/init";
import { internalError } from "@/server/errors";

// Usecases/repositories throw TRPCError directly (see @/server/errors), so tRPC
// already reports the right code/message for those. The only thing left to do
// here is catch INTERNAL_SERVER_ERROR specifically: that's either one of our own
// internalError() calls, or a genuine unhandled exception (TypeError, etc.) that
// tRPC auto-wrapped — in the latter case its message is the raw JS error text, so
// we always log the cause and replace the message with a safe generic one.
export const errorHandlingMiddleware = t.middleware(async ({ next, path }) => {
	const result = await next();
	if (result.ok || result.error.code !== "INTERNAL_SERVER_ERROR") return result;

	console.error(`[trpc] internal error in "${path}":`, result.error.cause ?? result.error);
	throw internalError();
});
