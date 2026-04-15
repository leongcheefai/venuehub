import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { HttpError } from '../../lib/errors.js';

export const adminRoutes = new Hono();

adminRoutes.use('*', requireAdmin);

const patchSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().max(2000).optional(),
});

adminRoutes.patch('/bookings/:id', zValidator('json', patchSchema), async (c) => {
  const id = c.req.param('id');
  const { status, adminNote } = c.req.valid('json');

  const { data: existing, error: getErr } = await supabaseAdmin
    .from('booking').select('id, status').eq('id', id).maybeSingle();
  if (getErr) throw new HttpError(500, 'DB_ERROR', getErr.message);
  if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Booking not found');
  if (existing.status !== 'PENDING') {
    throw new HttpError(409, 'NOT_PENDING', 'Only pending bookings can be updated');
  }

  const { data: updated, error: updErr } = await supabaseAdmin
    .from('booking')
    .update({
      status,
      admin_note: adminNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updErr) throw new HttpError(500, 'DB_ERROR', updErr.message);

  return c.json({ booking: updated });
});
