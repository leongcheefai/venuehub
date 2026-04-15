import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'WEDDING', 'CORPORATE', 'BIRTHDAY', 'WORKSHOP', 'COMMUNITY', 'OTHER',
]);

export const createBookingSchema = z.object({
  venueId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlotId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().trim().min(6).max(30),
  eventType: eventTypeEnum,
  guestCount: z.number().int().positive().max(10_000),
  specialRequests: z.string().max(2000).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
