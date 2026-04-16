import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBooking } from '../BookingProvider';
import { useVenue } from '@/features/venue/api';
import { eventTypeLabels } from '../schema';
import { submitBooking } from '../api';

export function ReviewStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { date, timeSlotLabel, details, timeSlotId } = state;
  if (!date || !timeSlotLabel || !details || !venue || !timeSlotId) {
    return <div>Missing information — please go back.</div>;
  }

  const rows = [
    { label: 'Venue',      value: venue.name,                         step: null },
    { label: 'Date',       value: date,                               step: 1 as const },
    { label: 'Time',       value: timeSlotLabel,                      step: 2 as const },
    { label: 'Event type', value: eventTypeLabels[details.eventType], step: 3 as const },
    { label: 'Guests',     value: String(details.guestCount),         step: 3 as const },
    { label: 'Name',       value: details.fullName,                   step: 3 as const },
    { label: 'Email',      value: details.email,                      step: 3 as const },
    { label: 'Phone',      value: details.phone,                      step: 3 as const },
  ];

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const booking = await submitBooking({
        venueId: venue.id, date, timeSlotId, ...details,
      });
      dispatch({ type: 'CONFIRM', referenceNumber: booking.reference_number });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold">Review your booking</h2>
      <p className="mt-2 text-muted-foreground">Check everything and submit your request.</p>
      <dl className="mt-6 divide-y border rounded-lg overflow-hidden">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between p-4">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="flex items-center gap-3">
              <span className="font-medium">{r.value}</span>
              {r.step && (
                <Button variant="ghost" size="sm"
                  onClick={() => dispatch({ type: 'GO_TO', step: r.step })}>
                  Edit
                </Button>
              )}
            </dd>
          </div>
        ))}
        {details.specialRequests && (
          <div className="p-4">
            <dt className="text-sm text-muted-foreground">Special requests</dt>
            <dd className="mt-1">{details.specialRequests}</dd>
          </div>
        )}
      </dl>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <Button className="mt-6" size="lg" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Booking'}
      </Button>
    </section>
  );
}
