import { z } from 'zod'

const envSchema = z.object({
  VITE_SPOTIFY_CLIENT_ID: z.string().min(1),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
})

// Validate environment variables at runtime
const parsedEnv = envSchema.safeParse(import.meta.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format())
  throw new Error('Invalid environment variables')
}

// Export validated environment variables
export const env = parsedEnv.data
