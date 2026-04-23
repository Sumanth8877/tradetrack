import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthUserBySupabaseUser } from "@/lib/auth-users";
import { generateWorkspaceAnalyticsInsight } from "@/lib/deepseek";
import { getDeepSeekRuntimeConfig } from "@/lib/deepseek-settings";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const payloadSchema = z.object({
  bestDays: z.array(
    z.object({
      date: z.string(),
      label: z.string(),
      pnl: z.number(),
    }),
  ).max(4),
  metrics: z.object({
    bestSetup: z.string(),
    completionRate: z.number(),
    consistencyAverage: z.number(),
    streak: z.number(),
    winLossLabel: z.string(),
  }),
  missedCategories: z.array(
    z.object({
      count: z.number(),
      label: z.string(),
    }),
  ).max(5),
  mistakeFrequency: z.array(
    z.object({
      count: z.number(),
      label: z.string(),
    }),
  ).max(5),
  moodTrend: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ).max(7),
  productiveTimes: z.array(
    z.object({
      count: z.number(),
      label: z.string(),
    }),
  ).max(5),
  setupUsage: z.array(
    z.object({
      count: z.number(),
      label: z.string(),
      pnl: z.number(),
      winRate: z.number(),
    }),
  ).max(5),
  taskBreakdown: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ).max(6),
  user: z.object({
    focus: z.string(),
    name: z.string(),
    workspaceDate: z.string(),
  }),
});

const requestSchema = z.object({
  payload: payloadSchema,
});

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        error: "Supabase authentication is not configured.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Analytics auth lookup failed", authError);
  }

  if (!user || !getAuthUserBySupabaseUser(user)) {
    return NextResponse.json(
      {
        error: "Authentication required.",
      },
      { status: 401 },
    );
  }

  const config = await getDeepSeekRuntimeConfig();

  if (!config) {
    return NextResponse.json(
      {
        error:
          "DeepSeek is not configured. Save an API key in Settings or add DEEPSEEK_API_KEY in the server environment.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { payload } = requestSchema.parse(body);
    const insight = await generateWorkspaceAnalyticsInsight(payload, config);

    return NextResponse.json(insight);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid analytics payload.",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "DeepSeek analytics request failed.",
      },
      { status: 500 },
    );
  }
}
