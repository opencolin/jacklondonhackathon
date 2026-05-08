# CodeCruise — Backend Engineering Plan

**Doc version:** v0.1 · 2026-05-07
**Owner:** TBD · **Reviewers:** TBD
**Target:** ship a backend that runs CodeCruise end-to-end by **May 28, 2026** (submission deadline) and supports the boat-day logistics on **May 30**. Anything beyond that is platform-scope and lives in §15.

---

## 1. Goals & non-goals

**MVP must do (by May 14):**
1. Builder signup and identity (GitHub OAuth + email).
2. Office-hours RSVP and calendar feed.
3. GitHub-based submissions accepted any time before May 28.
4. AI judging pipeline that reads every submission and ranks them on a rubric.
5. Sponsor judges can read AI scores, override, leave comments.
6. Top-30 finalist selection on May 29.
7. Boat-day manifest export: who's coming, dietary, emergency contact.

**MVP shouldn't do (yet):**
- Cloud IDE / Contree workspaces. Builders use their own machines.
- Sponsor "integration telemetry" dashboards. Defer to v0.2.
- Workshop video upload pipeline. Workshops link to existing Zoom/YouTube.
- Companies portal feature parity. CodeCruise has 3 sponsors; we can manage them in admin.

**Hard non-goals:**
- Multi-tenant isolation. CodeCruise is one event; sponsor data co-exists in shared tables with `sponsor_id` scoping.
- Mobile apps. Web only.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 (App Router)                    │
│    ┌────────────────────┐         ┌─────────────────────┐   │
│    │  React Server Comp │  ◄────► │  Route Handlers     │   │
│    │  (pages, SSR)      │         │  (REST + tRPC)      │   │
│    └────────────────────┘         └──────────┬──────────┘   │
│                                              │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                  ┌────────────────────────────┴────────────┐
                  ▼                ▼                        ▼
           ┌────────────┐   ┌──────────────┐         ┌─────────────┐
           │  Postgres  │   │  Upstash     │         │  R2 / S3    │
           │  (Neon)    │   │  Redis       │         │  blobs      │
           └─────┬──────┘   └──────┬───────┘         └─────────────┘
                 │                 │
                 │                 │  BullMQ job queues
                 │                 ▼
                 │         ┌────────────────────────────────┐
                 │         │  Worker (Node, Vercel Cron +   │
                 │         │  Railway/Fly for long jobs)    │
                 │         └────────────┬───────────────────┘
                 │                      │
                 │      ┌───────────────┼─────────────────┐
                 │      ▼               ▼                 ▼
                 │  ┌────────┐    ┌──────────┐      ┌──────────┐
                 │  │ Nebius │    │ Composio │      │ Tavily   │
                 │  │ Token  │    │ tools    │      │ search   │
                 │  │Factory │    │          │      │          │
                 │  └────────┘    └──────────┘      └──────────┘
                 │                      ▲
                 ▼                      │
            ┌─────────┐         ┌──────────────┐
            │ GitHub  │ ──────► │ Webhooks     │
            │ App     │  push   │ (commits,    │
            │         │         │  releases)   │
            └─────────┘         └──────────────┘
