import { useQuery } from '@tanstack/react-query';
import { MOCK_BOOKINGS, type BookingStatus, type MockBooking } from '@/lib/mock-data';

export type { BookingStatus } from '@/lib/mock-data';
export type AdminBooking = MockBooking;

export interface ListFilters {
  status?: BookingStatus | 'ALL';
  search?: string;
}

async function listBookings(filters: ListFilters = {}): Promise<AdminBooking[]> {
  await new Promise((r) => setTimeout(r, 200));
  let result = [...MOCK_BOOKINGS];
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((b) => b.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (b) => b.full_name.toLowerCase().includes(q) || b.reference_number.toLowerCase().includes(q),
    );
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function fetchStats(): Promise<Record<BookingStatus | 'TOTAL', number>> {
  await new Promise((r) => setTimeout(r, 100));
  const out: Record<string, number> = { TOTAL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const row of MOCK_BOOKINGS) {
    out.TOTAL++;
    out[row.status]++;
  }
  return out as Record<BookingStatus | 'TOTAL', number>;
}

export async function updateBookingStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  adminNote: string | undefined,
) {
  await new Promise((r) => setTimeout(r, 500));
  const booking = MOCK_BOOKINGS.find((b) => b.id === id);
  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') throw new Error('Booking already decided');
  booking.status = status;
  booking.admin_note = adminNote ?? null;
  return booking;
}

export function useAdminBookings(filters: ListFilters) {
  return useQuery({ queryKey: ['admin-bookings', filters], queryFn: () => listBookings(filters) });
}

export function useAdminStats() {
  return useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });
}
