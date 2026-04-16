import { useVenue } from './api';
import { AmenitiesList } from './components/AmenitiesList';
import { AvailabilitySidebar } from './components/AvailabilitySidebar';
import { PhotoGallery } from './components/PhotoGallery';
import { Skeleton } from '@/components/ui/skeleton';

export function VenueDetailsPage() {
  const { data: venue, isLoading } = useVenue();
  if (isLoading || !venue) return <Skeleton className="h-96" />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{venue.name}</h1>
      <p className="mt-2 text-muted-foreground">{venue.address}</p>
      <div className="mt-10 grid md:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{venue.description}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Amenities</h2>
            <div className="mt-4"><AmenitiesList amenities={venue.amenities} /></div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Capacity</h2>
            <p className="mt-3">Up to <strong>{venue.capacity}</strong> guests</p>
          </section>
          {venue.pricing_info?.tiers && (
            <section>
              <h2 className="text-2xl font-semibold">Pricing</h2>
              <ul className="mt-4 divide-y border rounded-lg overflow-hidden">
                {venue.pricing_info.tiers.map((t) => (
                  <li key={t.name} className="flex justify-between p-4">
                    <span>{t.name}</span>
                    <strong>{t.price}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <AvailabilitySidebar />
      </div>
      <PhotoGallery images={venue.images} />
    </div>
  );
}
