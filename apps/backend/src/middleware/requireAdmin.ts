import type { MiddlewareHandler } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env.js';
import { HttpError } from '../lib/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token');

  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Invalid token');
  }

  const { data: adminRow, error: adminErr } = await supabaseAdmin
    .from('admin_user')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (adminErr) throw new HttpError(500, 'DB_ERROR', adminErr.message);
  if (!adminRow) throw new HttpError(403, 'NOT_ADMIN', 'Admin access required');

  c.set('userId', userData.user.id);
  await next();
};
