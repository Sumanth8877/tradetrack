export type FlashTone = "error" | "info" | "success";

export type TradeDirection = "long" | "short";

export type AttendanceStatus = "present" | "partial" | "missed";

export type Task = {
  created_at: string;
  id: string;
  is_done: boolean;
  task_date: string;
  title: string;
  user_id: string;
};

export type AttendanceRecord = {
  created_at: string;
  id: string;
  notes: string | null;
  session_date: string;
  status: AttendanceStatus;
  updated_at: string;
  user_id: string;
};

export type Trade = {
  created_at: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  id: string;
  notes: string | null;
  profit_loss: number;
  screenshot_path: string | null;
  screenshot_url?: string | null;
  symbol: string;
  trade_type: string;
  traded_on: string;
  user_id: string;
};

export type Mistake = {
  created_at: string;
  id: string;
  mistake_type: string;
  notes: string | null;
  occurred_on: string;
  severity: number;
  trade_id: string | null;
  user_id: string;
};

export type TradeStats = {
  averageProfitLoss: number;
  losses: number;
  netProfitLoss: number;
  totalTrades: number;
  winRate: number;
  wins: number;
};

export type MistakeBreakdown = {
  count: number;
  label: string;
};

export type BestTradeType = {
  avgProfitLoss: number;
  count: number;
  label: string;
  netProfitLoss: number;
  winRate: number;
};

export type PatternSnapshot = {
  activeDays: number;
  avgTradesPerActiveDay: number;
  bestTradeTypes: BestTradeType[];
  currentLossStreak: number;
  longestLossStreak: number;
  overtrading: boolean;
  overtradingThreshold: number;
  todayTradesCount: number;
};

export type TaskProgress = {
  completed: number;
  percent: number;
  total: number;
};
