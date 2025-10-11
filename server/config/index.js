require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    FRONTEND_URL: z.string().url(),

    POSTGRES_URL: z.string().url(),
    MONGODB_URL: z.string().url(),
    REDIS_URL: z.string().url(),

    CLERK_SECRET_KEY: z.string(),

    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_GEMINI_API_KEY: z.string().optional(),

    CSRF_SECRET: z.string().min(32),

    LOG_LEVEL: z.enum(['info', 'warn', 'error']).default('info'),
});

const config = envSchema.parse(process.env);

module.exports = config;