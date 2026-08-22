# cuatclub — Codebase Reference

T3-Stack Next.js monolith (App Router). Backend-heavy: only 2 real pages exist so far, most
work is the tRPC/Drizzle API layer for a club-directory/events app ("CUATClub").

## Stack

| Layer | Tech | Version | Evidence |
|---|---|---|---|
| Framework | Next.js (App Router) | ^15.2.3 | `package.json`, `next.config.js` |
| UI runtime | React | ^19.0.0 | `package.json` |
| Language | TypeScript (strict) | ^5.8.2 | `tsconfig.json` |
| API layer | tRPC v11 + `@tanstack/react-query` v5 | `@trpc/*` ^11.0.0 | `src/trpc/*`, `src/server/api/*` |
| Validation | Zod | ^3.24.2 | every DTO file |
| ORM | Drizzle ORM (postgres-js dialect) | ^0.41.0 | `src/server/db/*` |
| DB | PostgreSQL | 18-alpine (compose) | `docker-compose.yaml` |
| Auth | better-auth (drizzle adapter, email+password) | ^1.3.31 | `src/server/auth.ts` |
| Styling | Tailwind CSS v4 + shadcn/ui ("new-york") | ^4.0.15 | `components.json`, `postcss.config.js` |
| Object storage | Cloudflare R2 via `@aws-sdk/client-s3` | ^3.1004.0 | `src/server/services/r2.ts` |
| Email | Resend | ^6.9.3 | `src/server/services/mailer.ts` |
| Env validation | `@t3-oss/env-nextjs` | ^0.12.0 | `src/config/env.js` |
| Package manager | Yarn Classic | 1.22.19 (`packageManager` field) | `package.json` |
| Deploy | Docker (distroless multi-stage) + Vercel (cron) | — | `Dockerfile`, `vercel.json` |

Repo shape: **single Next.js app, not a monorepo.** No `apps/`/`packages/` split.

## Path aliases

`tsconfig.json:29` — `"@/*": ["./src/*"]`. Every internal import uses `@/...`, no relative
`../../..` chains anywhere in `src/`.

shadcn aliases (`components.json:14-20`) mirror the same roots: `@/components`, `@/components/ui`,
`@/lib`, `@/lib/utils`, `@/hooks` (hooks dir doesn't exist yet — will be created on first
`shadcn add` that needs one).

## Repo layout

```
src/
├── app/                 # Next.js App Router — only layout.tsx + page.tsx exist today
├── components/ui/       # shadcn components (only button.tsx, currently a placeholder stub)
├── config/env.js        # @t3-oss/env-nextjs schema — single source of truth for env vars
├── lib/
│   ├── auth-client.ts   # better-auth React client (client-side)
│   └── utils.ts         # cn() Tailwind class merge helper
├── scripts/seed.ts      # DB seed script — currently empty (TODO stub)
├── server/
│   ├── api/
│   │   ├── modules/<feature>/   # one folder per domain module — see "Backend module shape"
│   │   ├── root.ts               # appRouter — combines all module routers
│   │   └── trpc/                  # tRPC plumbing (context, procedures, middleware)
│   ├── auth.ts           # better-auth server config
│   ├── db/
│   │   ├── index.ts       # drizzle(postgres-js) singleton connection
│   │   ├── schema/*.ts    # one file per table + relations.ts + index.ts barrel
│   │   └── unit-of-work.ts
│   ├── errors.ts          # TRPCError factory functions + wrapRepoError
│   ├── services/{r2,mailer}.ts  # external integrations
│   └── utils.ts           # empty stub
├── styles/globals.css
└── trpc/                  # tRPC <-> Next.js glue (RSC + client React provider)
```

