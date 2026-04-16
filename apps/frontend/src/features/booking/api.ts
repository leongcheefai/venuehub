import { MOCK_BOOKINGS, generateReferenceNumber, type MockBooking } from '@/lib/mock-data';
import type { DetailsValues } from './schema';

export interface SubmitBookingInput extends DetailsValues {
  venueId: string;
  date: string;
  timeSlotId: string;
}

export interface SubmittedBooking {
  id: string;
  reference_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function submitBooking(input: SubmitBookingInput): Promise<SubmittedBooking> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  const refNumber = generateReferenceNumber();
  const newBooking: MockBooking = {
    id: `bk-${Date.now()}`,
    reference_number: refNumber,
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
    admin_note: null,
    created_at: new Date().toISOString(),
  };

  MOCK_BOOKINGS.unshift(newBooking);

  return {
    id: newBooking.id,
    reference_number: newBooking.reference_number,
    status: newBooking.status,
  };
}
