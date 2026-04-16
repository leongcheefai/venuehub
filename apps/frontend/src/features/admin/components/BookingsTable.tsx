import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import type { AdminBooking } from '../api';

interface Props {
  bookings: AdminBooking[];
  onRowClick: (b: AdminBooking) => void;
}

export function BookingsTable({ bookings, onRowClick }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Event date</TableHead>
          <TableHead>Event type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id} className="cursor-pointer" onClick={() => onRowClick(b)}>
            <TableCell className="font-mono text-xs">{b.reference_number}</TableCell>
            <TableCell>{b.full_name}</TableCell>
            <TableCell>{b.date}</TableCell>
            <TableCell>{b.event_type}</TableCell>
            <TableCell><StatusBadge status={b.status} /></TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(b.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
        {bookings.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
              No bookings
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
