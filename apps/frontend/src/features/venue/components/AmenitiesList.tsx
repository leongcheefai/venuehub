import { Check } from 'lucide-react';

export function AmenitiesList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-3 text-sm">
          <span className="inline-grid place-items-center h-8 w-8 rounded-full bg-accent/10 text-accent">
            <Check className="h-4 w-4" />
          </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
