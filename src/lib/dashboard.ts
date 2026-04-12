import { calculatePatternSnapshot, calculateTaskProgress, calculateTradeStats } from "@/lib/analytics";
import { coerceInsightPayload, getDateWindow, getTodayKey } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { AiInsight, AttendanceRecord, DashboardData, Mistake, Trade } from "@/lib/types";

const SCREENSHOT_BUCKET = "trade-screenshots";

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

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = getTodayKey();
  const { startKey: weekStart } = getDateWindow(7);
  const { startKey: analyticsStart } = getDateWindow(30);

  const [
    tasksResult,
    attendanceResult,
    recentTradesResult,
    analyticsTradesResult,
    mistakesResult,
    latestInsightResult,
    latestWeeklySummaryResult,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at", { ascending: true }),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("session_date", weekStart)
      .order("session_date", { ascending: false }),
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("traded_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("traded_on", analyticsStart)
      .order("traded_on", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", user.id)
      .gte("occurred_on", analyticsStart)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("kind", "weekly")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (attendanceResult.error) throw attendanceResult.error;
  if (recentTradesResult.error) throw recentTradesResult.error;
  if (analyticsTradesResult.error) throw analyticsTradesResult.error;
  if (mistakesResult.error) throw mistakesResult.error;
  if (latestInsightResult.error) throw latestInsightResult.error;
  if (latestWeeklySummaryResult.error) throw latestWeeklySummaryResult.error;

  const tasks = tasksResult.data ?? [];
  const recentAttendance = (attendanceResult.data ?? []) as AttendanceRecord[];
  const analyticsTrades = (analyticsTradesResult.data ?? []) as Trade[];
  const recentMistakes = (mistakesResult.data ?? []) as Mistake[];
  const recentTrades = (recentTradesResult.data ?? []) as Trade[];

  const tradesWithUrls = await Promise.all(
    recentTrades.map(async (trade) => {
      if (!trade.screenshot_path) {
        return trade;
      }

      const { data } = await supabase.storage
        .from(SCREENSHOT_BUCKET)
        .createSignedUrl(trade.screenshot_path, 60 * 60);

      return {
        ...trade,
        screenshot_url: data?.signedUrl ?? null,
      };
    }),
  );

  const todayTrades = analyticsTrades.filter((trade) => trade.traded_on === today);
  const taskProgress = calculateTaskProgress(tasks);
  const tradeStats = calculateTradeStats(analyticsTrades);
  const mistakesThisWeek = recentMistakes.filter(
    (mistake) => mistake.occurred_on >= weekStart,
  ).length;

  return {
    latestInsight: latestInsightResult.data
      ? normalizeInsight(latestInsightResult.data)
      : null,
    latestWeeklySummary: latestWeeklySummaryResult.data
      ? normalizeInsight(latestWeeklySummaryResult.data)
      : null,
    patternSnapshot: calculatePatternSnapshot(analyticsTrades),
    recentAttendance,
    recentMistakes: recentMistakes.slice(0, 6),
    recentTrades: tradesWithUrls,
    recentTradesForAnalytics: analyticsTrades,
    stats: {
      checklist: taskProgress,
      mistakesThisWeek,
      todayProfitLoss: todayTrades.reduce(
        (sum, trade) => sum + trade.profit_loss,
        0,
      ),
      winRate: tradeStats.winRate,
    },
    tasks,
    today,
    userEmail: user.email ?? null,
  };
}
