# `src/server`

Server-only code for the CodeCruise backend. Layout:

```
auth/         Auth.js v5 config + Drizzle adapter wiring.
db/           Drizzle schema, client, migrations, seed.
trpc/         tRPC base (init, context, root) and the per-domain routers
              are in src/server/routers/.
routers/      tRPC routers (auth, events, teams, projects, submissions,
              judging, officeHours, manifest, sponsors, admin).
services/     Pure domain logic — no HTTP, no Redis. Tested in isolation.
              Notably src/server/services/judging.ts holds the AI judge
              pipeline (rubric, scoreSubmission, recomputeRanks).
integrations/ Per-provider client wrappers — nebius, composio, tavily,
              github, resend, discord, pusher, r2. Each one no-ops if
              its env is missing so the app boots without secrets.
queue/        BullMQ queue factories + typed enqueue helpers.
workers/      Worker process entry point. Run via `pnpm worker`.
              SEPARATE from the Next.js process; deploy on Railway/Fly.
email/        React Email templates (transactional + blasts).
lib/          Shared server-side utilities (fetch-with-timeout,
              hashing, etc.).
```

## Boot order

1. `src/server/env.ts` validates env on import. Dev gets a forgiving
   fallback; production throws.
2. `src/server/db/index.ts` reuses a postgres-js client across hot reloads.
3. Routers import from `db`, integrations, services. They don't touch
   Redis or external APIs directly.
4. Worker (`src/server/workers/index.ts`) is its own process. It imports
   the same db, services, and integrations.

## Common tasks

```bash
pnpm db:generate     # generate migrations from schema diff
pnpm db:migrate      # apply migrations against DATABASE_URL
pnpm db:push         # quick dev sync (skips migrations)
pnpm db:seed         # seed CodeCruise + office hours + sponsors
pnpm db:studio       # drizzle-kit studio
pnpm worker          # run the worker locally with watch
pnpm test            # vitest
```

## Trust boundaries

- `publicProcedure`     — no auth required.
- `protectedProcedure`  — signed-in user required.
- `judgeProcedure`      — user has at least one row in `judges`.
- `sponsorAdminProcedure` — user is in `sponsor_admins` for ≥1 sponsor.
- `adminProcedure`      — `users.is_admin = true`.

The `cc-logged-in` localStorage flag on the client is a navigation hint
only — never trusted server-side.
