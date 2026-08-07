# Review Guidelines

Rules for reviewing PRs in this repo. Backend has an established layered pattern — flag any
deviation. Frontend conventions are minimal for now; only the two rules below are enforced.

## General code quality

Applies to every file, regardless of layer.

- **Naming** — `camelCase` for variables/functions, `PascalCase` for classes/types/React
  components, `SCREAMING_SNAKE_CASE` for constants and env vars, `snake_case` only inside Drizzle
  schema definitions for actual DB column/table names (e.g. `text("user_id")`) — never in
  TypeScript identifiers. Filenames are `kebab-case` and end in the layer suffix that matches
  their content: `*.router.ts`, `*.usecase.ts`, `*.repository.ts`, `*.entity.ts`, `*.dto.ts`.
- **Barrel exports** — if a directory has an `index.ts` barrel (`dto/index.ts`,
  `usecases/index.ts`, `schema/index.ts`, `server/api/trpc/index.ts`), every new file in that
  directory must be re-exported from it, and everything outside the directory must import
  through the barrel — not by reaching into the individual file directly.
- **Zero lint/format errors** — `yarn check` (lint + typecheck) and `yarn format:check` must
  pass clean. This is already enforced by CI and the `husky` pre-commit hook — a PR that needs
  `eslint-disable` or a Prettier exception to pass should explain why in the PR description, not
  silently suppress the rule.
- **No `any`, no unchecked non-null assertions** — the project runs `strict` +
  `noUncheckedIndexedAccess`; don't defeat that with `any`, `as any`, or a `!` that isn't
  provably safe (the one accepted exception is `res[0]!.id` right after an `.insert().returning()`
  that's known to produce exactly one row).
- **Import paths** — always the `@/*` alias (`tsconfig.json`), never a relative `../../..`
  chain. No import reaches across a module boundary it isn't supposed to cross (e.g. a router
  importing another module's repository directly instead of going through that module's usecase).
- **No dead code left in the diff** — no commented-out blocks, no unused exports/variables/
  imports (`@typescript-eslint/no-unused-vars` already flags most of this), no leftover
  `console.log` (use `console.error` only where the existing pattern already does, e.g. logging a
  caught error before rethrowing a safe message).
- **Match the file's own established shape before inventing a new one** — if every other file in
  a directory follows a pattern (e.g. every repository method takes `client: DbClient = db`),
  a new method in that same file should follow it too, even if the immediate task doesn't
  strictly require it.

## Backend

### Module shape — pick the right one

There are exactly two module shapes. Flag a PR that adds a new top-level module folder for
something that is actually a value object.

- **Entity-backed module** (own folder under `src/server/api/modules/<feature>/`) — only for a
  real domain entity: something with identity, lifecycle, and its own business rules (e.g.
  `clubs`, `users`).
- **Value-object module** — plain lookup/reference data with no behavior of its own (e.g.
  faculties, categories, and any future "just a labelled row" type). This does **not** get its
  own module folder. It's added as a new resource inside the existing `master-data` module:
  new schema table + repository method + usecase + router sub-object. No entity layer.

### Layering — router → usecase → repository → (entity) → schema

Every endpoint in an entity-backed module has 5 pieces; value-object modules skip the entity.
Flag any PR that collapses layers (e.g. DB queries inside a router, or business logic inside a
repository).

1. **Router** (`<feature>.router.ts`) — registers the tRPC endpoint, validates input/output via
   Zod schemas imported from `dto/`, calls exactly one usecase. No business logic, no direct DB
   access. Pick the procedure type deliberately (see below).
2. **Usecase** (`usecases/<action>.usecase.ts`, **one file per endpoint**) — the business logic
   layer. A plain exported `async` function, not a class. Calls the repository (and the entity's
   methods/getters, for entity-backed modules). Owns all domain error decisions — throws
   `notFound`/`conflict`/`unauthorized`/`validationError` from `@/server/errors` for expected
   failures.
