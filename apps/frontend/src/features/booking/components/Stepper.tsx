import { Check } from 'lucide-react';
import { useBooking } from '../BookingProvider';

const labels = ['Date', 'Time', 'Details', 'Review', 'Done'];

export function Stepper() {
  const { state } = useBooking();
  return (
    <ol className="flex items-center gap-2 text-xs">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = state.step === n;
        const done = state.step > n;
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full grid place-items-center border
              ${done ? 'bg-accent text-accent-foreground border-accent' : ''}
              ${active ? 'border-accent text-accent' : ''}
              ${!active && !done ? 'border-border text-muted-foreground' : ''}`}>
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={active ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
            {i < labels.length - 1 && <span className="w-6 h-px bg-border mx-1" />}
          </li>
        );
      })}
    </ol>
  );
}
