import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './lib/env.js';
import { errorHandler } from './lib/errors.js';

const app = new Hono();

app.use('*', cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.onError(errorHandler);

app.get('/health', (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`backend listening on http://localhost:${info.port}`);
});