**Gaps found (not yet wired, don't assume they exist):**
- No `src/app/api/trpc/[trpc]/route.ts` — the tRPC HTTP handler Next.js needs is missing, even
  though `src/trpc/react.tsx:55` already points `httpBatchStreamLink` at `/api/trpc`.
- No `src/app/api/auth/[...all]/route.ts` — better-auth's Next.js handler isn't mounted either.
- `vercel.json:5` schedules a cron hitting `/api/notifications/event-reminders`, but that route
  doesn't exist in `src/app` yet.
- `package.json:16` — `"db:seed": "tsx src/server/scripts/seed.ts"` points at
  `src/server/scripts/seed.ts`, but the real file is `src/scripts/seed.ts`. The script is broken
  until one side is fixed.
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are required by `src/config/env.js:13-14` but
  `src/server/auth.ts` has no `socialProviders` block using them yet — validated but unused.
- `src/components/ui/button.tsx` and `src/server/utils.ts` are placeholder stubs (`// Test`,
  `// for common utils`).

## Backend module shape

```
      tRPC call (client component or server component)
                        │
                        ▼
        appRouter — src/server/api/root.ts
        (combines every module router)
             ┌──────────┴──────────┐
             ▼                     ▼
   entity-backed module     value-object module
   (own module, e.g.        (lives inside master-data,
   clubs/, users/)          e.g. faculties, categories)
             │                     │
     router.ts (validate    router.ts (validate
     input via dto/, call   input via dto/, call
     usecase)                usecase)
             │                     │
     usecase/*.usecase.ts   usecase/*.usecase.ts
     (1 file/endpoint,      (1 file/endpoint,
     business logic)         business logic)
             │                     │
     *.repository.ts         *.repository.ts
     (Drizzle query)          (Drizzle query)
             │                     │
     row → Entity.toEntity()  raw row returned directly
             ▼                     │
     entity.ts (getters +         │
     domain logic, toDTO())       │
             └──────────┬─────────┘
                         ▼
          PostgreSQL — src/server/db/schema/*.ts
```

There are exactly **two module shapes** in this codebase, and which one a feature gets is a
project rule, not just an observation:

- **Entity-backed module** — a real domain entity (something with identity, lifecycle, and its
  own business rules: `clubs`, `users`) gets its **own module folder** with the full 5-piece
  layout below, including an `entity.ts`.
- **Value-object module** — plain lookup/reference data with no behavior of its own (faculties,
  categories, and any future "just a labelled row" type) does **not** get its own module. It's
  added as a new resource inside the existing `master-data` module instead (new schema table +
  repository method + usecase + router sub-object), skipping the entity layer entirely.

Within either shape, dependency direction is strictly
**router → usecase → repository → (entity, if entity-backed) → Drizzle schema**; nothing skips a
layer.

```
modules/clubs/
├── clubs.router.ts        # tRPC router: wires procedure + Zod DTO to a usecase function
├── clubs.repository.ts    # ClubsRepository class + exported singleton `clubsRepository`
├── entities/
│   ├── club.entity.ts         # Club class: wraps a DB row, exposes getters + toDTO()
│   └── club-detail.entity.ts  # ClubDetail: composite over Club + User + master-data rows
├── dto/
│   ├── club.dto.ts        # base output shape (ClubOutputDTOSchema)
│   ├── get-club-profile.dto.ts  # per-usecase input/output schemas, extends base
│   └── index.ts            # barrel: `export * from ...`
└── usecases/
    ├── get-club-profile.usecase.ts   # one function per use case
    └── index.ts
```
One entity per table lives in `entities/`; a module gets more than one file there only once it
also has a composite (see "Composite entities" below) — most modules will just have the one.

### 1. Router — `src/server/api/modules/clubs/clubs.router.ts`
```ts
export const clubsRouter = createTRPCRouter({
  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
```
Router files never contain business logic — they call exactly one usecase function and pass
`ctx`/parsed input straight through. `.input()`/`.output()` are always the Zod schemas from
`dto/`, never inline `z.object(...)`.

Registered in `src/server/api/root.ts:5-8`:
```ts
export const appRouter = createTRPCRouter({
  clubs: clubsRouter,
  masterData: masterDataRouter,
});
```

### 2. Usecase — `src/server/api/modules/clubs/usecases/get-club-profile.usecase.ts`
```ts
export const getClubProfile = async (currentUserId: string): Promise<GetClubProfileOutputDTO> => {
  const club = await clubsRepository.getByUserId(currentUserId);
  if (!club) throw notFound("Club profile not found");

  const user = await usersRepository.getById(currentUserId);
  if (!user) throw internalError({ reason: "Club exists but owning user could not be found", userId: currentUserId });

  return { ...club.toDTO(), email: user.email, role: user.role };
};
```
Usecases are plain exported `async` functions (not classes), imported into repositories they
need directly (no DI container). They own all domain error decisions (`notFound`, `conflict`,
etc.) — repositories only ever throw generic `internalError` on driver failure.

### 3. Repository — `src/server/api/modules/clubs/clubs.repository.ts`
Class implementing an `I<Feature>Repository` interface, instantiated once as a singleton export:
```ts
class ClubsRepository implements IClubsRepository {
  async create(req: CreateClubParams, client: DbClient = db): Promise<string> {
    const id = randomUUID();
    const res = await client.insert(clubs).values({ ...req, id }).returning({ id: clubs.id }).catch(wrapRepoError);
    return res[0]!.id;
  }
  // getById / getByUserId delegate to a shared private getOneByFilter(filter: SQL)
}
export const clubsRepository = new ClubsRepository();
```
- Every method accepts an optional `client: DbClient = db` parameter so it can run standalone
  *or* inside `unitOfWork.run()` (transactions) — see `src/server/db/unit-of-work.ts:12`.
- Every Drizzle call ends in `.catch(wrapRepoError)` — the **only** place raw driver/query errors
  are caught; they're turned into a generic `internalError` (`src/server/errors.ts:23-25`) so
  nothing above the repository ever sees a raw Postgres error.
- `getOneByFilter`/`updateByFilter`/`deleteByFilter` are private helpers shared by the public
  `getById`/`getByUserId`/`updateById`/`deleteById` — the filter-by-X methods are thin wrappers,
  not independent query implementations.
- Read queries use `db.query.<table>.findFirst/findMany` (Drizzle's relational query API);
  writes use the query-builder (`db.insert/update/delete`).

### 4. Entity — `src/server/api/modules/clubs/entities/club.entity.ts`
```ts
export class Club {
  private constructor(private row: ClubRow) {}
  static toEntity(row: ClubRow): Club { return new Club(row); }
  static toEntities(rows: ClubRow[]): Club[] { return rows.map(Club.toEntity); }
  get id() { return this.row.id; }
  get isPubliclyVisible() { return this.row.registrationStatus === "COMPLETED"; }
  // ... one getter per column, plus any rule that only needs this row
  toDTO(): ClubOutputDTO { return { ...this.row }; }
}
```
Repositories never return raw Drizzle rows — always `Entity | null` / `Entity[]`, converted via
`Entity.toEntity(row)`. Entities are private-constructor wrapper classes (no ORM decorators);
`toDTO()` is how a usecase turns an entity into the shape a router's `.output()` schema expects.
A rule belongs on the single-table entity whenever it only needs that table's own columns
(`isPubliclyVisible` only reads `registrationStatus`, so it lives on `Club`, not on a joined
view).

#### Composite entities — `entities/club-detail.entity.ts`
Some endpoints need more than one table's worth of data (`getClubById` needs the club row plus
its owning user's name/logo, affiliation, and categories). That shape gets its own **composite
entity** — a class that holds other entities/rows, not a raw joined Drizzle row:
```ts
export class ClubDetail {
  private constructor(
    private club: Club,
    private owner: User,
    private affiliationRow: AffiliationRow | null,
    private categoryRows: CategoryRow[]
  ) {}

  static compose(parts: { club: Club; owner: User; affiliation: AffiliationRow | null; categories: CategoryRow[] }): ClubDetail {
    return new ClubDetail(parts.club, parts.owner, parts.affiliation, parts.categories);
  }

  get isPubliclyVisible() { return this.club.isPubliclyVisible; } // delegate, not reimplement
  toDTO(): GetClubByIdOutputDTO { /* ... */ }
}
```
Rules to follow when adding one:
- **Only create a composite when it earns its place**: either it holds a rule that genuinely
  needs more than one entity to decide (none exist yet for `ClubDetail` — it's currently pure
  delegation), or the same composed shape is reused by more than one usecase. If neither is
  true, skip the composite and have the usecase assemble the DTO directly from entities it
  fetched itself (see `getClubProfile` in `get-club-profile.usecase.ts`, which does exactly
  this with `Club` + `User`).
- **`compose()` takes entities/rows, never a joined Drizzle row.** The join shape
  (`ClubDetailRow`) is a private type owned by the repository (`clubs.repository.ts`), which
  maps it into `Club.toEntity(...)` / `User.toEntity(...)` before calling `compose()`. This
  keeps the entity ignorant of *how* its parts were fetched — a join today, several separate
  repository calls tomorrow, without touching the entity or its business logic.
- **Delegate single-entity rules, don't reimplement them.** `ClubDetail.isPubliclyVisible` just
  forwards to `club.isPubliclyVisible` — the rule has exactly one home.
- **Cross-module rule this enables:** an entity may import and hold another module's *entity*
  (`ClubDetail` holds a `User`) — entities have no DB dependency, so this is just domain
  composition. An entity or repository may **never** import another module's *repository*;
  that's a repository-to-repository coupling and stays forbidden. Row types with no behavior
  (e.g. `AffiliationRow`/`CategoryRow` from `master-data`) live in that module's own
  `entities/*.entity.ts` file precisely so other modules can import the *type* without reaching
  into `master-data.repository.ts`.

### DTOs — `src/server/api/modules/clubs/dto/`
Zod schema + inferred type, one pair per shape:
```ts
export const ClubOutputDTOSchema = z.object({
  id: z.string(),
  registrationStatus: z.enum(["PENDING", "INFO_SUBMITTED", "COMPLETED"]),
  // ...
  contacts: z.object({ instagram: z.string().optional(), /* ... */ }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ClubOutputDTO = z.infer<typeof ClubOutputDTOSchema>;
```
Per-usecase DTOs `.extend()` a shared base schema rather than redefining fields
(`get-club-profile.dto.ts:8` extends `ClubOutputDTOSchema`). Usecases with no input still
declare `z.object({})` + a `Record<string, never>` type alias — never bare `z.any()`/no input.

**Simpler module without an entity class** — `master-data` (faculties/categories, read-only, no
domain logic) skips the entity *class* layer: the repository returns the raw Drizzle
`$inferSelect` row type directly and the usecase just passes it through
(`get-all-categories.usecase.ts:4-6`). It still keeps its row types (`AffiliationRow`,
`CategoryRow`) in `entities/master-data.entity.ts` rather than inline in the repository — that's
what lets other modules' entities (e.g. `ClubDetail`) import the type without importing
`master-data.repository.ts` (see "Composite entities" above). Use a full entity *class* only
when a module needs derived getters/domain rules; a type-only `entities/` file is still worth
having the moment another module needs to reference the row shape.

## tRPC plumbing — `src/server/api/trpc/`

| File | Responsibility |
|---|---|
| `init.ts` | `createTRPCContext` (session + `db`), `t = initTRPC.context<...>().create(...)` with `superjson` transformer and a Zod-aware `errorFormatter`, `createTRPCRouter`, `createCallerFactory` |
| `procedures.ts` | `publicProcedure` / `protectedProcedure` / `adminProcedure` |
| `middleware.ts` | `errorHandlingMiddleware` |
| `index.ts` | barrel re-exporting the three files above — **always import from `@/server/api/trpc`, never from the sub-files directly** |

```ts
// procedures.ts
const baseProcedure = t.procedure.use(errorHandlingMiddleware);
export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw unauthorized("You must be signed in to do this");
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});
export const adminProcedure = baseProcedure.use(({ ctx, next }) => {
  if (ctx.session?.user?.role !== "ADMIN") throw unauthorized("You must be an admin to do this");
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});
```
Every procedure — including `publicProcedure` — runs through `errorHandlingMiddleware` first.
`protectedProcedure`/`adminProcedure` narrow `ctx.session.user` to non-null in their downstream
type, so handlers can use `ctx.session.user.id` without an extra null check.

**Where these are written:** only in `src/server/api/trpc/procedures.ts` — this is the single
place new procedure variants get defined (e.g. a future `clubAdminProcedure` that checks
ownership of a specific club would go here too, as another `baseProcedure.use(...)`).

**Where these are used:** exclusively in `<feature>.router.ts` files, imported from the barrel
`@/server/api/trpc` (never from `procedures.ts` directly). Which one to pick per endpoint:

| Procedure | Use for | Example |
|---|---|---|
| `publicProcedure` | No auth required — public reads anyone can call | `masterData.faculties.getAll` |
| `protectedProcedure` | Requires a signed-in user; most user-scoped reads/writes | `clubs.getClubProfile` (uses `ctx.session.user.id`) |
| `adminProcedure` | Requires `role === "ADMIN"`; admin-only mutations/reads | not yet used by any router, but this is where e.g. approving a club registration would go |

## Error handling — `src/server/errors.ts`

Factory functions, not thrown classes:
```ts
export const notFound = (message = "Resource not found") => new TRPCError({ code: "NOT_FOUND", message });
export const unauthorized = (message = "Unauthorized") => new TRPCError({ code: "UNAUTHORIZED", message });
export const validationError = (message = "Validation failed") => new TRPCError({ code: "BAD_REQUEST", message });
export const conflict = (message = "Conflict") => new TRPCError({ code: "CONFLICT", message });
export const internalError = (cause?: unknown) => new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: GENERIC_MESSAGE, cause });
export const wrapRepoError = (e: unknown): never => { throw internalError(e); };
```
Two-stage safety net for internal errors:
1. Repositories `.catch(wrapRepoError)` on every DB call → wraps into `internalError(cause)`.
2. `errorHandlingMiddleware` (`middleware.ts:10-16`) catches any `INTERNAL_SERVER_ERROR` result
   (from `wrapRepoError` *or* an unhandled `TypeError` etc that tRPC auto-wrapped), logs
   `result.error.cause ?? result.error` to the server console, and re-throws a fresh
   `internalError()` with **no cause** — guaranteeing raw error details (stack traces, SQL
   errors) never reach the client, only the generic message string.

Usecases throw `notFound`/`conflict`/`unauthorized`/`validationError` directly for expected
domain failures — those pass through the middleware untouched since their code isn't
`INTERNAL_SERVER_ERROR`.

## Data access — `src/server/db/`

`index.ts` — singleton `postgres-js` connection, cached on `globalThis` in non-production to
survive Next.js dev-mode HMR without leaking connections:
```ts
const globalForDb = globalThis as unknown as { conn: postgres.Sql | undefined };
const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;
export const db = drizzle(conn, { schema });
export type DbClient = typeof db | PostgresJsTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;
```

`unit-of-work.ts` — the transaction abstraction repositories use:
```ts
export interface UnitOfWork { run<T>(fn: (client: DbClient) => Promise<T>): Promise<T>; }
class DrizzleUnitOfWork implements UnitOfWork {
  run<T>(fn: (client: DbClient) => Promise<T>): Promise<T> { return db.transaction(fn); }
}
export const unitOfWork: UnitOfWork = new DrizzleUnitOfWork();
```
A usecase that needs an atomic multi-table write calls `unitOfWork.run(async (client) => { ... })`
and passes `client` into each repository call as the last argument — every repository write
method accepts `client: DbClient = db` for exactly this reason. No usecase currently uses this
yet (all existing usecases are single-repository reads), but the plumbing is in place.

**Illustrative example (not real code in the repo yet)** — a usecase that must create a club and
send its welcome email atomically-with-respect-to-the-DB (the DB writes must all commit or all
roll back together; the email is fired after the transaction succeeds so a failed send never
undoes the writes):
```ts
import { unitOfWork } from "@/server/db/unit-of-work";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/club-categories.repository";
import { sendMail } from "@/server/services/mailer";

export const registerClub = async (input: RegisterClubInputDTO, userId: string) => {
  const clubId = await unitOfWork.run(async (client) => {
    const id = await clubsRepository.create({ userId, name: input.name }, client);
    await clubCategoriesRepository.attach(id, input.categoryIds, client);
    return id;
    // if attach() throws, create()'s insert is rolled back too — both ran on `client`
  });

  await sendMail({ to: input.contactEmail, subject: "Club registered", text: "..." });
  return clubId;
};
```
The rule this demonstrates: **every repository call inside the callback must be passed the same
`client`** (not the module-level `db`) — that's what makes them one transaction. Anything that
shouldn't roll back with the DB (sending an email, calling R2) happens **outside** the
`unitOfWork.run()` block, after it resolves.

## External integrations — `src/server/services/`

This is the single place third-party/external-service clients live — anything that isn't the
app's own Postgres database goes here, not inside a feature module. Currently two:

| File | Wraps | Exports |
|---|---|---|
| `r2.ts` | Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3` | `uploadImage(buffer, contentType, key?)`, `getPublicUrl(key)` |
| `mailer.ts` | Resend | `sendMail(params)`, `bulkSendMail(items)` |

Shared shape both follow:
```ts
// r2.ts
const client = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { ... } });
export async function uploadImage(buffer: Buffer, contentType: string, key?: string): Promise<string> { ... }
```
- A single module-level client instance (`new S3Client(...)`, `new Resend(...)`), configured
  entirely from `@/config/env` — never instantiated per-call.
- Plain exported `async` functions, not a class — usecases import the function directly
  (`import { uploadImage } from "@/server/services/r2"`), same import style as a repository.
- Errors are caught and re-thrown as a generic `Error` with a safe user-facing message
  (`mailer.ts:41-45`) — the raw provider error is logged (`console.error`) but not propagated,
  mirroring how `wrapRepoError` hides raw DB errors from callers.

**Adding a new external integration** (e.g. a push-notification provider) follows the same
pattern: new file in `src/server/services/`, its own env vars added to `@/config/env`, one
module-level client, plain exported functions — then call it from a usecase like any other
dependency. It does not get a `dto/`, `entity.ts`, or router of its own; those only exist for
`modules/<feature>/`.

### Schema — `src/server/db/schema/`
One file per table (`user.ts`, `session.ts`, `account.ts`, `verification.ts` — better-auth's
required tables; `clubs.ts`, `faculties.ts`, `categories.ts`, `club-categories.ts`,
`invitation-codes.ts` — app tables), plus:
- `relations.ts` — all `relations()` calls in one place, separate from table definitions
- `index.ts` — `export * from "./x"` barrel for every file, imported as `import * as schema` in `db/index.ts` and `auth.ts`

```ts
// clubs.ts
export const clubRegistrationStatusEnum = pgEnum("club_registration_status", ["PENDING", "INFO_SUBMITTED", "COMPLETED"]);
export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique().references(() => user.id),
  registrationStatus: clubRegistrationStatusEnum("registration_status").notNull().default("PENDING"),
  imageUrls: text("image_urls").array().default([]).notNull(),
  contacts: jsonb("contacts").$type<{ instagram?: string; facebook?: string; tiktok?: string; line_oa?: string }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
