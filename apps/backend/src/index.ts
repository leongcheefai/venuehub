import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './lib/env.js';
import { errorHandler } from './lib/errors.js';
import { bookingRoutes } from './features/booking/routes.js';
import { adminRoutes } from './features/admin/routes.js';

const app = new Hono();

app.use('*', cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.onError(errorHandler);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/api/bookings', bookingRoutes);
app.route('/api/admin', adminRoutes);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`backend listening on http://localhost:${info.port}`);
});
