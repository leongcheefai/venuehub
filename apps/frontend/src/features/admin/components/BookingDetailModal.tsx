import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AdminBooking } from '../api';
import { StatusBadge } from './StatusBadge';

interface Props {
  booking: AdminBooking | null;
  onClose: () => void;
  onDecide?: (status: 'APPROVED' | 'REJECTED', note: string) => Promise<void>;
}

export function BookingDetailModal({ booking, onClose, onDecide }: Props) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<'APPROVED' | 'REJECTED' | null>(null);
  if (!booking) return null;

  const readOnly = booking.status !== 'PENDING' || !onDecide;

  const decide = async (status: 'APPROVED' | 'REJECTED') => {
    if (!onDecide) return;
    setPending(status);
    try { await onDecide(status, note); onClose(); }
    finally { setPending(null); }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{booking.reference_number}</span>
            <StatusBadge status={booking.status} />
          </DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Name">{booking.full_name}</Field>
          <Field label="Email">{booking.email}</Field>
          <Field label="Phone">{booking.phone}</Field>
          <Field label="Event type">{booking.event_type}</Field>
          <Field label="Date">{booking.date}</Field>
          <Field label="Guests">{booking.guest_count}</Field>
        </dl>
        {booking.special_requests && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Special requests</div>
            <p className="text-sm">{booking.special_requests}</p>
          </div>
        )}
        {booking.admin_note && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Admin note</div>
            <p className="text-sm">{booking.admin_note}</p>
          </div>
        )}
        {!readOnly && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Admin note (optional)</div>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          {!readOnly ? (
            <>
              <Button variant="destructive" onClick={() => decide('REJECTED')} disabled={!!pending}>
                {pending === 'REJECTED' ? 'Rejecting…' : 'Reject'}
              </Button>
              <Button onClick={() => decide('APPROVED')} disabled={!!pending}>
                {pending === 'APPROVED' ? 'Approving…' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