```
Conventions: `uuid` PK with `gen_random_uuid()` default for app-owned entities (`clubs`);
`text` PK for better-auth-owned tables (`user.id`, matches better-auth's own ID format);
`smallserial` PK for small lookup tables (`faculties`, `categories`); every table has
`created_at`/`updated_at` timestamptz with `$onUpdate`; junction tables (`club-categories.ts`)
use a composite primary key via `primaryKey({ columns: [...] })`, not a surrogate id.

Migrations: `drizzle-kit` generates SQL into `/drizzle` (currently `0000`–`0006`), config in
`drizzle.config.ts:6-11` (`schema: "./src/server/db/schema/*.ts"`, `out: "./drizzle"`).

## Auth — `src/server/auth.ts` / `src/lib/auth-client.ts`

Server (`auth.ts`): `betterAuth()` with the Drizzle adapter pointed at the same `schema` used by
the app's own tables; `role` added as a custom field on `user`
(`additionalFields: { role: { type: "string" } }`, matches the `roleEnum` in `schema/user.ts:3`);
email+password enabled (`minPasswordLength: 8`, `autoSignIn: true`); IDs generated via
`crypto.randomUUID()` to match `clubs.userId`'s `text` type.

Client (`auth-client.ts`): `createAuthClient` + `inferAdditionalFields<typeof auth>()` so
`role` is typed on the client session too. Re-exports `signIn`/`signUp`/`signOut`/`useSession`
as the app-wide auth API — components should import these from `@/lib/auth-client`, not call
`authClient.*` directly.

## tRPC ↔ Next.js glue — `src/trpc/`

| File | Runtime | Purpose |
|---|---|---|
| `query-client.ts` | shared | `createQueryClient()` — react-query defaults + `superjson` dehydrate/hydrate |
| `server.ts` | server-only (`"server-only"`) | `api`/`HydrateClient` for calling tRPC directly from Server Components (no HTTP round-trip), via `createHydrationHelpers` |
| `react.tsx` | client (`"use client"`) | `TRPCReactProvider` — real HTTP client (`httpBatchStreamLink` → `/api/trpc`), `RouterInputs`/`RouterOutputs` inference helpers |

Server Components call `api.clubs.getClubProfile()` (server.ts's `api`) directly, no fetch;
Client Components use `api.clubs.getClubProfile.useQuery()` (react.tsx's `api`) as normal
react-query hooks. Both point at the same `AppRouter` type from `@/server/api/root`.

## Frontend

Minimal so far — `src/app/layout.tsx` and `src/app/page.tsx` are default Next.js scaffolding
with no real UI. `src/components/ui/button.tsx` is a placeholder (`// Test`), not yet a real
shadcn Button. No routing beyond the root page, no client-side data fetching wired up yet.
**There is nothing to reverse-engineer conventions from on the frontend side yet** — the
patterns above (tRPC hooks, shadcn `components.json` config, `cn()` in `src/lib/utils.ts`) are
the scaffolding future frontend code is expected to follow, not yet demonstrated in real
components.

