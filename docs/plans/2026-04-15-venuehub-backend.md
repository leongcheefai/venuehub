# VenueHub Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hono + Node backend that owns the two HTTP endpoints requiring server-side business rules: `POST /api/bookings` (create with validation, reference number, availability) and `PATCH /api/admin/bookings/:id` (approve/reject, admin-gated). Everything else is served directly from Supabase under RLS.

**Architecture:** Hono on Node via `@hono/node-server`, TypeScript ESM, organized by feature (`src/features/booking`, `src/features/admin`). Business logic lives in a testable service layer; routes are thin wrappers that validate input with Zod and delegate. Admin routes are protected by a middleware that verifies a Supabase access token and checks `admin_user` membership. No ORM — we talk to Supabase with the `@supabase/supabase-js` service-role client.

**Tech Stack:** Hono, Node, TypeScript (ESM), `@hono/node-server`, `@hono/zod-validator`, Zod, `@supabase/supabase-js` (service role), Vitest.

**Prerequisites:**
- Phase I1 of [2026-04-15-venuehub-integration.md](2026-04-15-venuehub-integration.md) complete — Supabase project exists, migrations + seed applied, `apps/backend/.env` filled in, admin user created.
- `apps/backend` scaffolded with Hono, TypeScript, `@supabase/supabase-js`, and `apps/backend/src/lib/supabase.ts` already exporting a service-role client.

**API contract source of truth:** [2026-04-15-venuehub-integration.md § Phase I2](2026-04-15-venuehub-integration.md#phase-i2-api-contract-source-of-truth). If anything in this plan contradicts the contract, the contract wins — fix the plan.

---

## File Structure

```
apps/backend/src/
  index.ts                        # app bootstrap + route mounting
  lib/
    supabase.ts                   # [exists] service-role client
    env.ts                        # typed process.env access
    errors.ts                     # HttpError + app.onError handler
  middleware/
    requireAdmin.ts               # verifies Supabase JWT + admin_user membership
  features/
    booking/
      schema.ts                   # Zod schema for POST body
      service.ts                  # generateReferenceNumber, createBooking
      service.test.ts             # unit tests for pure + DB-shaped logic
      routes.ts                   # POST /api/bookings
    admin/
      routes.ts                   # PATCH /api/admin/bookings/:id
```

---

## Phase B0: Foundation

### Task B0.1: Env validation

**Files:**
- Create: `apps/backend/src/lib/env.ts`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Install zod, @hono/zod-validator, dotenv**

```bash
cd apps/backend
npm install zod @hono/zod-validator
npm install -D dotenv
```

- [ ] **Step 2: Create env.ts**

```typescript
// apps/backend/src/lib/env.ts
import { z } from 'zod';

const schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): typed env validation"
```

### Task B0.2: Error handler

**Files:**
- Create: `apps/backend/src/lib/errors.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/backend/src/lib/errors.ts
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HttpError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.status as ContentfulStatusCode,
    );
  }
  console.error('[unhandled]', err);
  return c.json({ error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/lib/errors.ts
git commit -m "feat(backend): HttpError + global error handler"
```

### Task B0.3: Bootstrap with CORS, env, error handler, /health

**Files:**
- Modify: `apps/backend/src/index.ts`

- [ ] **Step 1: Replace index.ts**

```typescript
// apps/backend/src/index.ts
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './lib/env.js';
import { errorHandler } from './lib/errors.js';

const app = new Hono();

app.use('*', cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.onError(errorHandler);

app.get('/health', (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`backend listening on http://localhost:${info.port}`);
});
```

- [ ] **Step 2: Run dev, hit /health**

```bash
npm run dev
```

In another terminal:
```bash
curl http://localhost:3000/health
```
Expected: `{"ok":true}`

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/index.ts
git commit -m "feat(backend): bootstrap with cors, env, error handler, /health"
```

### Task B0.4: Vitest setup

