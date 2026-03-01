import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
});

export const getServerEnv = () => {
  return serverEnvSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  });
};

const clientEnvSchema = z.object({
  VITE_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
});

export const getClientEnv = () => {
  return clientEnvSchema.parse({
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
};