## Build, lint, format, test

```
yarn dev              # next dev --turbo
yarn build             # next build
yarn start             # next start (prod)
yarn preview            # build + start
yarn check              # next lint && tsc --noEmit
yarn lint / lint:fix
yarn typecheck
yarn format:check / format:write   # prettier, tabWidth 2, printWidth 100, prettier-plugin-tailwindcss
yarn db:create / db:start / db:stop   # docker compose create/start/stop db (Postgres container)
yarn db:generate / db:migrate / db:push / db:studio   # drizzle-kit
yarn db:seed            # BROKEN — see "Gaps found" above
```

No test framework is configured (no `vitest`/`jest` in `package.json`, no `*.test.ts` files
anywhere) — **there is currently no automated test suite.**

`.husky/pre-commit` runs `yarn lint-staged` (config in `package.json` `lint-staged` key):
`eslint --fix` + `prettier --write` on staged `.ts/.tsx`; `prettier --write` on staged
`.js/.jsx/.mdx/.json/.css`.

CI (`.github/workflows/ci.yml`): on every PR and push to `main`, runs
`format:check` → `lint` → `typecheck` (with `SKIP_ENV_VALIDATION=1` so it doesn't need real
secrets). No build/test/deploy step in CI yet.

Docker: multi-stage (`deps` → `builder` → distroless `runner`), `output: "standalone"` in
`next.config.js:12`; `docker-compose.yaml` currently only runs the Postgres `db` service, no
app container defined in compose.