```

**Why this shape:**
- One Next.js app keeps cognitive load low for a 3-week build. Route handlers do the API.
- Long-running and bursty work (AI judging, email blasts, repo cloning) goes to a separate worker — Vercel functions max out at ~5 min and 1024 MB.
- Postgres for everything relational; Redis for sessions + rate limit + queues + ephemeral leaderboard cache.
- Object storage (R2 cheaper than S3, identical API) for the small handful of uploads we actually accept.

---

## 3. Tech stack decisions

| Concern | Pick | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Already in the codebase. RSC + route handlers cover us. |
| Language | TypeScript everywhere | Frontend already TS. Worker shares types via monorepo. |
| Database | Postgres on Neon | Branching DBs per preview deploy is huge for review. |
| ORM | Drizzle | Type-safe, no runtime overhead, easy migrations. Avoid Prisma's bundle weight on serverless. |
| Auth | Auth.js (NextAuth) v5 | Mature OAuth + magic link + DB session. Drizzle adapter exists. |
| Validation | Zod | Used at all trust boundaries — request body, env, third-party responses. |
| API style | tRPC for builder/sponsor app, REST for webhooks | tRPC gives free types end-to-end; REST for things GitHub posts at us. |
| Queues | BullMQ on Upstash Redis | One stack for sessions + queues. |
| Worker host | Railway (Hobby tier first) | Long-lived processes, sticky to one region near Neon. |
| Object storage | Cloudflare R2 | S3 API, no egress fees. |
| Email | Resend | React Email components, easy domain auth. |
| Observability | Sentry + Axiom | Errors + logs. PostHog later for product analytics. |
| Testing | Vitest + Playwright + Drizzle's test container | Unit, e2e, real-DB integration. |

Open questions:
- **Edge vs. Node runtime?** Default Node. Edge only for the hot read endpoints if we have time.
- **Session strategy?** Database sessions, not JWT — we want to be able to revoke on user disable.

---

## 4. Database schema

Drizzle is the source of truth. Below is the conceptual model. Names use snake_case in Postgres, camelCase in TS via Drizzle inference.

### 4.1 Identity

```ts
users (
  id           uuid pk
  email        citext unique not null
  name         text
  image_url    text
  github_url   text
  github_login text unique          -- denormalized for repo lookups
  linkedin_url text
  twitter_url  text
  discord_id   text unique
  phone        text
  member_since timestamptz default now()
  is_admin     boolean default false
  status       enum('active','disabled','ghost')
  created_at, updated_at
)

accounts ( -- Auth.js OAuth providers
  id, user_id fk users, provider, provider_account_id,
  access_token, refresh_token, expires_at, token_type, scope,
  unique(provider, provider_account_id)
)

sessions ( -- Auth.js DB sessions
  session_token pk, user_id fk users, expires
)

verification_tokens ( -- magic link
  identifier, token unique, expires
)
```

### 4.2 Event domain

```ts
sponsors (
  id, slug unique, name, logo_url, primary_color, doc_url, site_url,
  status enum('active','past'),
  created_at
)

venues (
  id, name, address, city, region, country,
  lat numeric, lng numeric,
  is_online boolean default false,
  capacity int,
  notes text
)

events (
  id, slug unique, title, description, format enum,
  state enum('draft','published','live','completed','cancelled'),
  starts_at, ends_at,
  venue_id fk venues,
  capacity int, registered int default 0,
  cover_gradient text,        -- the tailwind class strings we already use
  prize_pool_cents int,
  partners_json jsonb,        -- denormalized list for fast cards
  parent_event_id fk events nullable,  -- office-hours sessions belong to CodeCruise
  rrule text nullable,        -- RFC 5545 recurrence for office hours
  created_by fk users,
  created_at, updated_at
)

event_sponsors (
  event_id, sponsor_id, role enum('host','primary','partner'),
  unique(event_id, sponsor_id)
)

event_registrations (
  id, event_id, user_id,
  status enum('rsvp','confirmed','waitlist','cancelled'),
  source enum('builder','company'),
  created_at,
  unique(event_id, user_id)
)
```

For CodeCruise itself, we seed:
- One `events` row with format=`HACKATHON`, state=`live` from May 7 onward.
- Five recurring `events` rows (one per weekday) with `parent_event_id` = CodeCruise, format=`OFFICE_HOURS`, `rrule="FREQ=WEEKLY;BYDAY=MO"` etc. We expand `rrule` server-side when listing.

### 4.3 Teams & projects

```ts
teams (
  id, event_id, name, leader_id fk users,
  created_at,
  unique(event_id, name)
)

team_memberships (
  team_id, user_id, role enum('leader','member','alumni'),
  joined_at,
  unique(team_id, user_id)
)

team_invitations (
  id, team_id, email citext, invited_by fk users,
  status enum('pending','accepted','declined','expired'),
  expires_at, created_at
)

