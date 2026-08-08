import { TRPCError } from "@trpc/server";

const GENERIC_MESSAGE = "Something went wrong. Please try again or contact support.";

export const notFound = (message = "Resource not found") =>
  new TRPCError({ code: "NOT_FOUND", message });

export const unauthorized = (message = "Unauthorized") =>
  new TRPCError({ code: "UNAUTHORIZED", message });

export const forbidden = (message = "Forbidden") => new TRPCError({ code: "FORBIDDEN", message });

export const validationError = (message = "Validation failed") =>
  new TRPCError({ code: "BAD_REQUEST", message });

export const conflict = (message = "Conflict") => new TRPCError({ code: "CONFLICT", message });

// `cause` is never sent to the client (see errorHandlingMiddleware / errorFormatter) —
// it's there purely so the raw failure still shows up in server logs.
export const internalError = (cause?: unknown) =>
  new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: GENERIC_MESSAGE, cause });

// Repositories only ever catch driver/query exceptions — this is the single
// place that turns them into a TRPCError so callers never see a raw DB error.
export const wrapRepoError = (e: unknown): never => {
  throw internalError(e);
};
