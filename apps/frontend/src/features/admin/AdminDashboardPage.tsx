import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StatsRow } from './components/StatsRow';
import { FilterBar } from './components/FilterBar';
import { BookingsTable } from './components/BookingsTable';
import { BookingDetailModal } from './components/BookingDetailModal';
import {
  useAdminBookings, updateBookingStatus, type AdminBooking, type BookingStatus,
} from './api';

export function AdminDashboardPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const { data: bookings = [], isLoading } = useAdminBookings({ status, search });

  const onDecide = async (next: 'APPROVED' | 'REJECTED', note: string) => {
    if (!selected) return;
    try {
      await updateBookingStatus(selected.id, next, note || undefined);
      toast.success(`Booking ${next.toLowerCase()}`);
      await qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      await qc.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage incoming booking requests.</p>
      </div>
      <StatsRow />
      <FilterBar
        status={status} search={search}
        onChange={({ status, search }) => { setStatus(status); setSearch(search); }}
      />
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-muted-foreground">Loading…</div>
        ) : (
          <BookingsTable bookings={bookings} onRowClick={setSelected} />
        )}
      </div>
      <BookingDetailModal booking={selected} onClose={() => setSelected(null)} onDecide={onDecide} />
    </div>
  );
}
