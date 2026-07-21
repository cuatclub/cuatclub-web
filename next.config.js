/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	// Mirror BETTER_AUTH_URL for client bundles (auth client, TRPC) when NEXT_PUBLIC_* is unset.
	env: {
		NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
	},
	output: "standalone",
	// temp fix: should use proper typing
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "placehold.co",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.r2.dev",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "cdn.cuatclub.com",
				pathname: "/**",
			},
		],
	},
};

export default config;
