import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  BCRYPT_SALT: z.coerce.number().int().min(10).max(15).default(12),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  console.error('Invalid environment variables:\n' + errors.join('\n'))
  process.exit(1)
}

export const env = parsed.data