projects (
  id, team_id, event_id,
  name, summary text, repo_url text, demo_url text,
  video_url text, video_thumb_url text,
  status enum('draft','submitted','accepted','finalist','winner','rejected'),
  ai_score numeric,        -- 0..100, populated by judge worker
  human_score numeric,     -- avg of judge_scores
  composite_score numeric, -- ai * 0.5 + human * 0.5 (configurable)
  composite_rank int,      -- materialized after each scoring pass
  submitted_at timestamptz,
  finalized_at timestamptz,
  created_at, updated_at,
  unique(team_id, event_id)  -- one project per team per event
)

submissions ( -- snapshots; a project can have many over time
  id, project_id,
  github_default_branch_sha text,
  github_snapshot_json jsonb,  -- file tree + commit history at snapshot time
  rubric_version text,
  status enum('queued','running','scored','failed'),
  ai_summary text,
  created_at, scored_at
)

judge_scores (
  id, submission_id, judge_id fk users, judge_kind enum('ai','sponsor','angel','vc'),
  scores_json jsonb,        -- { usefulness:8, integration:7, demo:9, ... }
  weighted numeric,         -- aggregate
  notes text,
  created_at,
  unique(submission_id, judge_id)
)
```

### 4.4 Office hours, judges, manifest

```ts
office_hours_sessions (  -- each individual occurrence (we materialize from rrule weekly)
  id, parent_event_id, starts_at, ends_at, venue_id, host_user_id,
  join_url text, capacity int default 100,
  status enum('upcoming','live','done','cancelled')
)

office_hours_rsvps (
  id, session_id, user_id, status enum('rsvp','attended','no_show'),
  unique(session_id, user_id)
)

judges (  -- promotes a user to judge with a kind (avoids polluting users table)
  id, user_id, kind enum('ai','sponsor','angel','vc'),
  sponsor_id fk sponsors nullable,
  active boolean default true,
  unique(user_id, kind, sponsor_id)
)

boat_manifest (
  id, user_id, project_id, role enum('builder','judge','sponsor','crew','press'),
  emergency_contact_name, emergency_contact_phone,
  dietary text, swim_release_signed boolean default false,
  swim_release_signed_at timestamptz,
  checked_in boolean default false, checked_in_at timestamptz,
  notes text
)

audit_log (
  id, actor_id fk users, action text, target_type text, target_id text,
  metadata jsonb, created_at
)
```

### 4.5 Indexing notes

- `events(state, starts_at)` — list pages.
- `projects(event_id, composite_rank)` — leaderboard.
- `submissions(project_id, created_at desc)` — last submission lookup.
- `event_registrations(user_id, status)` — "events I'm in".
- `judge_scores(submission_id)` — aggregate rollup.
- `office_hours_sessions(parent_event_id, starts_at)` — calendar.

Most counts (`registered`, `composite_rank`) are denormalized; recalc in the same transaction that mutates source rows. No triggers — they hide bugs.

---

## 5. API surface

### 5.1 tRPC routers

```
auth        signIn, signOut, session, me
events      list, byId, bySlug, register, cancelRegistration
teams       create, addMember, removeMember, invite,
            acceptInvite, declineInvite, my
projects    upsert, submit, mySubmissions, leaderboardForEvent
submissions byId, latestForProject
judging     scoresForSubmission, upsertScore (judges only)
sponsors    list, byId
officeHours list (with rrule expansion), rsvp, cancelRsvp
manifest    me, upsertContact, signSwimRelease,
            export(eventId) (admin/crew)