**Files:**
- Modify: `apps/backend/package.json`
- Create: `apps/backend/vitest.config.ts`

- [ ] **Step 1: Install**

```bash
cd apps/backend
npm install -D vitest
```

- [ ] **Step 2: Config**

```typescript
// apps/backend/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add scripts**

Add to `apps/backend/package.json` `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Smoke test**

```typescript
// apps/backend/src/lib/smoke.test.ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2); }); });
```

- [ ] **Step 5: Run, confirm, delete, commit**

```bash
npm test
rm src/lib/smoke.test.ts
git add .
git commit -m "chore(backend): vitest setup"
```

---

## Phase B1: Booking submission endpoint (TDD)

The single most load-bearing piece of logic. Pure helpers first, then DB-touching service with mocked Supabase, then the route handler, then a manual end-to-end curl.

### Task B1.1: Zod schema for POST body

**Files:**
- Create: `apps/backend/src/features/booking/schema.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/backend/src/features/booking/schema.ts
import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'WEDDING', 'CORPORATE', 'BIRTHDAY', 'WORKSHOP', 'COMMUNITY', 'OTHER',
]);

export const createBookingSchema = z.object({
  venueId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlotId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().trim().min(6).max(30),
  eventType: eventTypeEnum,
  guestCount: z.number().int().positive().max(10_000),
  specialRequests: z.string().max(2000).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/features/booking/schema.ts
git commit -m "feat(backend): booking schema"
```

### Task B1.2: `generateReferenceNumber` (TDD)

**Files:**
- Create: `apps/backend/src/features/booking/service.test.ts`
- Create: `apps/backend/src/features/booking/service.ts`

- [ ] **Step 1: Failing test**

```typescript
// apps/backend/src/features/booking/service.test.ts
import { describe, it, expect } from 'vitest';
import { generateReferenceNumber } from './service';

describe('generateReferenceNumber', () => {
  it('formats as VH-YYYYMMDD-NNN', () => {
    expect(generateReferenceNumber(new Date('2026-04-15T10:00:00Z'), 1))
      .toBe('VH-20260415-001');
  });

  it('zero-pads sequence to 3 digits', () => {
    expect(generateReferenceNumber(new Date('2026-01-01T00:00:00Z'), 42))
      .toBe('VH-20260101-042');
  });

  it('does not truncate sequences over 999', () => {
    expect(generateReferenceNumber(new Date('2026-01-01T00:00:00Z'), 1234))
      .toBe('VH-20260101-1234');
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test
```

Expected: module not found.

- [ ] **Step 3: Minimal implementation**

```typescript
// apps/backend/src/features/booking/service.ts
export function generateReferenceNumber(submittedAt: Date, sequence: number): string {
  const yyyy = submittedAt.getUTCFullYear();
  const mm = String(submittedAt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(submittedAt.getUTCDate()).padStart(2, '0');
  const seq = String(sequence).padStart(3, '0');
  return `VH-${yyyy}${mm}${dd}-${seq}`;
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(backend): reference number generator"
```

### Task B1.3: `createBooking` service (TDD)

**Files:**
- Modify: `apps/backend/src/features/booking/service.ts`
- Modify: `apps/backend/src/features/booking/service.test.ts`

The service must:
1. Fetch the venue → 404 `VENUE_NOT_FOUND` if missing.
2. Check `guestCount <= venue.capacity` → 400 `OVER_CAPACITY`.
3. Fetch the time slot → ensure `slot.venue_id === venueId` → 400 `INVALID_TIME_SLOT`.
4. Check `date >= today` (UTC) → 400 `DATE_IN_PAST`.
5. Query `booking` for any non-rejected row matching `(venue_id, date, time_slot_id)` → 409 `SLOT_TAKEN`.
6. Count bookings created today to compute the next sequence for the reference number.
7. Insert the booking with generated `reference_number` and `status = 'PENDING'`.
8. Handle Postgres unique violation (`23505`) on the `(venue_id, date, time_slot_id)` constraint → 409 `SLOT_TAKEN` (race condition safety net).
9. Return the inserted row (id, reference_number, status).