## Where to add what

### Add a new backend endpoint to an existing module (e.g. `clubs.updateProfile`)
1. **DTO** — add `dto/update-profile.dto.ts` with `UpdateProfileInputDTOSchema` /
   `OutputDTOSchema` (extend the module's base schema if the shape overlaps); export it from
   `dto/index.ts`.
2. **Usecase** — add `usecases/update-profile.usecase.ts`, an exported `async` function that
   calls the repository and throws `notFound`/`conflict`/etc from `@/server/errors` for domain
   failures; export it from `usecases/index.ts`.
3. **Repository method** — if the query doesn't exist yet, add it to `<feature>.repository.ts`
   (and its `I<Feature>Repository` interface), following the `client: DbClient = db` +
   `.catch(wrapRepoError)` pattern.
4. **Router** — add the procedure to `<feature>.router.ts`: pick
   `publicProcedure`/`protectedProcedure`/`adminProcedure`, wire `.input()`/`.output()` to the
   DTO schemas, call the usecase in `.query()`/`.mutation()`.
5. Router is already registered in `root.ts` if the module exists — nothing else to wire.

### Add a brand-new module (e.g. `events`)
1. Create `src/server/api/modules/events/` with the same 4 pieces as `clubs`:
   `entities/event.entity.ts` (skip the class if there's no derived logic — a type-only
   `entities/event.entity.ts` with just the row type is still fine if another module will need
   to reference it, like `master-data`), `events.repository.ts` + `IEventsRepository`, `dto/` +
   `dto/index.ts`, `usecases/` + `usecases/index.ts`, `events.router.ts`.
2. If new tables are needed: add `src/server/db/schema/events.ts`, export it from
   `schema/index.ts`, add any `relations()` to `schema/relations.ts`, then run
   `yarn db:generate` (writes SQL into `/drizzle`) and `yarn db:migrate`.
3. Register the router in `src/server/api/root.ts`: `export const appRouter = createTRPCRouter({ ..., events: eventsRouter })`.
4. Consume from a Server Component via `api.events.xyz()` (`@/trpc/server`) or a Client
   Component via `api.events.xyz.useQuery()` (`@/trpc/react`) — no other wiring needed, types
   flow automatically through `AppRouter`.

### Before either is usable end-to-end
The missing `src/app/api/trpc/[trpc]/route.ts` handler (see "Gaps found") needs to exist first —
without it, no tRPC procedure is reachable over HTTP from Client Components, only from Server
Components via the RSC caller.
