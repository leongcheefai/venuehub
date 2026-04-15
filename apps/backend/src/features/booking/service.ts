import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../lib/errors.js';
import type { CreateBookingInput } from './schema.js';

export function generateReferenceNumber(submittedAt: Date, sequence: number): string {
  const yyyy = submittedAt.getUTCFullYear();
  const mm = String(submittedAt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(submittedAt.getUTCDate()).padStart(2, '0');
  const seq = String(sequence).padStart(3, '0');
  return `VH-${yyyy}${mm}${dd}-${seq}`;
}

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
