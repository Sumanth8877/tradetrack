import { z } from "zod";

const supabaseEnvSchema = z.object({
  key: z.string().min(1, "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."),
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
});

const supabaseAdminEnvSchema = z.object({
  serviceRoleKey: z.string().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY."),
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
});

const openAiEnvSchema = z.object({
  key: z.string().min(1, "Missing OPENAI_API_KEY."),
  model: z.string().min(1).default("gpt-5-nano"),
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

export function hasPasswordResetEnv() {
  return Boolean(process.env.PASSWORD_RESET_ADMIN_KEY);
}

export function getPasswordResetAdminKey() {
  return z.string().min(1).parse(process.env.PASSWORD_RESET_ADMIN_KEY);
}

export function hasOpenAiEnv() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAiEnv() {
  return openAiEnvSchema.parse({
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-5-nano",
  });
}
