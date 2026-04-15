# VenueHub Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the shared infrastructure that both apps depend on (Supabase project, env conventions, API contract) and verify the full system works end-to-end once the backend and frontend plans are both complete.

**Architecture:** The frontend and backend are independent apps that share three contracts: (1) the Supabase Postgres schema + RLS, (2) the env var naming convention, and (3) the HTTP API shape for the two backend endpoints. This plan owns those contracts and the end-to-end verification.

**Tech Stack:** Supabase (Postgres + Auth + RLS), shared Zod schemas for the HTTP contract, curl + browser-based end-to-end smoke tests.

**Execution order:**
1. Phase I1 (prereqs) — must be done BEFORE starting the backend or frontend plan.
2. Phase I2 (contract lock) — can run in parallel with backend/frontend plans.
3. Phase I3 (end-to-end verification) — runs AFTER both the backend and frontend plans are complete.

**Cross-references:**
- [docs/venuehub-kickstart-prompt.md](../venuehub-kickstart-prompt.md) — product spec
- [docs/plans/2026-04-15-venuehub-backend.md](2026-04-15-venuehub-backend.md) — backend plan
- [docs/plans/2026-04-15-venuehub-frontend.md](2026-04-15-venuehub-frontend.md) — frontend plan
- [CLAUDE.md](../../CLAUDE.md) — architecture deviations from the original spec
- [supabase/migrations/0001_init.sql](../../supabase/migrations/0001_init.sql) — current schema + RLS

---

## Phase I1: Prerequisites (manual setup)

These steps require the user. Agents cannot create Supabase accounts, paste secrets, or run the SQL editor. Halt and escalate until the user confirms each step.

### Task I1.1: Create Supabase project

- [ ] **Step 1: User creates a project at supabase.com**

Ask the user to:
1. Log into supabase.com.
2. Create a new project (any region; free tier is fine for the MVP).
3. Wait for the database to provision.
4. From Project Settings → API, copy:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key

- [ ] **Step 2: User pastes the three values into this conversation**

Halt and wait. Do not proceed without them.

### Task I1.2: Apply the initial migration

**Files:**
- Reference: [supabase/migrations/0001_init.sql](../../supabase/migrations/0001_init.sql)

- [ ] **Step 1: User opens the Supabase SQL editor and runs `0001_init.sql`**

Paste the full file contents into a new query in the Supabase SQL editor and execute. Confirm no errors. This creates tables, enums, indexes, `is_admin()`, and all RLS policies.

- [ ] **Step 2: Verify tables exist**

In the Supabase Table editor, confirm these tables are visible: `venue`, `time_slot`, `booking`, `admin_user`. All should be empty except that `booking`, `venue`, `time_slot`, `admin_user` have RLS enabled.

### Task I1.3: Create env files in both apps

**Files:**
- Create: `apps/frontend/.env`
- Create: `apps/backend/.env`

- [ ] **Step 1: Frontend env**

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Edit `apps/frontend/.env`:
```
VITE_SUPABASE_URL=<project url>
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 2: Backend env**

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```
SUPABASE_URL=<project url>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

- [ ] **Step 3: Confirm `.env` is gitignored**

Both Vite's default `.gitignore` and most Node scaffolds ignore `.env`. Verify:
```bash
cd apps/frontend && git check-ignore .env || echo "NOT IGNORED — add to .gitignore"
cd ../backend && git check-ignore .env || echo "NOT IGNORED — add to .gitignore"
```

