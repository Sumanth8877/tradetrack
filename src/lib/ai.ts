import type { SupabaseClient } from "@supabase/supabase-js";

import { buildDailyAiPayload, buildWeeklyAiPayload } from "@/lib/analytics";
import { hasOpenAiEnv } from "@/lib/env";
import { generateInsightCopy } from "@/lib/openai";
import type { AiInsight, InsightKind, Mistake, Trade } from "@/lib/types";
import { coerceInsightPayload, getDateWindow, getTodayKey } from "@/lib/utils";

const MAX_AI_GENERATIONS_PER_DAY = 2;

type InsightResult =
  | { insight: AiInsight; status: "cached" | "created" }
  | { reason: string; status: "limited" | "skipped" };

function toIsoWindow(dayKey: string) {
  const start = new Date(`${dayKey}T00:00:00.000`);
  const end = new Date(`${dayKey}T23:59:59.999`);

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  };
}

function normalizeInsight(row: Record<string, unknown>): AiInsight {
  return {
    body: String(row.body ?? ""),
    created_at: String(row.created_at ?? ""),
    id: String(row.id ?? ""),
    kind: row.kind === "weekly" ? "weekly" : "daily",
    model: typeof row.model === "string" ? row.model : null,
    payload: coerceInsightPayload(row.payload) as AiInsight["payload"],
    period_end: String(row.period_end ?? ""),
    period_start: String(row.period_start ?? ""),
    title: String(row.title ?? ""),
    user_id: String(row.user_id ?? ""),
  };
}

async function getInsightBudgetCount(supabase: SupabaseClient, userId: string) {
  const today = getTodayKey();
  const window = toIsoWindow(today);

  const { count, error } = await supabase
    .from("ai_insights")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", window.start)
    .lte("created_at", window.end);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getCachedInsight(
  supabase: SupabaseClient,
  userId: string,
  kind: InsightKind,
  periodStart: string,
  periodEnd: string,
) {
  const { data, error } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeInsight(data) : null;
}

async function upsertInsight(
  supabase: SupabaseClient,
  insight: {
    body: string;
    kind: InsightKind;
    model: string;
    payload: Record<string, unknown>;
    periodEnd: string;
    periodStart: string;
    title: string;
    userId: string;
  },
) {
  const { data, error } = await supabase
    .from("ai_insights")
    .upsert(
      {
        body: insight.body,
        kind: insight.kind,
        model: insight.model,
        payload: insight.payload,
        period_end: insight.periodEnd,
        period_start: insight.periodStart,
        title: insight.title,
        user_id: insight.userId,
      },
      { onConflict: "user_id,kind,period_start,period_end" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeInsight(data);
}

async function fetchTrades(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
) {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .gte("traded_on", fromDate)
    .lte("traded_on", toDate)
    .order("traded_on", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Trade[];
}

async function fetchMistakes(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
) {
  const { data, error } = await supabase
    .from("mistakes")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_on", fromDate)
    .lte("occurred_on", toDate)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Mistake[];
}

async function generateInsight({
  kind,
  periodEnd,
  periodStart,
  supabase,
  summary,
  title,
  userId,
}: {
  kind: InsightKind;
  periodEnd: string;
  periodStart: string;
  supabase: SupabaseClient;
  summary: Record<string, unknown>;
  title: string;
  userId: string;
}): Promise<InsightResult> {
  if (!hasOpenAiEnv()) {
    return { reason: "missing-openai-key", status: "skipped" };
  }

  const cachedInsight = await getCachedInsight(
    supabase,
    userId,
    kind,
    periodStart,
    periodEnd,
  );

  if (cachedInsight) {
    return { insight: cachedInsight, status: "cached" };
  }

  const budgetCount = await getInsightBudgetCount(supabase, userId);

  if (budgetCount >= MAX_AI_GENERATIONS_PER_DAY) {
    return { reason: "daily-cap-reached", status: "limited" };
  }

  const insightCopy = await generateInsightCopy({
    kind,
    summary,
    userId,
  });

  const savedInsight = await upsertInsight(supabase, {
    body: insightCopy.body,
    kind,
    model: insightCopy.model,
    payload: summary,
    periodEnd,
    periodStart,
    title,
    userId,
  });

  return { insight: savedInsight, status: "created" };
}

export async function generateDailyInsightIfNeeded(
  supabase: SupabaseClient,
  userId: string,
) {
  const today = getTodayKey();
  const { startKey } = getDateWindow(14);
  const [trades, mistakes] = await Promise.all([
    fetchTrades(supabase, userId, startKey, today),
    fetchMistakes(supabase, userId, startKey, today),
  ]);

  const todaysTrades = trades.filter((trade) => trade.traded_on === today);

  if (todaysTrades.length === 0) {
    return { reason: "no-trades-today", status: "skipped" } as const;
  }

  return generateInsight({
    kind: "daily",
    periodEnd: today,
    periodStart: today,
    supabase,
    summary: buildDailyAiPayload(trades, mistakes),
    title: "Daily Insight",
    userId,
  });
}

export async function generateWeeklySummary(
  supabase: SupabaseClient,
  userId: string,
) {
  const { endKey, startKey } = getDateWindow(30);
  const [trades, mistakes] = await Promise.all([
    fetchTrades(supabase, userId, startKey, endKey),
    fetchMistakes(supabase, userId, startKey, endKey),
  ]);

  const weeklyPayload = buildWeeklyAiPayload(trades, mistakes);
  const weeklyTrades = trades.filter(
    (trade) =>
      trade.traded_on >= String(weeklyPayload.period.start) &&
      trade.traded_on <= String(weeklyPayload.period.end),
  );
  const weeklyMistakes = mistakes.filter(
    (mistake) =>
      mistake.occurred_on >= String(weeklyPayload.period.start) &&
      mistake.occurred_on <= String(weeklyPayload.period.end),
  );

  if (weeklyTrades.length === 0 && weeklyMistakes.length === 0) {
    return { reason: "no-weekly-data", status: "skipped" } as const;
  }

  return generateInsight({
    kind: "weekly",
    periodEnd: String(weeklyPayload.period.end),
    periodStart: String(weeklyPayload.period.start),
    supabase,
    summary: weeklyPayload,
    title: "Weekly Summary",
    userId,
  });
}
