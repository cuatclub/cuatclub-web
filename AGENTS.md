# AGENTS.md

## Project overview

`eventfinder` is a T3-stack web application for discovering campus events/activities and managing them as an organization. Users register as either **ATTENDEE** or **ORGANIZATION** (admin accounts are created by an admin). Attendees browse events, save them to a personal calendar, and follow clubs; organizations create event posts and manage them.

Stack: Next.js 15 (App Router, Turbo dev), React 19, TypeScript (strict), tRPC v11, Drizzle ORM (**PostgreSQL** via `postgres-js`), Better Auth, TailwindCSS v4, Radix UI, TanStack Query, FullCalendar, Resend (email), AWS S3 / Cloudflare R2 (uploads).

Package manager is **`yarn`** (pinned `yarn@1.22.19`).

## Common commands

```bash
yarn dev                # next dev --turbo
yarn build              # next build
yarn start              # next start
yarn preview            # build + start

yarn check              # next lint && tsc --noEmit   (run before commits)
yarn lint               # next lint
yarn lint:fix           # next lint --fix
yarn typecheck          # tsc --noEmit
yarn format:check       # prettier --check
yarn format:write       # prettier --write

# Drizzle (Postgres)
yarn db:generate        # generate migrations from schema
yarn db:migrate         # apply migrations
yarn db:push            # push schema directly (dev only)
yarn db:studio          # open Drizzle Studio
yarn db:seed            # tsx src/server/scripts/seed.ts

# Local DB
docker compose up -d    # spawn Postgres 18 container (t3-postgres)
```

## Architecture

### Database (single Postgres instance)

`src/server/db/index.ts` exports `db` — a `drizzle-orm/postgres-js` client backed by `DATABASE_URL`, schema in `src/server/db/schema.ts` plus per-table modules (`src/server/db/<table>.ts`) and the Better Auth schema in `src/server/db/auth-schema.ts`. The connection is cached on `globalThis` to survive HMR in dev.

ESLint enforces `drizzle/enforce-delete-with-where` and `enforce-update-with-where` on `db` and `ctx.db` — **never** write a bare `.delete()` or `.update()` without a `.where()`.

### tRPC layering

`src/server/api/root.ts` composes `appRouter` from routers in `src/server/api/routers/*`. Procedures come from `src/server/api/trpc.ts`:

- `publicProcedure` — anyone (session optional)
- `protectedProcedure` — requires a session (`ctx.session.user` non-null)
- `adminProcedure` — requires `ctx.session.user.role === "ADMIN"`

Expected control flow:

```
src/app/**                  ──► tRPC client (src/trpc/{react,server}.ts)
src/server/api/routers/*    ──► src/server/api/service/**  ──► db
```

Routers stay **thin**: validate input with Zod, delegate to a service, map service errors to `TRPCError` via `getTRPCError`. Services own the Drizzle queries for their domain. Cross-cutting helpers live in `src/utils/` and DTOs in `src/server/api/dto/`.

### Service pattern

Services are schema-owned persistence modules, not business workflows. One service per table/domain with an exported interface plus implementation class, using CRUD-shaped methods (`getByFilter`, `getOneByFilter`, `update`, `delete`, …) that accept an optional transaction (`trx?: typeof db`). They return a `[result, error]` tuple where `error` is `ErrorOrNull` (see `src/utils/error.ts` — `PostgreSQLError`, `ErrorWithCategory`, `ErrorCategory`). Export a singleton instance, e.g. `export const userServiceImpl = new UserService();`.

Keep request/response/domain types in `src/server/api/dto/*`, not in service files. Import them with `import type { ... }`.

### App Router structure

Route groups by audience:

- `src/app/(attendee)/**` — attendee-only routes (guarded by `requireRole("ATTENDEE")` in the group layout).
- `src/app/(organization)/**` — organization-only routes.
- `src/app/(admin)/**` — admin-only routes.
- `src/app/(shared)/**` — routes accessible to multiple roles (e.g. `/posts/[id]` event details).
- `src/app/auth/**` — auth flows (login, role selection, onboarding).
- `src/app/api/**` — REST endpoints (`trpc`, `auth`).
- `src/app/_components/`, `src/app/_clubs/`, etc. — `_`-prefixed folders are **private/non-routable** in Next.js. Use them for colocated components only; never put a routable `page.tsx` under a `_` folder.

Route `page.tsx` files should stay as the **main page container**: keep page-level hooks, state, query/mutation setup, handlers, derived data, and the main `return (...)` in the route file. Move supporting UI pieces, display constants, and page-local helper components into a colocated `components/` (or `_components/`) folder using PascalCase filenames such as `PostCard.tsx` or `ClubCard.tsx`. Do **not** reduce a route file to a thin wrapper that only imports and returns `<SomePage />` unless the route is intentionally a trivial placeholder.

### Middleware (`src/middleware.ts`)

Edge auth gate. It checks the Better Auth session cookie, redirects unauthenticated users to `/auth/attendee/login`, sends authenticated users with incomplete onboarding to their onboarding path, and redirects authenticated users at `/` or login pages to `defaultHomePathForRole`. Role checks for app areas live in route-group layouts via `requireRole` (`src/lib/require-role.ts`), **not** in middleware. Role→home mapping and onboarding paths live in `src/lib/auth-paths.ts`.

### Auth

Better Auth (`src/utils/auth.ts`, `src/lib/auth-client.ts`) with Google OAuth and Resend for email. Session is exposed in tRPC context as `ctx.session`. Auth client hooks live in `src/lib/auth-client.ts` (e.g. `useSession`, `signOut`).

### Env validation

`src/env.js` (via `@t3-oss/env-nextjs`) validates env at config-time. Add new env vars to **both** `src/env.js` and `.env`. Server vars include `DATABASE_URL`, `BETTER_AUTH_URL`, Google OAuth, R2/S3 upload config, `RESEND_API_KEY`, `EMAIL_FROM`, and `CALENDAR_CLAIM_SECRET`.

## Conventions

- Indentation in source files is **tabs**, not spaces (`.prettierrc`: `useTabs: true`, `tabWidth: 4`, `printWidth: 120`). Don't auto-reformat to spaces.
- TypeScript `strict` and `noUncheckedIndexedAccess` are on — array/record access returns `T | undefined`. Handle the `undefined` case.
- Prefer `type-imports` with `inline-type-imports` fix style (ESLint `@typescript-eslint/consistent-type-imports` is `warn`). Use `import type { Foo }` / `import { type Foo, bar }`.
- Path alias is `@/*` → `./src/*` (tsconfig). Use it consistently; do not introduce a bare `@src/*` alias.
- Don't add `console.log` to production paths. The tRPC `timingMiddleware` in `src/server/api/trpc.ts` logs procedure timing intentionally — leave it. Service `.catch` handlers currently log errors before returning a typed error; that pattern is acceptable but prefer keeping new code log-free in hot paths.
- When adding a new router, register it manually in `src/server/api/root.ts`.
- Run `yarn check` locally before pushing. The Next.js build is configured to surface type/lint errors via `yarn check`; don't rely on `yarn build` alone to catch them.

## Local database notes

`docker-compose.yaml` runs Postgres 18. Postgres 18+ stores data in a version-specific subdirectory under `/var/lib/postgresql`, so the volume mount is `/var/lib/postgresql` (not `/var/lib/postgresql/data`). If you switch Postgres major versions on an existing volume, you must `pg_upgrade` or wipe the volume — the 18 image refuses to start against data written by an older major.
