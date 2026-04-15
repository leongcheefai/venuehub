import { describe, it, expect } from 'vitest';
import { generateReferenceNumber } from './service.js';

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

import { createBooking } from './service.js';
import type { CreateBookingInput } from './schema.js';
import type { SupabaseClient } from '@supabase/supabase-js';

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
              return {
                gte: () => ({
                  lt: async () => ({ data: null, error: null, count: overrides.count ?? 0 }),
                }),
              };
            }
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