- [ ] **Step 1: Implement `createBooking`**

Append to `apps/backend/src/features/booking/service.ts`:

```typescript
// apps/backend/src/features/booking/service.ts (append)
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../lib/errors.js';
import type { CreateBookingInput } from './schema.js';

export interface BookingRecord {
  id: string;
  reference_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function createBooking(
  db: SupabaseClient,
  input: CreateBookingInput,
  now: Date = new Date(),
): Promise<BookingRecord> {
  // 1. Venue lookup
  const { data: venue, error: venueErr } = await db
    .from('venue').select('id, capacity').eq('id', input.venueId).maybeSingle();
  if (venueErr) throw new HttpError(500, 'DB_ERROR', venueErr.message);
  if (!venue) throw new HttpError(404, 'VENUE_NOT_FOUND', 'Venue not found');

  // 2. Capacity
  if (input.guestCount > venue.capacity) {
    throw new HttpError(400, 'OVER_CAPACITY',
      `Guest count exceeds venue capacity of ${venue.capacity}`);
  }

  // 3. Time slot must belong to this venue
  const { data: slot, error: slotErr } = await db
    .from('time_slot').select('id, venue_id').eq('id', input.timeSlotId).maybeSingle();
  if (slotErr) throw new HttpError(500, 'DB_ERROR', slotErr.message);
  if (!slot || slot.venue_id !== input.venueId) {
    throw new HttpError(400, 'INVALID_TIME_SLOT', 'Time slot does not belong to this venue');
  }

  // 4. Date >= today (UTC)
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const reqDate = new Date(`${input.date}T00:00:00Z`);
  if (reqDate < today) {
    throw new HttpError(400, 'DATE_IN_PAST', 'Booking date must be today or later');
  }

  // 5. Availability pre-check
  const { data: clashes, error: clashErr } = await db
    .from('booking')
    .select('id')
    .eq('venue_id', input.venueId)
    .eq('date', input.date)
    .eq('time_slot_id', input.timeSlotId)
    .neq('status', 'REJECTED');
  if (clashErr) throw new HttpError(500, 'DB_ERROR', clashErr.message);
  if (clashes && clashes.length > 0) {
    throw new HttpError(409, 'SLOT_TAKEN', 'That time slot is already booked for this date');
  }

  // 6. Compute reference number from today's count
  const todayStr = now.toISOString().slice(0, 10);
  const { count, error: countErr } = await db
    .from('booking')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${todayStr}T00:00:00Z`)
    .lt('created_at', `${todayStr}T23:59:59.999Z`);
  if (countErr) throw new HttpError(500, 'DB_ERROR', countErr.message);
  const reference_number = generateReferenceNumber(now, (count ?? 0) + 1);

  // 7. Insert
  const { data: inserted, error: insertErr } = await db
    .from('booking')
    .insert({
      reference_number,
      venue_id: input.venueId,
      date: input.date,
      time_slot_id: input.timeSlotId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      event_type: input.eventType,
      guest_count: input.guestCount,
      special_requests: input.specialRequests ?? null,
      status: 'PENDING',
    })
    .select('id, reference_number, status')
    .single();

  if (insertErr) {
    // 8. Race: the unique (venue_id, date, time_slot_id) constraint fired
    if (insertErr.code === '23505') {
      throw new HttpError(409, 'SLOT_TAKEN', 'That time slot was just booked');
    }
    throw new HttpError(500, 'DB_ERROR', insertErr.message);
  }

  return inserted as BookingRecord;
}
```

- [ ] **Step 2: Add tests with a lightweight Supabase stub**

Append to `apps/backend/src/features/booking/service.test.ts`:

```typescript
// apps/backend/src/features/booking/service.test.ts (append)
import { createBooking } from './service';
import type { CreateBookingInput } from './schema';
import type { SupabaseClient } from '@supabase/supabase-js';

