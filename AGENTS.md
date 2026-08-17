# AGENTS.md

Instructions for AI coding agents working in this repo. cuatclub is a T3-Stack Next.js
(App Router) monolith — tRPC v11 + Drizzle ORM + better-auth, building a club-directory app.
Single app, not a monorepo. Backend is much further along than frontend; don't assume frontend
conventions exist beyond what's in `docs/codebase.md`.

For full architecture detail, read **`docs/codebase.md`** (or the same content rendered at
`docs/codebase.html`) before making non-trivial backend changes. For what a reviewer will flag,
read **`docs/review-guidelines.md`** — apply those rules to your own diffs before finishing, not
just when asked to review.

## Commands

```
yarn dev                            # next dev --turbo
yarn check                          # next lint && tsc --noEmit — run before finishing any change
yarn lint / yarn lint:fix
yarn typecheck
yarn format:check / yarn format:write
yarn db:start / db:stop             # docker compose postgres
yarn db:generate / db:migrate / db:push / db:studio   # drizzle-kit
```

No test framework is configured (no vitest/jest, no `*.test.ts` anywhere) — don't invent a test
setup unasked. `yarn check` + `yarn format:check` are what CI and the pre-commit hook enforce;
run them yourself before considering backend work done.

## Backend rules (non-negotiable — see `docs/review-guidelines.md` for the full list)

**Layering is strict:** router → usecase → repository → (entity, if entity-backed) → Drizzle
schema. Never skip a layer — no DB queries in a router, no business logic in a repository.

**Two module shapes only**, under `src/server/api/modules/<feature>/`:
- **Entity-backed** — a real domain entity with identity/lifecycle/business rules (`clubs`,
  `users`). Gets its own module folder with router, usecase(s), repository, `entities/`, `dto/`.
- **Value-object** — plain lookup/reference data with no behavior (faculties, categories). Does
  **not** get its own module folder; added as a new resource inside the existing `master-data`
  module (schema table + repository method + usecase + router sub-object). No entity class, but
  its row types still live in `entities/master-data.entity.ts` so other modules can import the
  type.

**Entities live in `entities/<name>.entity.ts`** (one file per table), private-constructor
classes with `static toEntity(row)`, one getter per column, business logic that only needs that
row, and `toDTO()`. A **composite entity** (e.g. `ClubDetail`) holds other entities/rows for a
shape spanning multiple tables — only create one if it holds a genuinely cross-entity rule or is
reused by more than one usecase; otherwise have the usecase assemble the DTO itself from entities
it fetched (see `getClubProfile`). A composite's `compose()` takes entities/rows, never a raw
joined Drizzle row — the repository owns the join-shape type and maps it before calling
`compose()`. Composites delegate single-entity rules (`get isPubliclyVisible() { return
this.club.isPubliclyVisible; }`), never reimplement them.

**Cross-module imports:** entity-to-entity is fine (`ClubDetail` may import `User`) — entities
have no DB dependency. Repository-to-repository across modules is forbidden, and an entity may
never import another module's repository either. If a usecase needs another module's data, it
calls that module's repository or usecase directly; that's the only cross-module edge allowed at
the data-access level.

**Every repository method** takes `client: DbClient = db` as its last param (for
`unitOfWork.run()` support) and every Drizzle call ends in `.catch(wrapRepoError)`. **Every
usecase** throws `notFound`/`conflict`/`unauthorized`/`validationError` from `@/server/errors`
for expected domain failures — never a raw `Error` or hand-built `TRPCError`. Multi-table writes
that must be atomic go through `unitOfWork.run(async (client) => { ... })`, passing the same
`client` to every repository call inside; side effects that shouldn't roll back with the DB
(email, R2 upload) happen after the block resolves, not inside it.

**DTOs** are one Zod input/output pair per usecase in `dto/<action>.dto.ts`, `.extend()`ing a
shared base schema rather than redefining fields; a router's `.input()`/`.output()` is always a
schema from `dto/`, never an inline `z.object(...)`.

**tRPC procedures** (`publicProcedure`/`protectedProcedure`/`adminProcedure`) are defined only in
`src/server/api/trpc/procedures.ts` and imported into routers from the barrel `@/server/api/trpc`
— never add an inline auth check in a router, and never import `procedures.ts` directly.

**External services** (anything not the app's own Postgres DB) live in `src/server/services/` —
one module-level client configured from `@/config/env`, plain exported `async` functions, errors
caught and re-thrown with a safe generic message. Never instantiate a third-party SDK client
inside a module's repository or usecase.

## General conventions

- Imports always use the `@/*` alias — never a relative `../../..` chain.
- Barrel `index.ts` files (`dto/index.ts`, `usecases/index.ts`, `schema/index.ts`,
  `server/api/trpc/index.ts`) must be kept in sync: new files re-exported, external imports go
  through the barrel, not the individual file.
- No `any`, no unchecked `!` non-null assertion (the one accepted exception is `res[0]!.id` right
  after an `.insert().returning()` known to produce exactly one row) — `strict` +
  `noUncheckedIndexedAccess` are on.
- Filenames are `kebab-case` ending in the layer suffix: `*.router.ts`, `*.usecase.ts`,
  `*.repository.ts`, `*.entity.ts`, `*.dto.ts`.
- Match the file's own established shape before inventing a new one — if every method in a file
  follows a pattern, a new method should too, even if the task doesn't strictly require it.
- No dead code in a diff: no commented-out blocks, no unused exports, no leftover `console.log`.

## Frontend

Minimal today — `src/app/layout.tsx`/`page.tsx` are still default Next.js scaffolding. Only two
rules are enforced so far: UI components come from shadcn/ui (`src/components/ui/`, `new-york`
style, add via the CLI rather than hand-rolling), and icons come from `lucide-react` exclusively.
Don't invent broader frontend conventions — check `docs/codebase.md`'s "Frontend" section for
what's actually there before assuming a pattern exists.

## Known gaps (see `docs/codebase.md` → "Gaps found" for the full, current list)

Don't "fix" these unless asked — they're tracked, not accidental: the tRPC HTTP route handler
(`src/app/api/trpc/[trpc]/route.ts`) and better-auth's route handler are both unmounted, the
`db:seed` script path in `package.json` doesn't match the real file location, and
`GOOGLE_CLIENT_ID`/`SECRET` are validated in env but unused in `auth.ts`.
