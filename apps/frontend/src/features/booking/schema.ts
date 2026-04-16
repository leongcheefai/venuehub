import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'WEDDING', 'CORPORATE', 'BIRTHDAY', 'WORKSHOP', 'COMMUNITY', 'OTHER',
]);
export type EventType = z.infer<typeof eventTypeEnum>;

export const detailsSchema = z.object({
  fullName: z.string().trim().min(1, 'Required').max(120),
  email: z.string().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid phone'),
  eventType: eventTypeEnum,
  guestCount: z.coerce.number().int().positive('Must be at least 1'),
  specialRequests: z.string().max(2000).optional(),
});
export type DetailsValues = z.infer<typeof detailsSchema>;

export const eventTypeLabels: Record<EventType, string> = {
  WEDDING: 'Wedding',
  CORPORATE: 'Corporate',
  BIRTHDAY: 'Birthday',
  WORKSHOP: 'Workshop',
  COMMUNITY: 'Community',
  OTHER: 'Other',
};
