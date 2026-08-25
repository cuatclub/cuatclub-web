import { env } from "@/config/env";
import { db, type DbClient } from "@/server/db";
import * as schema from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Shared by every instance below so a request-scoped and a transaction-scoped one can never
// drift apart on session/password/field config.
const buildAuthOptions = (client: DbClient) => ({
  database: drizzleAdapter(client, {
    provider: "pg" as const,
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string" as const,
        input: false as const,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export const auth = betterAuth(buildAuthOptions(db));

/**
 * A better-auth instance whose adapter writes through an already-open transaction instead of
 * the module-level `db`, so its `user`/`account` inserts commit or roll back together with
 * whatever else that transaction is doing (see registerClub).
 *
 * `autoSignIn` is off here on purpose: signing in would write a session row inside the caller's
 * transaction, and the cookie that makes it useful can't be set from a tRPC usecase anyway —
 * callers sign in over better-auth's own route afterwards.
 */
export const createTransactionAuth = (client: DbClient) =>
  betterAuth({
    ...buildAuthOptions(client),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: false,
    },
  });