If either is not ignored, add `.env` to the respective `.gitignore` (these apps currently live outside a git repo — if `git check-ignore` errors with "not a git repo" that's fine; handle this when the repo is initialized).

### Task I1.4: Apply seed migration

**Files:**
- Create: `supabase/migrations/0002_seed.sql`

- [ ] **Step 1: Write the seed migration**

```sql
-- supabase/migrations/0002_seed.sql
-- Idempotent seed for local dev + demos.

insert into venue (id, name, description, address, capacity, amenities, images, pricing_info)
values (
  '00000000-0000-0000-0000-000000000001',
  'The Atrium',
  'A light-filled event space in the heart of the city, perfect for weddings, workshops, and community gatherings.',
  '123 Garden Lane, Springfield',
  150,
  array['WiFi','Projector','Sound System','Parking','Catering kitchen','Wheelchair accessible'],
  array[
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600',
    'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=1600'
  ],
  '{"tiers":[{"name":"Half day","price":"$800"},{"name":"Full day","price":"$1400"},{"name":"Evening","price":"$1200"}]}'::jsonb
)
on conflict (id) do nothing;

insert into time_slot (id, venue_id, label, start_time, end_time) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Morning (9 AM – 12 PM)', '09:00', '12:00'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Afternoon (1 PM – 5 PM)', '13:00', '17:00'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Evening (6 PM – 10 PM)', '18:00', '22:00')
on conflict (id) do nothing;

insert into booking (reference_number, venue_id, date, time_slot_id, full_name, email, phone, event_type, guest_count, special_requests, status)
values
  ('VH-SEED-001', '00000000-0000-0000-0000-000000000001', current_date + 7,  '00000000-0000-0000-0000-000000000010', 'Amelia Chen',   'amelia@example.com', '555-0100', 'WEDDING',   80, 'Vegetarian catering please', 'PENDING'),
  ('VH-SEED-002', '00000000-0000-0000-0000-000000000001', current_date + 10, '00000000-0000-0000-0000-000000000011', 'Ben Okafor',    'ben@example.com',    '555-0101', 'CORPORATE', 40, null,                          'APPROVED'),
  ('VH-SEED-003', '00000000-0000-0000-0000-000000000001', current_date + 14, '00000000-0000-0000-0000-000000000012', 'Carla Diaz',    'carla@example.com',  '555-0102', 'BIRTHDAY',  25, 'Balloon setup',               'APPROVED'),
  ('VH-SEED-004', '00000000-0000-0000-0000-000000000001', current_date + 3,  '00000000-0000-0000-0000-000000000010', 'Dev Patel',     'dev@example.com',    '555-0103', 'WORKSHOP',  30, null,                          'PENDING'),
  ('VH-SEED-005', '00000000-0000-0000-0000-000000000001', current_date + 5,  '00000000-0000-0000-0000-000000000011', 'Eve Lindqvist', 'eve@example.com',    '555-0104', 'COMMUNITY', 60, 'Need stage setup',            'REJECTED'),
  ('VH-SEED-006', '00000000-0000-0000-0000-000000000001', current_date + 21, '00000000-0000-0000-0000-000000000012', 'Finn Murphy',   'finn@example.com',   '555-0105', 'OTHER',     20, null,                          'PENDING')
on conflict (reference_number) do nothing;
```

- [ ] **Step 2: User applies `0002_seed.sql` in the Supabase SQL editor**

Paste the file contents and run. Confirm in the Table editor: `venue` has 1 row, `time_slot` has 3, `booking` has 6.

### Task I1.5: Create the seed admin user

- [ ] **Step 1: User creates admin in Supabase Auth**

In the Supabase dashboard → Authentication → Users → "Add user":
- Email: `admin@venuehub.com`
- Password: `admin123`
- Check "Auto Confirm User"

Copy the new user's UUID (click the user to see it).

- [ ] **Step 2: Mark the user as a VenueHub admin**

In the SQL editor:
```sql
insert into admin_user (user_id, name)
values ('<paste-uuid-here>', 'Admin')
on conflict (user_id) do nothing;
```

Confirm the `admin_user` table now has one row.

---

## Phase I2: API contract (source of truth)

These are the two HTTP endpoints the frontend calls. Both the backend plan and the frontend plan must match these shapes exactly. If either side needs to change a contract, update this section first, then propagate.

### Contract 1: `POST /api/bookings`

Public endpoint. Anonymous. Submits a new booking request.

**Request headers:**
```
content-type: application/json
```

**Request body:**
```json
{
  "venueId": "uuid",
  "date": "YYYY-MM-DD",
  "timeSlotId": "uuid",
  "fullName": "string, 1-120 chars",
  "email": "string, valid email",
  "phone": "string, 6-30 chars",
  "eventType": "WEDDING | CORPORATE | BIRTHDAY | WORKSHOP | COMMUNITY | OTHER",
  "guestCount": "positive integer",
  "specialRequests": "string, optional, max 2000"
}
```

**Success response (201):**
```json
{
  "booking": {
    "id": "uuid",
    "reference_number": "VH-YYYYMMDD-NNN",
    "status": "PENDING"
  }
}
```

**Error responses:**
```json
{ "error": { "code": "STRING", "message": "Human-readable" } }
```

Error codes the backend must emit and the frontend must handle:
- `400 VENUE_NOT_FOUND` — venue id doesn't exist (actually 404 with this code; see below)
- `400 INVALID_TIME_SLOT` — slot doesn't belong to the venue
- `400 OVER_CAPACITY` — guest count > venue capacity
- `400 DATE_IN_PAST` — date is before today (server clock)
- `409 SLOT_TAKEN` — another non-rejected booking already holds this slot
- `400` with Zod validation errors for field-level issues (shape: `{ error: { code: 'VALIDATION', message, issues: [...] } }` — or whatever `@hono/zod-validator` emits; frontend should just show the message)

Note: `VENUE_NOT_FOUND` returns **404**, not 400. The bullet above is misleading — fix when implementing: not-found errors return 404, validation errors return 400, conflict errors return 409.

### Contract 2: `PATCH /api/admin/bookings/:id`

Admin-only. Approve or reject a pending booking.

**Request headers:**
```
content-type: application/json
authorization: Bearer <supabase access token>
```

**Request body:**
```json
{
  "status": "APPROVED | REJECTED",
  "adminNote": "string, optional, max 2000"
}
```

**Success response (200):**
```json
{
  "booking": { /* full booking row from Postgres */ }
}
```

**Error responses:**
- `401 UNAUTHENTICATED` — missing/invalid bearer token
- `403 NOT_ADMIN` — authenticated user is not in `admin_user`
- `404 NOT_FOUND` — booking id doesn't exist
- `409 NOT_PENDING` — booking is already APPROVED or REJECTED

### Cross-cutting

- **Error envelope is always** `{ "error": { "code": "...", "message": "..." } }`. Neither side should special-case other shapes.
- **Snake_case on the wire for DB-shaped objects** (`reference_number`, `full_name`) because the frontend reads the same columns directly from Supabase for the admin dashboard, and we don't want two naming conventions for the same entity. Request bodies use camelCase (`venueId`, `fullName`) because those are typed by hand into the form; the backend translates before insert.

No tasks here — this section is a reference that both downstream plans quote.

---

## Phase I3: End-to-end verification (runs AFTER backend + frontend plans)

These smoke tests exercise the full stack. They are the acceptance test for the MVP.

### Task I3.1: Anonymous booking end-to-end (happy path)

- [ ] **Step 1: Start both apps**

Two terminals:
```bash
cd apps/backend && npm run dev   # listens on :3000
```
```bash
cd apps/frontend && npm run dev  # listens on :5173
```

- [ ] **Step 2: Complete a booking via the UI**

1. Open `http://localhost:5173/`.
2. Click **Book Now** in the navbar.
3. Step 1: pick a future date (choose one not in the seed data — e.g. 30 days out).
4. Step 2: pick an available time slot.
5. Step 3: fill the form with any valid data; keep guest count ≤ 150.
6. Step 4: click **Submit Booking**.
7. Step 5 (Confirmation): screen should show a reference number of the form `VH-<today>-NNN` and a **Pending** badge.

- [ ] **Step 3: Verify in Supabase**

In the Supabase Table editor, open `booking`. Sort by `created_at` desc. The newest row should have the exact values you submitted and `status = 'PENDING'`.

- [ ] **Step 4: Re-submit the same slot and verify clash handling**

Repeat Step 2 with the same date + slot. The booking should fail with a visible error message. The network tab should show a `409 SLOT_TAKEN` response.

### Task I3.2: Backend validation errors surface in the UI

- [ ] **Step 1: Over-capacity**

Complete the booking flow, but in Step 3 type a guest count larger than 150 (e.g. 500). The client-side validation in `DetailsStep` should block submission with an inline error. Bypass by temporarily loosening the client check (or use curl):
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H 'content-type: application/json' \
  -d '{"venueId":"00000000-0000-0000-0000-000000000001","date":"2099-12-01","timeSlotId":"00000000-0000-0000-0000-000000000010","fullName":"X","email":"x@x.co","phone":"555-0000","eventType":"OTHER","guestCount":9999}'
```

Expected: `{"error":{"code":"OVER_CAPACITY", ...}}` with HTTP 400.

- [ ] **Step 2: Past date**

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H 'content-type: application/json' \
  -d '{"venueId":"00000000-0000-0000-0000-000000000001","date":"2020-01-01","timeSlotId":"00000000-0000-0000-0000-000000000010","fullName":"X","email":"x@x.co","phone":"555-0000","eventType":"OTHER","guestCount":10}'
```

Expected: `DATE_IN_PAST`.

### Task I3.3: Admin login + approve/reject end-to-end

- [ ] **Step 1: Sign in as admin**

1. Navigate to `http://localhost:5173/admin/login`.
2. Email `admin@venuehub.com`, password `admin123`.
3. Should redirect to `/admin`.

- [ ] **Step 2: Verify stats + list**

Dashboard should show 4 stat cards with non-zero counts (matching seed data + any bookings you've submitted during testing). The bookings table should list all rows sorted newest-first.

- [ ] **Step 3: Approve a pending booking**

1. Click a `PENDING` row (e.g. `VH-SEED-001` or a booking you submitted).
2. Modal opens with full details.
3. Type "Confirmed — see you there" in the admin note.
4. Click **Approve**.
5. Expect a success toast, the modal closes, the row's badge updates to **APPROVED**, and the stats row re-counts.

- [ ] **Step 4: Verify in Supabase**

Open `booking` in the Table editor. The row should have `status = 'APPROVED'` and `admin_note = 'Confirmed — see you there'`.

- [ ] **Step 5: Attempt to update an already-decided booking (negative test)**

Reopen the now-approved booking. The modal should be read-only (no Approve/Reject buttons). If you bypass by curl:
```bash
curl -X PATCH http://localhost:3000/api/admin/bookings/<approved-id> \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <token-from-devtools>' \
  -d '{"status":"REJECTED"}'
```
Expected: `409 NOT_PENDING`.

### Task I3.4: Unauthorized access negative tests

- [ ] **Step 1: Unauthenticated browser access to `/admin`**

In a fresh private window (no session), open `http://localhost:5173/admin`. Expected: redirect to `/admin/login`.

- [ ] **Step 2: Unauthenticated PATCH**

```bash
curl -X PATCH http://localhost:3000/api/admin/bookings/any-id \
  -H 'content-type: application/json' \
  -d '{"status":"APPROVED"}'
```
Expected: `401 UNAUTHENTICATED`.

- [ ] **Step 3: Authenticated but not admin**

Create a second user via Supabase Auth dashboard (any email). Do NOT add them to `admin_user`. Sign in as that user in the frontend:
1. From `/admin/login`, sign in with the non-admin credentials.
2. Frontend should redirect back to `/admin/login` (the `RequireAdmin` guard rejects non-admins).

Grab that user's access token from DevTools → Application → Local Storage → `sb-*-auth-token`, then:
```bash
curl -X PATCH http://localhost:3000/api/admin/bookings/any-id \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <non-admin-token>' \
  -d '{"status":"APPROVED"}'
```
Expected: `403 NOT_ADMIN`.

### Task I3.5: Build + test both apps

- [ ] **Step 1: Backend**

```bash
cd apps/backend
npm test
npm run build
```

Both must pass with zero errors.

- [ ] **Step 2: Frontend**

```bash
cd apps/frontend
npm test
npm run build
```

Both must pass. Inspect the build summary — admin chunks should be split from the main entry (if the frontend plan's Task 7.4 has been executed).

### Task I3.6: Responsive spot-check

- [ ] **Step 1: Mobile walkthrough**

Open DevTools, set viewport to 375px wide. Walk through:
- `/` — hero fills viewport, highlights stack, no horizontal scroll
- `/venue` — single-column layout, calendar/sidebar drops below content
- `/book` — stepper fits, all 5 steps work, review page is scrollable
- `/admin` — table scrolls horizontally OR reflows, sidebar collapses (shadcn Sheet or similar)

Note any breakage; file a task against the frontend plan if fixes are needed. Do not shrug off overflow issues.

---

## Done criteria for the integration plan

- Supabase project exists, schema applied, seed applied, admin user created.
- Both apps have working `.env` files.
- A booking submitted in the UI appears in Supabase with `status = 'PENDING'` and a correct reference number.
- The admin dashboard lists bookings and can approve/reject them, with changes visible in Supabase and in the UI.
- All four negative tests (clash, capacity, unauthenticated, non-admin) return the documented error codes.
- `npm test` and `npm run build` both succeed in each app.
- Mobile (375px) is usable end-to-end.
