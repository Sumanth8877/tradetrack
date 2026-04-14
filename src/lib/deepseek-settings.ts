import "server-only";

import { cookies } from "next/headers";

import { getDeepSeekEnv, hasDeepSeekEnv } from "@/lib/env";

export const DEEPSEEK_API_KEY_COOKIE = "tradetrack_deepseek_api_key";

type DeepSeekConfigSource = "cookie" | "env" | "none";

export type DeepSeekRuntimeConfig = {
  baseUrl: string;
  key: string;
  model: string;
  source: Exclude<DeepSeekConfigSource, "none">;
};

export type DeepSeekSettingsSummary = {
  hasStoredApiKey: boolean;
  maskedStoredApiKey: string | null;
  source: DeepSeekConfigSource;
};

function maskApiKey(value: string) {
  if (value.length <= 4) {
    return "****";
  }

  return `********${value.slice(-4)}`;
}

export async function getStoredDeepSeekApiKey() {
  const cookieStore = await cookies();
  const value = cookieStore.get(DEEPSEEK_API_KEY_COOKIE)?.value?.trim();

  return value ? value : null;
}

export async function getDeepSeekRuntimeConfig(): Promise<DeepSeekRuntimeConfig | null> {
  const storedApiKey = await getStoredDeepSeekApiKey();

  if (storedApiKey) {
    return {
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      key: storedApiKey,
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      source: "cookie",
    };
  }

  if (!hasDeepSeekEnv()) {
    return null;
  }

  const env = getDeepSeekEnv();

  return {
    baseUrl: env.baseUrl,
    key: env.key,
    model: env.model,
    source: "env",
  };
}

export async function getDeepSeekSettingsSummary(): Promise<DeepSeekSettingsSummary> {
  const storedApiKey = await getStoredDeepSeekApiKey();

  if (storedApiKey) {
    return {
      hasStoredApiKey: true,
      maskedStoredApiKey: maskApiKey(storedApiKey),
      source: "cookie",
    };
  }

  if (hasDeepSeekEnv()) {
    return {
      hasStoredApiKey: false,
      maskedStoredApiKey: null,
      source: "env",
    };
  }

  return {
    hasStoredApiKey: false,
    maskedStoredApiKey: null,
    source: "none",
  };
}