admin       grantJudge, finalizeFinalists, exportManifestCsv
```

Every mutation is a Zod-validated input. Every read is paginated where it can grow.

### 5.2 REST endpoints

```
GET  /api/events.ics                 (calendar feed for office hours)
POST /api/webhooks/github            (push events for tracked repos)
POST /api/webhooks/discord           (welcome bot)
POST /api/webhooks/resend            (delivery + bounces)
POST /api/admin/jobs/judge           (cron-style trigger; scoped key)
GET  /api/health                     (Vercel uptime)
```

### 5.3 Trust boundaries

- Public: events list, sponsors list, workshop list. No auth.
- Builder: anything `me`-scoped. Auth.js session required.
- Sponsor: scoped by sponsor_id derived from session role.
- Judge: scoped by judge kind + sponsor link.
- Admin: hardcoded user emails until we need real RBAC.

---

## 6. Auth & sessions

- Auth.js v5 with the Drizzle adapter.
- Providers: GitHub (primary — needed for repo access anyway), Google, LinkedIn, magic link via Resend.
- Sessions: database-backed, cookie-only, 30-day rolling expiry, `Secure; HttpOnly; SameSite=Lax`.
- Account linking: same email across providers auto-merges (this is already in the login copy).
- Roles derived at request time:
  - `is_admin` → admin
  - matching `judges` row → judge of that kind
  - linked to `sponsors` via a sponsor_admins table → sponsor admin
  - everyone else → builder
- Sign-out clears the session row and the cookie. The frontend `cc-logged-in` localStorage flag is purely a nav hint — never trusted server-side.

---

## 7. AI judging pipeline

This is the load-bearing thing. It must work, it must be fair, and we need to be able to defend the rubric.

### 7.1 Trigger

When a builder calls `projects.submit`:
1. Validate project has `repo_url`, `summary`, and at least one commit.
2. Insert a `submissions` row with status `queued`, snapshot the GitHub default-branch SHA.
3. Enqueue `judge.score` job with the submission id.

### 7.2 Worker steps

```
judge.score(submissionId):
  1. Mark running.
  2. Fetch repo:
       - GitHub App token, scoped to repo
       - clone shallow (depth 50) into /tmp
       - extract: README, package.json, key source files (heuristic), commit log
  3. Build "evidence pack":
       - structured: language, stack, integration touchpoints
         (greps for nebius, composio, tavily; SDK imports)
       - text: README, summary, top 3 commit messages
       - links: demo_url, video_url
  4. Run rubric judges in parallel via Token Factory:
       - usefulness        (does the project solve a real problem?)
       - integration_depth (how meaningfully does it use the sponsor stack?)
       - demo_quality      (is there a working demo, can a stranger try it?)
       - originality       (is this novel or a remix?)
       - code_quality      (heuristic: tests, structure, docs)
     Each call returns { score: 0..10, reasoning: string }
  5. Aggregate: weighted mean with rubric_version weights.
  6. Write judge_scores row with judge_kind='ai'.
  7. Recompute project.ai_score, composite_score, composite_rank.
  8. Mark submission scored, scored_at = now().
  9. Notify (Discord webhook + email if score crossed top-30 boundary).
```

Failure handling:
- Repo private / 404 → status `failed`, surface to builder with a "fix and re-submit" CTA.
- Token Factory transient → retry with exp backoff up to 5 attempts.
- Rubric prompts versioned in code; new version = new submissions get re-scored.

### 7.3 Human override

Sponsor / angel / VC judges write to the same `judge_scores` table with their `judge_kind`. The composite formula:

```
composite =
  0.4 * ai_score +
  0.4 * avg(sponsor_scores) +
  0.2 * avg(angel + vc_scores)   -- 0 if no entries yet
