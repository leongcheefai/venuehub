import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HttpError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.status as ContentfulStatusCode,
    );
  }
  console.error('[unhandled]', err);
  return c.json({ error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
}
