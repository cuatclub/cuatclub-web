import { t } from "@/server/api/trpc/init";

export const timingMiddleware = t.middleware(async ({ next, path, type }) => {
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  const isError = result.ok === false;
  const logPrefix = result.ok === false ? "[ERROR]" : "[SUCCESS]";

  console.log(
    `[TRPC]${logPrefix} ${type} ${path} completed in ${end - start}ms` +
      (isError ? ` Error: ${result.error.message}` : ""),
  );

  return result;
});
