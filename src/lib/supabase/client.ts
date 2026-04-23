"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";

const AUTH_REQUEST_TIMEOUT_MS = 6000;

function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
  const upstreamSignal = init?.signal;

  if (upstreamSignal?.aborted) {
    window.clearTimeout(timeoutId);
    return fetch(input, init);
  }

  const abortListener = () => controller.abort();
  upstreamSignal?.addEventListener("abort", abortListener, { once: true });

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => {
    window.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", abortListener);
  });
}

export function createClient() {
  const env = getSupabaseEnv();

  return createBrowserClient(env.url, env.key, {
    global: {
      fetch: fetchWithTimeout,
    },
  });
}
