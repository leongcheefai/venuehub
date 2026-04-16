// Mock data for development without Supabase

export const MOCK_VENUE = {
  id: 'venue-001',
  name: 'The Grand Hall',
  description:
    'An elegant multi-purpose event space nestled in the heart of the city. The Grand Hall features soaring ceilings, natural lighting, and a versatile floor plan that adapts to weddings, corporate events, workshops, and community gatherings. With state-of-the-art sound and lighting, a fully equipped catering kitchen, and on-site parking, your event is set for success.',
  address: '42 Heritage Lane, Downtown District',
  capacity: 200,
  amenities: [
    'Sound System',
    'Projector & Screen',
    'Wi-Fi',
    'Air Conditioning',
    'Catering Kitchen',
    'On-site Parking',
    'Wheelchair Accessible',
    'Bridal Suite',
    'Stage & Podium',
    'Tables & Chairs (200 pax)',
  ],
  images: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80',
  ],
  pricing_info: {
    tiers: [
      { name: 'Morning (8 AM – 12 PM)', price: 'RM 1,500' },
      { name: 'Afternoon (1 PM – 5 PM)', price: 'RM 1,800' },
      { name: 'Evening (6 PM – 11 PM)', price: 'RM 2,500' },
      { name: 'Full Day (8 AM – 11 PM)', price: 'RM 4,500' },
    ],
  },
};

export const MOCK_TIME_SLOTS = [
  { id: 'ts-001', venue_id: 'venue-001', label: 'Morning', start_time: '08:00', end_time: '12:00' },
  { id: 'ts-002', venue_id: 'venue-001', label: 'Afternoon', start_time: '13:00', end_time: '17:00' },
  { id: 'ts-003', venue_id: 'venue-001', label: 'Evening', start_time: '18:00', end_time: '23:00' },
  { id: 'ts-004', venue_id: 'venue-001', label: 'Full Day', start_time: '08:00', end_time: '23:00' },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MockBooking {
  id: string;
  reference_number: string;
  venue_id: string;
  date: string;
  time_slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  guest_count: number;
  special_requests: string | null;
  status: BookingStatus;
  admin_note: string | null;
  created_at: string;
}

let nextRefSeq = 6;

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: 'bk-001', reference_number: 'VH-20260415-001', venue_id: 'venue-001',
    date: fmt(addDays(today, 7)), time_slot_id: 'ts-001',
    full_name: 'Alice Wong', email: 'alice@example.com', phone: '+60123456789',
    event_type: 'WEDDING', guest_count: 150, special_requests: 'Floral arrangement for the stage',
    status: 'APPROVED', admin_note: 'Confirmed with caterer', created_at: addDays(today, -5).toISOString(),
  },
  {
    id: 'bk-002', reference_number: 'VH-20260415-002', venue_id: 'venue-001',
    date: fmt(addDays(today, 7)), time_slot_id: 'ts-003',
    full_name: 'Bob Tan', email: 'bob@corp.com', phone: '+60198765432',
    event_type: 'CORPORATE', guest_count: 80, special_requests: null,
    status: 'PENDING', admin_note: null, created_at: addDays(today, -3).toISOString(),
  },
  {
    id: 'bk-003', reference_number: 'VH-20260415-003', venue_id: 'venue-001',
    date: fmt(addDays(today, 14)), time_slot_id: 'ts-002',
    full_name: 'Carol Lim', email: 'carol@birthday.com', phone: '+60176543210',
    event_type: 'BIRTHDAY', guest_count: 50, special_requests: 'Need balloon decorations',
    status: 'PENDING', admin_note: null, created_at: addDays(today, -2).toISOString(),
  },
  {
    id: 'bk-004', reference_number: 'VH-20260415-004', venue_id: 'venue-001',
    date: fmt(addDays(today, 3)), time_slot_id: 'ts-001',
    full_name: 'David Ng', email: 'david@workshop.org', phone: '+60112233445',
    event_type: 'WORKSHOP', guest_count: 30, special_requests: 'U-shape table setup',
    status: 'REJECTED', admin_note: 'Venue under maintenance that day', created_at: addDays(today, -7).toISOString(),
  },
  {
    id: 'bk-005', reference_number: 'VH-20260415-005', venue_id: 'venue-001',
    date: fmt(addDays(today, 21)), time_slot_id: 'ts-004',
    full_name: 'Emily Cheah', email: 'emily@community.my', phone: '+60134455667',
    event_type: 'COMMUNITY', guest_count: 180, special_requests: null,
    status: 'PENDING', admin_note: null, created_at: addDays(today, -1).toISOString(),
  },
];

export function generateReferenceNumber(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const seq = String(nextRefSeq++).padStart(3, '0');
  return `VH-${dateStr}-${seq}`;
}

export function getUnavailableSlots(venueId: string, date: string): string[] {
  return MOCK_BOOKINGS
    .filter((b) => b.venue_id === venueId && b.date === date && b.status !== 'REJECTED')
    .map((b) => b.time_slot_id);
}
