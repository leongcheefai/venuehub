import { z } from 'zod';
const schema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
});
export const env = schema.parse(process.env);
