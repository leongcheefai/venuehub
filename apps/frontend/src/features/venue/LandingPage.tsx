import { useVenue } from './api';
import { HeroSection } from './components/HeroSection';
import { HighlightsGrid } from './components/HighlightsGrid';
import { PhotoGallery } from './components/PhotoGallery';
import { Skeleton } from '@/components/ui/skeleton';

export function LandingPage() {
  const { data: venue, isLoading, error } = useVenue();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (error || !venue) {
    return <div className="p-8 text-red-600">Failed to load venue.</div>;
  }

  const pricingLabel = venue.pricing_info?.tiers?.[0]?.price
    ? `from ${venue.pricing_info.tiers[0].price}`
    : 'On request';

  return (
    <>
      <HeroSection name={venue.name} imageUrl={venue.images[0]} />
      <HighlightsGrid
        capacity={venue.capacity}
        amenitiesCount={venue.amenities.length}
        address={venue.address}
        pricingLabel={pricingLabel}
      />
      <PhotoGallery images={venue.images} />
    </>
  );
}
