import { useQuery } from '@tanstack/react-query';
import { MOCK_VENUE, MOCK_TIME_SLOTS, getUnavailableSlots } from '@/lib/mock-data';

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  pricing_info: { tiers?: { name: string; price: string }[] } | null;
}

export interface TimeSlot {
  id: string;
  venue_id: string;
  label: string;
  start_time: string;
  end_time: string;
}

async function fetchVenue(): Promise<Venue> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_VENUE as Venue;
}

async function fetchTimeSlots(venueId: string): Promise<TimeSlot[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_TIME_SLOTS.filter((s) => s.venue_id === venueId) as TimeSlot[];
}

async function fetchUnavailableSlots(venueId: string, date: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 150));
  return getUnavailableSlots(venueId, date);
}

export function useVenue() {
  return useQuery({ queryKey: ['venue'], queryFn: fetchVenue });
}

export function useTimeSlots(venueId?: string) {
  return useQuery({
    queryKey: ['timeSlots', venueId],
    queryFn: () => fetchTimeSlots(venueId!),
    enabled: !!venueId,
  });
}

export function useUnavailableSlots(venueId?: string, date?: string) {
  return useQuery({
    queryKey: ['unavailable', venueId, date],
    queryFn: () => fetchUnavailableSlots(venueId!, date!),
    enabled: !!venueId && !!date,
  });
}
