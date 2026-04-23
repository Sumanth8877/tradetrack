import { z } from "zod";

const supabaseEnvSchema = z.object({
  key: z.string().min(1, "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."),
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
});

const supabaseAdminEnvSchema = z.object({
  serviceRoleKey: z.string().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY."),
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
});

const deepSeekEnvSchema = z.object({
  baseUrl: z.string().url("DEEPSEEK_BASE_URL must be a valid URL."),
  key: z.string().min(1, "Missing DEEPSEEK_API_KEY."),
  model: z.string().min(1).default("deepseek-chat"),
});

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabaseEnv() {
  return supabaseEnvSchema.parse({
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdminEnv() {
  return supabaseAdminEnvSchema.parse({
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

export function hasDeepSeekEnv() {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export function getDeepSeekEnv() {
  return deepSeekEnvSchema.parse({
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    key: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  });
}