```

Configurable per event via a `scoring_config_json` column on `events`.

### 7.4 Determinism

- AI judges call the same model with `temperature=0.2`, `seed=submissionId%2^31`.
- We re-score on rubric version change, not on every API call.
- Scoring runs in a transaction; we never publish a partially-recomputed leaderboard.

### 7.5 Anti-gaming

- Submissions throttled to 5/day/user.
- We diff submissions and only re-score if the SHA changed.
- Repo must be public OR grant our GitHub App access, otherwise submissions are rejected at intake.
- Any team member can submit, but only the leader can finalize.

---

## 8. Background jobs

| Queue | Job | Cadence | Notes |
|---|---|---|---|
| `judge` | `judge.score` | on-demand | §7 |
| `email` | `email.blast`, `email.transactional` | on-demand | Resend, batched |
| `discord` | `discord.notify` | on-demand | webhook |
| `calendar` | `calendar.materialize` | nightly | expand rrule into office_hours_sessions |
| `manifest` | `manifest.remind` | daily after May 25 | nudge finalists to fill out emergency contact |
| `cleanup` | `submissions.gc` | weekly | drop snapshot blobs older than 30 days |

All jobs idempotent (job id derived from input where possible).

---

## 9. Real-time

For the May 30 boat day we need a real-time leaderboard during demos.

- **Pusher Channels** (cheap, easy) for v0. Channel per event.
- Worker emits `score:updated` events whenever `composite_rank` changes for top-30.
- Front-end subscribes on `/events/code-cruise/leaderboard`.

If Pusher gets pricey, swap to Vercel Edge + native WebSockets.

---

## 10. Storage

- **Project videos** — accept either: hosted YouTube / Vimeo / Loom URL (preferred), or direct upload to R2 (Mux pulls from R2 for streaming; we just store the URL).
- **Avatars** — OAuth provider's image URL only. No direct upload.
- **Boat-day photos** — post-event, R2 bucket with signed URLs and a manifest table.

R2 access: presigned URLs for upload, public-read for delivery. No private buckets in v0.

---

## 11. Third-party integrations

| Service | Purpose | Risk |
|---|---|---|
| GitHub App (CodeCruise) | Repo read for AI judge, webhooks | Org install required for private repos. Public repos work without. |
| Nebius Token Factory | LLM calls for AI judge | Rate limits; pre-warm during heavy submission window. |
| Composio | Verify integrations claimed in submissions | Optional in v0. |
| Tavily | Sanity-check claims in submissions | Optional in v0. |
| Resend | All email | Domain auth (SPF/DKIM/DMARC) on `mail.codecruise.events` before May 14. |
| Discord | Builder community, notifications | Server invite link in welcome email. |
| Stripe | Sponsor invoicing | Out of scope for CodeCruise (sponsors paying via wire). |

For ALL outbound calls: per-provider client wrapper with timeout, retry, and circuit breaker. Logged to Axiom with correlation IDs.

---

## 12. Telemetry

In v0 we log:
- Auth events
- Submissions
- Job runs (start, finish, fail) with duration
- Score changes
- Office-hours RSVP changes
- Boat manifest changes

Stored as `audit_log` rows, also mirrored to Axiom for fast search. PostHog wired into the frontend separately for funnel analysis.

---

## 13. Testing

### 13.1 Layers

- **Unit (Vitest)** — pure functions, especially scoring math, rubric weighting, rrule expansion.
- **Integration (Vitest + testcontainers Postgres)** — every tRPC procedure with a real DB, stubbed third parties.
- **E2E (Playwright)** — golden flows: sign up → register → submit project → see score; sponsor judge flow; admin finalize.
- **Load (k6)** — surge test for May 28 deadline window. Target 200 simultaneous submissions / minute.

### 13.2 CI

- GitHub Actions: `lint`, `typecheck`, `test:unit`, `test:integration`, `test:e2e` (only on PR), `build`.
- Preview deploy on every PR via Vercel + Neon branch.

---

## 14. Infra & deployment

- **Hosting:** Vercel for Next.js. Worker on Railway (start) — keep an eye on cost; move to Fly machines if Railway gets noisy.
- **Database:** Neon Postgres, prod + branch-per-PR.
- **Redis:** Upstash, regional pair.
- **Storage:** Cloudflare R2.
- **Domain:** `codecruise.events`. Subdomain layout:
  - `codecruise.events` — marketing + app
  - `mail.codecruise.events` — Resend
  - `cdn.codecruise.events` → R2 worker
- **Secrets:** Vercel env vars for app, Railway env vars for worker, both pulled from 1Password vault on rotation.
- **Backups:** Neon nightly snapshot retained 7 days. Plus a manual `pg_dump` to R2 weekly during the build period.
- **Disaster recovery:** documented runbook in `RUNBOOK.md` (TODO before May 14).

---

## 15. Phasing & milestones

| Window | What ships | Owner | Done = |
|---|---|---|---|
| **W1: May 7 – 14** | Auth, schema, builder profile, event listings, office-hours RSVP | Backend lead + 1 | A builder can sign in, RSVP for an office-hour session, and see it in their dashboard. |
| **W2: May 15 – 21** | Submissions, GitHub App, AI judge worker, leaderboard | Backend lead + AI eng | A builder submits a repo and sees an AI score within 5 minutes. |
| **W3: May 22 – 28** | Sponsor judge UI, finalist selection, boat manifest, sign-up flows | Backend lead + Frontend | Submission deadline holds; sponsor judges can read and override AI scores. |
| **May 29** | Top-30 cut, finalist notifications, manifest open | Whole team | 30 builders notified; manifest filled out by EOD. |
| **May 30** | Boat-day live leaderboard, demos, judging UI, winner finalization | Whole team | Winner picked, $10k + DGX Spark dispatched. |
| **Post-event** | Telemetry rollups, public leaderboard, post-event blog auto-recap | Backend + DevRel | Everyone can see who won and why. |

---

## 16. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI judge gives wildly wrong scores | M | H | Sponsor judges always have override. Composite weights AI at 40%. |
| Submission deadline DDoS at T-1 hour | M | H | k6 load test in W2. Submission queue is async — UI says "queued, score in 5m". |
| Token Factory rate-limit hit | M | M | Pre-warm with synthetic submissions on May 27. Fallback to Anthropic. |
| Magic link emails go to spam | M | M | Domain auth done in W1. Track Resend bounce rate. |
| GitHub App install gets flagged | L | H | Use a public repo path that needs zero install. Private path is opt-in. |
| Boat-day Wi-Fi flakey | M | M | Starlink confirmed (per event plan). Local cache of leaderboard renders if API drops. |
| Builder forgets to sign swim release | M | L | Manifest export blocks if any finalist hasn't signed. Reminder emails in `manifest.remind`. |

---

## 17. Open questions

1. **Project ownership when a team member leaves.** Default: leader keeps it. Need a flow.
2. **Multi-event** support during this build cycle. Recommend: hardcode `code-cruise` as the active event everywhere; add a query param later.
3. **Public leaderboard** before May 30 — yes/no? Lean yes, top 50 visible after submission deadline. Sponsors might have opinions.
4. **DGX Spark fulfillment** — manual for v0, but who's holding the SKU?
5. **Time zones** — show Pacific everywhere, or auto-detect? Lean Pacific (event is in SF/Oakland) with explicit TZ label.
6. **Builders outside the US** — taxes, legal release for prize money. Punt to legal review before May 28.

---

## 18. Out-of-scope (for now)

Listed for transparency; revisit after May 30:

- Full sponsor portal feature parity (event creation, billing, prize fulfillment).
- Cloud IDE (Contree workspaces).
- Workshop video upload + recording pipeline.
- Sponsor "integration telemetry" dashboards.
- Multi-tenant org model.
- Mobile native apps.
- Offline mode.

---

## Appendix A — Required env vars

```
DATABASE_URL=                       # Neon prod URL (pooled)
DATABASE_URL_DIRECT=                # Neon direct (migrations)
REDIS_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_LINKEDIN_ID=
AUTH_LINKEDIN_SECRET=
RESEND_API_KEY=
NEBIUS_TOKEN_FACTORY_KEY=
COMPOSIO_API_KEY=
TAVILY_API_KEY=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_WEBHOOK_SECRET=
DISCORD_WEBHOOK_URL=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
SENTRY_DSN=
AXIOM_TOKEN=
AXIOM_DATASET=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_APP_URL=
```

## Appendix B — Folder layout (target)

```
src/
  app/                  # Next.js routes (already present)
  server/
    auth/               # Auth.js config + adapter
    db/
      schema.ts         # Drizzle tables
      migrations/
      seed.ts
    routers/            # tRPC routers
    services/           # domain logic (judging, manifest, scoring)
    integrations/       # provider clients
    queue/              # BullMQ job definitions
    workers/            # worker entry point (separate process)
    lib/
  components/           # React (already present)
  lib/                  # shared client+server utils
test/
  unit/
  integration/
  e2e/
worker/
  index.ts              # Railway entry
```

## Appendix C — Day-of runbook (May 30) — TODO

To be written by May 27. Includes:
- on-call rota
- escalation path (oncall → SRE → captain)
- rollback procedure if leaderboard publishes wrong winner
- how to manually freeze submissions
- how to re-run the judge for a single submission
- how to print the manifest if API is down
