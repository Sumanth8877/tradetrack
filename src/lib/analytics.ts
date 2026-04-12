import type {
  Mistake,
  MistakeBreakdown,
  PatternSnapshot,
  Task,
  TaskProgress,
  Trade,
  TradeStats,
} from "@/lib/types";
import { getDateWindow, getTodayKey } from "@/lib/utils";

const OVERTRADING_THRESHOLD = 5;

function sortTradesChronologically(trades: Trade[]) {
  return [...trades].sort((left, right) => {
    const byTradeDate = left.traded_on.localeCompare(right.traded_on);

    if (byTradeDate !== 0) {
      return byTradeDate;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const totalTrades = trades.length;
  const wins = trades.filter((trade) => trade.profit_loss > 0).length;
  const losses = trades.filter((trade) => trade.profit_loss < 0).length;
  const netProfitLoss = trades.reduce((sum, trade) => sum + trade.profit_loss, 0);

  return {
    averageProfitLoss: totalTrades > 0 ? netProfitLoss / totalTrades : 0,
    losses,
    netProfitLoss,
    totalTrades,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    wins,
  };
}

export function calculateTaskProgress(tasks: Task[]): TaskProgress {
  const completed = tasks.filter((task) => task.is_done).length;
  const total = tasks.length;

  return {
    completed,
    percent: total > 0 ? (completed / total) * 100 : 0,
    total,
  };
}

export function calculateCommonMistakes(
  mistakes: Mistake[],
  limit = 3,
): MistakeBreakdown[] {
  const counts = new Map<string, number>();

  for (const mistake of mistakes) {
    counts.set(mistake.mistake_type, (counts.get(mistake.mistake_type) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

export function calculatePatternSnapshot(trades: Trade[]): PatternSnapshot {
  const sortedTrades = sortTradesChronologically(trades);
  const dailyCounts = new Map<string, number>();
  const tradeTypeStats = new Map<
    string,
    { count: number; netProfitLoss: number; wins: number }
  >();

  let longestLossStreak = 0;
  let currentLossWindow = 0;

  for (const trade of sortedTrades) {
    dailyCounts.set(trade.traded_on, (dailyCounts.get(trade.traded_on) ?? 0) + 1);

    const currentTradeType = tradeTypeStats.get(trade.trade_type) ?? {
      count: 0,
      netProfitLoss: 0,
      wins: 0,
    };

    currentTradeType.count += 1;
    currentTradeType.netProfitLoss += trade.profit_loss;
    currentTradeType.wins += trade.profit_loss > 0 ? 1 : 0;
    tradeTypeStats.set(trade.trade_type, currentTradeType);

    if (trade.profit_loss < 0) {
      currentLossWindow += 1;
      longestLossStreak = Math.max(longestLossStreak, currentLossWindow);
    } else {
      currentLossWindow = 0;
    }
  }

  let currentLossStreak = 0;

  for (let index = sortedTrades.length - 1; index >= 0; index -= 1) {
    if (sortedTrades[index]?.profit_loss < 0) {
      currentLossStreak += 1;
      continue;
    }

    break;
  }

  const activeDays = dailyCounts.size;
  const totalTrades = sortedTrades.length;
  const avgTradesPerActiveDay = activeDays > 0 ? totalTrades / activeDays : 0;
  const todayTradesCount = dailyCounts.get(getTodayKey()) ?? 0;

  return {
    activeDays,
    avgTradesPerActiveDay,
    bestTradeTypes: [...tradeTypeStats.entries()]
      .map(([label, summary]) => ({
        avgProfitLoss: summary.netProfitLoss / summary.count,
        count: summary.count,
        label,
        netProfitLoss: summary.netProfitLoss,
        winRate: (summary.wins / summary.count) * 100,
      }))
      .sort(
        (left, right) =>
          right.netProfitLoss - left.netProfitLoss || right.winRate - left.winRate,
      )
      .slice(0, 3),
    currentLossStreak,
    longestLossStreak,
    overtrading:
      todayTradesCount >= OVERTRADING_THRESHOLD ||
      avgTradesPerActiveDay >= OVERTRADING_THRESHOLD - 0.5,
    overtradingThreshold: OVERTRADING_THRESHOLD,
    todayTradesCount,
  };
}

export function buildDailyAiPayload(trades: Trade[], mistakes: Mistake[]) {
  const today = getTodayKey();
  const { startKey } = getDateWindow(14);
  const tradesInFocus = trades.filter((trade) => trade.traded_on >= startKey);
  const mistakesInFocus = mistakes.filter((mistake) => mistake.occurred_on >= startKey);

  return {
    commonMistakes: calculateCommonMistakes(mistakesInFocus),
    generated_for: today,
    patterns: calculatePatternSnapshot(tradesInFocus),
    tradeStats: calculateTradeStats(
      tradesInFocus.filter((trade) => trade.traded_on === today),
    ),
  };
}

export function buildWeeklyAiPayload(trades: Trade[], mistakes: Mistake[]) {
  const { endKey, startKey } = getDateWindow(7);
  const weeklyTrades = trades.filter(
    (trade) => trade.traded_on >= startKey && trade.traded_on <= endKey,
  );
  const weeklyMistakes = mistakes.filter(
    (mistake) => mistake.occurred_on >= startKey && mistake.occurred_on <= endKey,
  );

  return {
    commonMistakes: calculateCommonMistakes(weeklyMistakes),
    patterns: calculatePatternSnapshot(trades),
    period: {
      end: endKey,
      start: startKey,
    },
    tradeStats: calculateTradeStats(weeklyTrades),
    tradeTypesCovered: [...new Set(weeklyTrades.map((trade) => trade.trade_type))],
  };
}
