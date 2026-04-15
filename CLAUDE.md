# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**VenueHub** — a hall/event space booking system. Monorepo with two independent apps under `apps/`. The full product spec lives in [docs/venuehub-kickstart-prompt.md](docs/venuehub-kickstart-prompt.md) and is the source of truth for scope, data model, API surface, and UI flows. Read it before implementing anything.

**Note on deviations from the spec**: the original spec called for NestJS + Prisma + custom JWT auth. The project has pivoted to:
- **Hono + Node** backend (not NestJS)
- **Supabase** (Postgres + Auth + RLS) as the data and auth layer — not raw Postgres with Prisma
- **Supabase Auth** for the admin login — not custom Passport JWT
- **Frontend talks to Supabase directly** for public reads (venue, time slots, booking-by-reference) and admin reads/writes. The Hono backend only handles endpoints that need server-side business rules (primarily `POST /api/bookings` so capacity/availability/reference-number generation run with the service role, not on the client).

Translate the spec's *intent* to these tools — don't follow NestJS/Prisma/Passport conventions literally.

## Repository Layout

```
apps/
  backend/                 # Hono + Node API (thin — only server-side rules)
  frontend/                # Vite + React + TS SPA (talks to Supabase directly)
supabase/
  migrations/              # SQL migrations — source of truth for schema + RLS
docs/
  venuehub-kickstart-prompt.md  # Full product + tech spec (pre-Supabase pivot)
```

Treat `apps/backend` and `apps/frontend` as independent applications (separate `package.json`, separate install/build/test). There is no root workspace tooling yet — if adding one (pnpm/turbo/nx), do it deliberately, not as a side effect.

## Architecture (target state per spec)

**Frontend** — Vite + React + TS, Tailwind + shadcn/ui, React Router v6 (protected admin routes), TanStack Query for server state, React Hook Form + Zod for forms, date-fns, Lucide icons, `@supabase/supabase-js`. Feature-based folders: `features/booking`, `features/admin`, `features/venue`, `shared/{components,hooks,lib}`. The Supabase client lives at [apps/frontend/src/lib/supabase.ts](apps/frontend/src/lib/supabase.ts) — import from there, don't create new clients. The booking flow is a 5-step stepper (Date → Time → Details → Review → Done) whose cross-step state lives in a Context + useReducer, not in TanStack Query.

**Backend** — Hono on Node (`@hono/node-server`), TypeScript, ESM, run via `tsx watch` in dev and `tsc` → `node dist/index.js` in prod. Intentionally thin: it exists for endpoints that need the service role or server-side business rules. Organize by feature under `src/` with each feature exposing a Hono sub-app mounted on the root app. Validation via `@hono/zod-validator` + Zod. Centralize error handling with `app.onError`. Admin routes verify the caller's Supabase JWT and check `admin_user` membership — they do *not* use a second auth system. Service-role client is at [apps/backend/src/lib/supabase.ts](apps/backend/src/lib/supabase.ts).

**Data model** — defined in SQL at [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql). Tables: `venue`, `time_slot`, `booking`, `admin_user`. Admin identity is `auth.users` from Supabase; `admin_user` is a join table that marks which auth users are VenueHub admins so RLS can use `is_admin()`. Booking has a unique human-readable `reference_number` like `VH-20260415-001` (generated server-side) and enums `event_type` + `booking_status`. There's a uniqueness constraint on `(venue_id, date, time_slot_id)` that is the last line of defense against double-booking — the backend should still check availability before insert for a clean error.

**API surface** — public reads go **directly to Supabase from the frontend** (venue, time slots, booking-by-reference) gated by RLS policies. The Hono backend owns:
- `POST /api/bookings` — validates, generates reference number, checks availability, inserts with service role
- `PATCH /api/admin/bookings/:id` — approve/reject with admin note (could be direct Supabase under RLS, but keep it on the backend so side effects like notifications have a home)
Admin reads (list, detail, stats) can go direct to Supabase under RLS — no need for a backend endpoint per spec item.

**RLS is load-bearing.** Don't disable it "temporarily" and don't work around it with the service role on the frontend. If a query fails because of RLS, the fix is almost always a policy change in a new migration, not a backend bypass.

## MVP Constraints (non-obvious, enforce these)

- **Single venue** in the UI, but the data model is multi-venue — keep the `venue_id` FK even though the UI hardcodes one.
- **No payments, no file uploads, no real-time**. Pricing is display-only. Images are seeded as URLs. Admin dashboard polls or refreshes manually.
- **No public registration** — admin accounts are created in the Supabase dashboard (or via `auth.admin.createUser` with the service role), then inserted into `admin_user`. The seed should create: 1 venue, 3–4 time slots, 1 admin (`admin@venuehub.com` / `admin123`), 5–10 sample bookings across statuses.
- **Validation is load-bearing**: guest count within venue capacity, booking date in the future, time slot available for that date. Enforce in the Hono `POST /api/bookings` handler *before* insert. The DB unique constraint `(venue_id, date, time_slot_id)` is a safety net, not primary validation.
- **Mobile-first**: the booking flow in particular must be tested at 375px width.

## Commands

Run from each app directory independently — there is no root workspace.

**Frontend** (`apps/frontend`):
- `npm install` — install deps
- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — ESLint
- `npm run preview` — serve the built bundle

**Backend** (`apps/backend`):
- `npm install` — install deps
- `npm run dev` — `tsx watch src/index.ts` (hot-reload)
- `npm run build` — `tsc` → `dist/`
- `npm start` — `node dist/index.js`

No test runner is wired up yet in either app. When adding tests (Vitest is the natural fit for both), record the `test` and single-test invocations here.

**Supabase**:
- Create a project at supabase.com, copy URL + anon key + service role key into `apps/frontend/.env` and `apps/backend/.env` (templates are in each `.env.example`).
- Apply schema: run [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) in the Supabase SQL editor, or via the Supabase CLI (`supabase db push`).
- New schema changes go in a new numbered migration file under `supabase/migrations/` — never edit `0001_init.sql` after it's been applied.
