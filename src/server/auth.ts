import { env } from "@/env";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
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
				type: "string",
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
});
