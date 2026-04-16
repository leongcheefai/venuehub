import { Users, MapPin, Sparkles, DollarSign } from 'lucide-react';

interface Props {
  capacity: number;
  amenitiesCount: number;
  address: string;
  pricingLabel: string;
}

export function HighlightsGrid({ capacity, amenitiesCount, address, pricingLabel }: Props) {
  const items = [
    { icon: Users, label: 'Capacity', value: `${capacity} guests`, accent: false },
    { icon: Sparkles, label: 'Amenities', value: `${amenitiesCount} included`, accent: false },
    { icon: MapPin, label: 'Location', value: address, accent: false },
    { icon: DollarSign, label: 'Starting at', value: pricingLabel, accent: true },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-14 animate-fade-up">
        <h2 className="font-serif text-2xl md:text-3xl">At a glance</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Asymmetric stat layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 md:gap-x-10 gap-y-12">
        {items.map(({ icon: Icon, label, value, accent }, i) => (
          <div
            key={label}
            className={`animate-fade-up delay-${(i + 2) * 100} group`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-4 w-4 ${accent ? 'text-accent' : 'text-warm-gold'}`} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {label}
              </span>
            </div>
            <div className={`font-serif text-xl md:text-2xl ${accent ? 'text-accent' : ''}`}>
              {value}
            </div>
            <div className="mt-3 h-px bg-border group-hover:bg-warm-gold transition-colors duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
}
