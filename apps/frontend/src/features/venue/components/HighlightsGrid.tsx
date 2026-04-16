import { Users, MapPin, Sparkles, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  capacity: number;
  amenitiesCount: number;
  address: string;
  pricingLabel: string;
}

export function HighlightsGrid({ capacity, amenitiesCount, address, pricingLabel }: Props) {
  const items = [
    { icon: Users, label: 'Capacity', value: `${capacity} guests` },
    { icon: Sparkles, label: 'Amenities', value: `${amenitiesCount} included` },
    { icon: MapPin, label: 'Location', value: address },
    { icon: DollarSign, label: 'Pricing', value: pricingLabel },
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label}>
          <CardContent className="p-6">
            <Icon className="h-5 w-5 text-accent" />
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
