import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBooking } from '../BookingProvider';

export function DateStep() {
  const { state, dispatch } = useBooking();
  const selected = state.date ? new Date(`${state.date}T00:00:00`) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section>
      <h2 className="text-2xl font-semibold">Pick a date</h2>
      <p className="mt-2 text-muted-foreground">Choose the day of your event.</p>
      <div className="mt-6 border rounded-lg p-4 inline-block">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && dispatch({ type: 'SET_DATE', date: format(d, 'yyyy-MM-dd') })}
          disabled={{ before: today }}
        />
      </div>
    </section>
  );
}
