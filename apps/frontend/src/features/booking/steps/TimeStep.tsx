import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVenue, useTimeSlots, useUnavailableSlots } from '@/features/venue/api';
import { useBooking } from '../BookingProvider';

export function TimeStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();
  const { data: slots, isLoading } = useTimeSlots(venue?.id);
  const { data: unavailable = [] } = useUnavailableSlots(venue?.id, state.date);

  if (isLoading || !slots) return <Skeleton className="h-40" />;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pick a time</h2>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO', step: 1 })}>
          Change date
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground">
        {state.date && <>Available slots for <strong>{state.date}</strong></>}
      </p>
      <div className="mt-6 grid gap-3">
        {slots.map((slot) => {
          const taken = unavailable.includes(slot.id);
          const selected = state.timeSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={taken}
              onClick={() => dispatch({
                type: 'SET_TIME_SLOT', timeSlotId: slot.id, timeSlotLabel: slot.label,
              })}
              aria-pressed={selected}
              className={`text-left p-4 rounded-lg border transition
                ${selected ? 'border-accent ring-2 ring-accent' : 'border-border'}
                ${taken ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent'}`}
            >
              <div className="font-medium">{slot.label}</div>
              <div className="text-sm text-muted-foreground">
                {slot.start_time} – {slot.end_time}{taken && ' · Unavailable'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