// Each test builds a purpose-built stub instead of a generic mock. This is more
// code but far easier to debug than a chainable mock matrix.

const baseInput: CreateBookingInput = {
  venueId: '00000000-0000-0000-0000-000000000001',
  date: '2099-01-01',
  timeSlotId: '00000000-0000-0000-0000-000000000010',
  fullName: 'Test',
  email: 'a@b.co',
  phone: '555-0000',
  eventType: 'WEDDING',
  guestCount: 50,
};

function stub(overrides: {
  venue?: unknown;
  slot?: unknown;
  clashes?: unknown[];
  count?: number;
  insert?: unknown;
  insertError?: { code?: string; message: string };
}): SupabaseClient {
  return {
    from: (table: string) => {
      if (table === 'venue') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: overrides.venue ?? null, error: null }),
            }),
          }),
        };
      }
      if (table === 'time_slot') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: overrides.slot ?? null, error: null }),
            }),
          }),
        };
      }
      if (table === 'booking') {
        return {
          select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              // count query
              return {
                gte: () => ({
                  lt: async () => ({ data: null, error: null, count: overrides.count ?? 0 }),
                }),
              };
            }
            // clash query
            return {
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    neq: async () => ({ data: overrides.clashes ?? [], error: null }),
                  }),
                }),
              }),
            };
          },
          insert: () => ({
            select: () => ({
              single: async () =>
                overrides.insertError
                  ? { data: null, error: overrides.insertError }
                  : {
                      data: overrides.insert ?? {
                        id: 'new',
                        reference_number: 'VH-20260415-001',
                        status: 'PENDING',
                      },
                      error: null,
                    },
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
}

describe('createBooking', () => {
  const now = new Date('2026-04-15T10:00:00Z');

  it('404s when venue is missing', async () => {
    const db = stub({ venue: null });
    await expect(createBooking(db, baseInput, now))
      .rejects.toMatchObject({ code: 'VENUE_NOT_FOUND', status: 404 });
  });

  it('400s when guest count exceeds capacity', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 10 },
      slot: { id: baseInput.timeSlotId, venue_id: baseInput.venueId },
    });
    await expect(createBooking(db, baseInput, now))
      .rejects.toMatchObject({ code: 'OVER_CAPACITY', status: 400 });
  });

  it('400s when time slot belongs to another venue', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 100 },
      slot: { id: baseInput.timeSlotId, venue_id: 'other' },
    });
    await expect(createBooking(db, baseInput, now))
      .rejects.toMatchObject({ code: 'INVALID_TIME_SLOT' });
  });

  it('400s when date is in the past', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 100 },
      slot: { id: baseInput.timeSlotId, venue_id: baseInput.venueId },
    });
    await expect(createBooking(db, { ...baseInput, date: '2020-01-01' }, now))
      .rejects.toMatchObject({ code: 'DATE_IN_PAST' });
  });

  it('409s when an existing non-rejected booking clashes', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 100 },
      slot: { id: baseInput.timeSlotId, venue_id: baseInput.venueId },
      clashes: [{ id: 'existing' }],
    });
    await expect(createBooking(db, baseInput, now))
      .rejects.toMatchObject({ code: 'SLOT_TAKEN', status: 409 });
  });

  it('409s on Postgres 23505 unique violation (race)', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 100 },
      slot: { id: baseInput.timeSlotId, venue_id: baseInput.venueId },
      clashes: [],
      count: 0,
      insertError: { code: '23505', message: 'duplicate key' },
    });
    await expect(createBooking(db, baseInput, now))
      .rejects.toMatchObject({ code: 'SLOT_TAKEN', status: 409 });
  });

  it('returns the inserted row on happy path', async () => {
    const db = stub({
      venue: { id: baseInput.venueId, capacity: 100 },
      slot: { id: baseInput.timeSlotId, venue_id: baseInput.venueId },
      clashes: [],
      count: 0,
      insert: { id: 'new', reference_number: 'VH-20260415-001', status: 'PENDING' },
    });
    const result = await createBooking(db, baseInput, now);
    expect(result.reference_number).toBe('VH-20260415-001');
    expect(result.status).toBe('PENDING');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: `generateReferenceNumber` (3) + `createBooking` (7) = 10 passing.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(backend): createBooking service with business rules"
```

### Task B1.4: POST /api/bookings route

**Files:**
- Create: `apps/backend/src/features/booking/routes.ts`
- Modify: `apps/backend/src/index.ts`

- [ ] **Step 1: Route**

```typescript
// apps/backend/src/features/booking/routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { supabaseAdmin } from '../../lib/supabase.js';
import { createBookingSchema } from './schema.js';
import { createBooking } from './service.js';

export const bookingRoutes = new Hono();

bookingRoutes.post('/', zValidator('json', createBookingSchema), async (c) => {
  const input = c.req.valid('json');
  const booking = await createBooking(supabaseAdmin, input);
  return c.json({ booking }, 201);
});
```

- [ ] **Step 2: Mount in index.ts**

Add to `apps/backend/src/index.ts`:

```typescript
import { bookingRoutes } from './features/booking/routes.js';

// After app.get('/health', ...)
app.route('/api/bookings', bookingRoutes);
```

- [ ] **Step 3: Manual end-to-end test (requires Supabase env)**

Start the server:
```bash
npm run dev
```

Submit a valid booking:
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H 'content-type: application/json' \
  -d '{
    "venueId": "00000000-0000-0000-0000-000000000001",
    "date": "2099-06-01",
    "timeSlotId": "00000000-0000-0000-0000-000000000010",
    "fullName": "Test Person",
    "email": "t@example.com",
    "phone": "555-1212",
    "eventType": "CORPORATE",
    "guestCount": 25
  }'
```

Expected: HTTP 201 with `{"booking":{"id":"...","reference_number":"VH-<today>-001","status":"PENDING"}}`.

Re-run the same curl:
Expected: HTTP 409 `SLOT_TAKEN`.

Capacity failure:
```bash
curl -i -X POST http://localhost:3000/api/bookings \
  -H 'content-type: application/json' \
  -d '{"venueId":"00000000-0000-0000-0000-000000000001","date":"2099-07-01","timeSlotId":"00000000-0000-0000-0000-000000000010","fullName":"X","email":"x@x.co","phone":"555-0000","eventType":"OTHER","guestCount":9999}'
```
Expected: HTTP 400 `OVER_CAPACITY`.

- [ ] **Step 4: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): POST /api/bookings"
```

---

## Phase B2: Admin endpoint

### Task B2.1: `requireAdmin` middleware

**Files:**
- Create: `apps/backend/src/middleware/requireAdmin.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/backend/src/middleware/requireAdmin.ts
import type { MiddlewareHandler } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env.js';
import { HttpError } from '../lib/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';

// Uses a short-lived client configured with the end-user's access token so
// auth.getUser() validates the JWT against Supabase Auth, then re-uses the
// service-role client to check admin_user membership.
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token');

  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Invalid token');
  }

  const { data: adminRow, error: adminErr } = await supabaseAdmin
    .from('admin_user')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (adminErr) throw new HttpError(500, 'DB_ERROR', adminErr.message);
  if (!adminRow) throw new HttpError(403, 'NOT_ADMIN', 'Admin access required');

  c.set('userId', userData.user.id);
  await next();
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/middleware/requireAdmin.ts
git commit -m "feat(backend): requireAdmin middleware"
```

### Task B2.2: PATCH /api/admin/bookings/:id

**Files:**
- Create: `apps/backend/src/features/admin/routes.ts`
- Modify: `apps/backend/src/index.ts`

- [ ] **Step 1: Routes**

```typescript
// apps/backend/src/features/admin/routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { HttpError } from '../../lib/errors.js';

