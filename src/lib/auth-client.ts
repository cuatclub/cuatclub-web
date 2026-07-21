import { env } from "@/env";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        onboardingComplete: { type: "boolean" },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, changePassword } = authClient;
