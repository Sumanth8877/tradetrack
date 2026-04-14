export type WorkspaceAnalyticsInsightPayload = {
  bestDays: Array<{
    date: string;
    label: string;
    pnl: number;
  }>;
  metrics: {
    bestSetup: string;
    completionRate: number;
    consistencyAverage: number;
    streak: number;
    winLossLabel: string;
  };
  missedCategories: Array<{
    count: number;
    label: string;
  }>;
  mistakeFrequency: Array<{
    count: number;
    label: string;
  }>;
  moodTrend: Array<{
    label: string;
    value: number;
  }>;
  productiveTimes: Array<{
    count: number;
    label: string;
  }>;
  setupUsage: Array<{
    count: number;
    label: string;
    pnl: number;
    winRate: number;
  }>;
  taskBreakdown: Array<{
    label: string;
    value: number;
  }>;
  user: {
    focus: string;
    name: string;
    workspaceDate: string;
  };
};
