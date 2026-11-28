import { env } from "@/config/env";
import { LINE_PROVIDER_ID } from "@/lib/line";
import { EMAIL_SEND_FAILED_CODE, USER_NOT_FOUND_CODE } from "@/lib/password-reset";
import { db, type DbClient } from "@/server/db";
import * as schema from "@/server/db/schema";
import { sendPasswordResetEmail } from "@/server/services/mailer";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { genericOAuth, line } from "better-auth/plugins";

const PASSWORD_RESET_TTL_SECONDS = 60 * 60;
const REQUEST_PASSWORD_RESET_PATH = "/request-password-reset";

// better-auth only logs what `sendResetPassword` throws and still answers 200, so the failure is
// noted per request here and turned into an error by the `after` hook.
const failedResetEmails = new WeakSet<Request>();

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
    resetPasswordTokenExpiresIn: PASSWORD_RESET_TTL_SECONDS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async (
      { user, url }: { user: { email: string }; url: string },
      request?: Request
    ) => {
      try {
        await sendPasswordResetEmail({ to: user.email, resetUrl: url });
      } catch (err) {
        if (request) failedResetEmails.add(request);
        throw err;
      }
    },
  },
  rateLimit: {
    customRules: {
      [REQUEST_PASSWORD_RESET_PATH]: { window: 60, max: 3 },
    },
  },
  // Off on purpose: email/password sign-up here has no email verification, so by default a
  // Google login would be linked into an existing unverified password account with the same
  // email — letting whoever registered that email first keep access after the real owner signs
  // in with Google. A clash now fails the Google sign-in instead. `allowDifferentEmails` is for
  // the explicit LINE link (/oauth2/link), whose LINE email never matches the account's.
  account: {
    accountLinking: { enabled: false, allowDifferentEmails: true },
  },
  // Google sign-ups get the DB-default STUDENT role; their `students` row is created lazily
  // by getStudentRegistration.
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
  onAPIError: { errorURL: "/auth/error" },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Deliberately reveals whether an email has an account, so the form can say so instead of
      // claiming an email was sent. Hooks run before body validation, hence the type check.
      if (ctx.path === REQUEST_PASSWORD_RESET_PATH) {
        const { email } = (ctx.body ?? {}) as { email?: unknown };
        if (typeof email !== "string") return;
        if (await ctx.context.internalAdapter.findUserByEmail(email)) return;
        throw new APIError("NOT_FOUND", { code: USER_NOT_FOUND_CODE, message: "User not found" });
      }

      // `/oauth2/link` accepts any session, so refuse non-students here.
      if (ctx.path !== "/oauth2/link") return;

      const session = await getSessionFromCtx<{ role: string }>(ctx);
      if (session && session.user.role !== "STUDENT") throw new APIError("FORBIDDEN");
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== REQUEST_PASSWORD_RESET_PATH) return;
      if (!ctx.request || !failedResetEmails.has(ctx.request)) return;

      throw new APIError("BAD_GATEWAY", {
        code: EMAIL_SEND_FAILED_CODE,
        message: "Unable to send email",
      });
    }),
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          ...line({
            providerId: LINE_PROVIDER_ID,
            clientId: env.LINE_LOGIN_CHANNEL_ID,
            clientSecret: env.LINE_LOGIN_CHANNEL_SECRET,
            scopes: ["openid", "profile"],
            pkce: true,
            disableSignUp: true,
          }),
          authorizationUrlParams: { bot_prompt: "aggressive" },
          mapProfileToUser: (profile) => ({ email: `${String(profile.id)}@line.invalid` }),
        },
      ],
    }),
  ],
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
export const createTransactionAuth = (client: DbClient) => {
  const options = buildAuthOptions(client);
  return betterAuth({
    ...options,
    emailAndPassword: { ...options.emailAndPassword, autoSignIn: false },
  });
};
