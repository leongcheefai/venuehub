export class HttpError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export function errorHandler(err, c) {
    if (err instanceof HttpError) {
        return c.json({ error: { code: err.code, message: err.message } }, err.status);
    }
    console.error('[unhandled]', err);
    return c.json({ error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
}
