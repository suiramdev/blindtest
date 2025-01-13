import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_ROUND_DURATION: z.coerce.number().min(1),
});

// Validate environment variables at runtime
const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsedEnv.error.format())}`,
  );
}

// Export validated environment variables
export const env = parsedEnv.data;
