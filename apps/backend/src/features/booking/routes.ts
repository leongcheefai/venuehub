import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { supabaseAdmin } from '../../lib/supabase.js';
import { createBookingSchema } from './schema.js';
import { createBooking } from './service.js';

export const bookingRoutes = new Hono();

bookingRoutes.post('/', zValidator('json', createBookingSchema), async (c) => {
  const input = c.req.valid('json');
  const booking = await createBooking(supabaseAdmin, input);
  return c.json({ booking }, 201);
});
