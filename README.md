# BuilderShip

A three-week remote AI hackathon culminating in finals on the bay aboard the Dragon Lady — May 30, 2026. This repo is the marketing site, builder dashboard, and (in progress) backend that runs it.

## What's in here

```
Nebius Builders Boat Hackathon/   Event plan + engineering plan (read these first)
├── PLAN.md                        Event logistics
└── ENGINEERING.md                 Backend architecture, schema, milestones

src/
├── app/                           Next.js 14 App Router
│   ├── api/auth/[...nextauth]/    Auth.js v5 handler
│   ├── api/trpc/[trpc]/           tRPC fetch handler
│   ├── api/health/                Liveness probe
│   ├── builders/                  Builder console + login
│   ├── companies/                 Sponsor login + dashboard
│   ├── events/                    Public events index + detail
│   ├── workshops/                 Workshop library
│   ├── docs/                      Builder docs
│   └── page.tsx                   BuilderShip homepage
├── components/                    UI components (TopNav, AppHeader, cards, …)
│   └── auth/                      Login card
├── lib/                           Client-side utils + tRPC client
└── server/                        Backend code (RSC + worker)
    ├── auth/                      Auth.js v5 config
    ├── db/                        Drizzle schema + migrations + seed
    ├── trpc/                      tRPC base + context
    ├── routers/                   Per-domain routers
    ├── services/                  Domain logic (judging, calendar)
    ├── integrations/              Provider clients
    │                              (Nebius, Composio, Tavily, GitHub,
    │                               Resend, Discord, Pusher, R2)
    ├── queue/                     BullMQ queues
    └── workers/                   Worker process entry
```

## Quick start (M1 — marketing + builder signup)

You need Node 20+, pnpm or npm, and these accounts:

- **Neon** Postgres — free tier
- **Resend** — free tier covers ~100 emails/day; magic-link sign-in only
- **GitHub OAuth app** — create one at github.com/settings/applications/new
- **Vercel** for hosting

```bash
# Install
npm install

# .env.local — copy from .env.example and fill in:
# DATABASE_URL=                  postgres://… (Neon pooled)
# DATABASE_URL_DIRECT=           postgres://… (Neon direct, for migrations)
# AUTH_SECRET=                   `openssl rand -base64 32`
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=
# RESEND_API_KEY=
# RESEND_FROM_EMAIL="BuilderShip <hello@mail.buildership.events>"
# NEXT_PUBLIC_APP_URL=           e.g. http://localhost:3030

# Database
npm run db:generate     # generate migrations from schema diff
npm run db:migrate      # apply migrations
npm run db:seed         # seed sponsors, venues, BuilderShip event, office hours

# Run
npm run dev             # http://localhost:3030
```

That's it for M1. You can sign in with GitHub, you'll auto-register for BuilderShip, you'll see the events page and the office hours.

## What's NOT wired up at M1

These ship in M2 (week of May 21+):

- Project submission flow + GitHub repo linking
- AI judging worker (needs Upstash Redis)
- Sponsor judge UI
- Live leaderboard (needs Pusher)
- Boat manifest + swim release
- Discord notifications
- R2 video uploads
- Cloud IDE / Contree workspaces

See `Nebius Builders Boat Hackathon/ENGINEERING.md` §15 for the milestone breakdown.

## Scripts

```bash
npm run dev             # Next.js dev (port 3030)
npm run build           # Next.js production build
npm run typecheck       # tsc --noEmit
npm run lint            # next lint

npm run db:generate     # drizzle-kit generate
npm run db:migrate      # apply migrations
npm run db:push         # quick dev sync (skips migrations)
npm run db:seed         # seed BuilderShip + office hours + sponsors
npm run db:studio       # drizzle-kit studio

npm run worker          # run the BullMQ worker locally (M2+)
npm run test            # vitest
```

## Architecture in 60 seconds

- **Frontend:** Next.js 14 App Router, mostly RSCs reading via `await api()` (server-side tRPC caller). Tailwind. Dark mode via class strategy with anti-flash inline script.
- **Backend:** tRPC routers calling Drizzle on Neon Postgres. Auth.js v5 with the Drizzle adapter and DB sessions.
- **Worker (M2):** Separate Node process running BullMQ jobs against Upstash Redis. Hosts the AI judge pipeline that calls Nebius Token Factory for rubric scoring.
- **Integrations:** Each lives in `src/server/integrations/` and no-ops if its env is missing — the app boots without secrets.