export const adminRoutes = new Hono();

adminRoutes.use('*', requireAdmin);

const patchSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().max(2000).optional(),
});

adminRoutes.patch('/bookings/:id', zValidator('json', patchSchema), async (c) => {
  const id = c.req.param('id');
  const { status, adminNote } = c.req.valid('json');

  const { data: existing, error: getErr } = await supabaseAdmin
    .from('booking').select('id, status').eq('id', id).maybeSingle();
  if (getErr) throw new HttpError(500, 'DB_ERROR', getErr.message);
  if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Booking not found');
  if (existing.status !== 'PENDING') {
    throw new HttpError(409, 'NOT_PENDING', 'Only pending bookings can be updated');
  }

  const { data: updated, error: updErr } = await supabaseAdmin
    .from('booking')
    .update({
      status,
      admin_note: adminNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updErr) throw new HttpError(500, 'DB_ERROR', updErr.message);

  return c.json({ booking: updated });
});
```

- [ ] **Step 2: Mount**

Add to `apps/backend/src/index.ts`:
```typescript
import { adminRoutes } from './features/admin/routes.js';

app.route('/api/admin', adminRoutes);
```

- [ ] **Step 3: Manual curl test**

Grab a Supabase access token for the seed admin. Easiest way: sign in via the frontend (once it exists) and copy the access_token from DevTools → Application → Local Storage → the `sb-*-auth-token` entry. Or temporarily run:

```bash
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  -d '{"email":"admin@venuehub.com","password":"admin123"}'
```
(Replace `$SUPABASE_URL` and `$SUPABASE_ANON_KEY`. Copy the returned `access_token`.)

Then get a pending booking id from the seed data (e.g. from the Supabase Table editor — pick one with status PENDING) and run:

```bash
curl -X PATCH http://localhost:3000/api/admin/bookings/<pending-id> \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <access-token>' \
  -d '{"status":"APPROVED","adminNote":"Looks good"}'
```

Expected: 200 with the updated row. Re-running on the same id: 409 `NOT_PENDING`. Calling without the bearer header: 401.

- [ ] **Step 4: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): PATCH /api/admin/bookings/:id"
```

---

## Phase B3: Build + handoff

### Task B3.1: Build cleanly

- [ ] **Step 1: Typecheck + build**

```bash
cd apps/backend
npm run build
```

Expected: `dist/` produced with no errors.

- [ ] **Step 2: Run tests one more time**

```bash
npm test
```

Expected: all 10 tests pass.

- [ ] **Step 3: Commit any build fixes**

If nothing changed, skip. Otherwise:
```bash
git add .
git commit -m "fix(backend): build cleanup"
```

---

## Done criteria for the backend plan

- `GET /health` returns `{"ok": true}`.
- `POST /api/bookings` with a valid body returns 201 and a reference number in the `VH-YYYYMMDD-NNN` format.
- Each documented error case (`VENUE_NOT_FOUND`, `INVALID_TIME_SLOT`, `OVER_CAPACITY`, `DATE_IN_PAST`, `SLOT_TAKEN`) returns the right status + error code.
- `PATCH /api/admin/bookings/:id` requires a valid Supabase JWT from a user in `admin_user`; all four negative paths (no token, invalid token, non-admin, already-decided) return the documented error codes.
- `npm test` passes (10 tests).
- `npm run build` produces a clean `dist/`.

## Not in this plan (owned elsewhere)

- Supabase project, schema, seed data, admin user creation — [integration plan Phase I1](2026-04-15-venuehub-integration.md#phase-i1-prerequisites-manual-setup).
- Frontend UI for anything — [frontend plan](2026-04-15-venuehub-frontend.md).
- Public reads for venue / time slots / availability / admin booking list — frontend queries Supabase directly under RLS; no backend endpoint needed.
- Email notifications — explicitly out of scope for MVP.