3. **Repository** (`<feature>.repository.ts`) — the only place that touches the database. A
   class implementing `I<Feature>Repository`, instantiated once as a singleton export. Maps DB
   rows to the module's `Entity` before returning (entity-backed modules) or returns the raw
   Drizzle row (value-object modules). Every method accepts an optional `client: DbClient = db`
   parameter so it can run inside `unitOfWork.run()`. Every Drizzle call ends in
   `.catch(wrapRepoError)` — flag any repository method missing this.
4. **Entity** (`<feature>.entity.ts`, entity-backed modules only) — a private-constructor
   wrapper class around the DB row (`static toEntity(row)`), with one getter per column plus any
   business logic that belongs to the entity itself, and a `toDTO()` mapper. Repositories never
   return raw Drizzle rows for entity-backed modules — always `Entity | null` / `Entity[]`.
5. **DTO** (`dto/<action>.dto.ts`, **one file per endpoint**) — a Zod input schema and a Zod
   output schema (+ inferred types) per usecase. Per-endpoint output schemas should `.extend()` a
   shared base schema rather than redefining fields. No usecase's `.input()`/`.output()` should
   ever be an inline `z.object(...)` — it must come from `dto/`.

All module routers are combined in a single place: `src/server/api/root.ts`. A new module's
router must be registered there; nothing else needs wiring.

### tRPC procedures — which one, and where

Procedure variants are defined **only** in `src/server/api/trpc/procedures.ts` — flag any PR that
defines an auth check inline in a router instead of adding/reusing a procedure here. Routers
import procedures from the barrel `@/server/api/trpc`, never from `procedures.ts` directly.

| Procedure | Use for |
|---|---|
| `publicProcedure` | No auth required — public reads anyone can call |
| `protectedProcedure` | Requires a signed-in user; most user-scoped reads/writes |
| `adminProcedure` | Requires `role === "ADMIN"`; admin-only mutations/reads |

Flag a `protectedProcedure`/`adminProcedure` endpoint that re-checks `ctx.session.user` for
null — the procedure already narrows that; an extra check is dead code.

### Error handling

- Usecases throw the factory functions from `@/server/errors` (`notFound`, `conflict`,
  `unauthorized`, `validationError`) for expected domain failures — never a raw `Error` or a
  hand-built `TRPCError`.
- Repositories never catch-and-interpret DB errors themselves beyond `.catch(wrapRepoError)` —
  they don't decide what a DB error means; that's the usecase's job based on what the repository
  method returned (e.g. `null` for not-found, not a thrown error).
- No raw driver/DB error message should ever be visible in a thrown error's `message` — only
  passed as `cause` (which is stripped before reaching the client).

### Unit of Work — required for multi-repository writes

Any usecase that writes to more than one table and needs those writes to succeed or fail
together **must** use `unitOfWork.run(async (client) => { ... })` from
`@/server/db/unit-of-work`, passing the same `client` into every repository call inside the
callback. Flag a PR that calls multiple repository write methods in sequence without a unit of
work when they're meant to be atomic. Side effects that shouldn't roll back with the DB (sending
email, uploading to R2, etc.) belong **outside** the `unitOfWork.run()` block, after it resolves.

### External integrations belong in `/services`

Anything that talks to a third-party service (not the app's own Postgres DB) goes in
`src/server/services/`, not inside a feature module — see `r2.ts` (Cloudflare R2) and
`mailer.ts` (Resend) for the pattern: a single module-level client configured from
`@/config/env`, plain exported `async` functions, errors caught and re-thrown with a safe
generic message (raw provider errors are logged, not propagated). Flag a PR that instantiates a
third-party SDK client inside a module's repository or usecase instead of adding/reusing a
`services/` file.

## Frontend

Conventions here are intentionally minimal for now — more will be added as the frontend grows.

- **UI components**: use shadcn/ui (`src/components/ui/`, config in `components.json`, style
  `new-york`). Don't hand-roll a component that shadcn already provides — add it via the CLI
  instead.
- **Icons**: use `lucide-react` exclusively. Flag a PR that adds a different icon library or
  inlines raw SVG icons.
