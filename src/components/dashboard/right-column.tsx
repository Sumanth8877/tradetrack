import {
  Bot,
  CalendarCheck2,
  ClipboardList,
  Flame,
  Sparkles,
} from "lucide-react";

import {
  createMistakeAction,
  generateWeeklySummaryAction,
  upsertAttendanceAction,
} from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { InsightLines } from "@/components/dashboard/insight-lines";
import { hasOpenAiEnv } from "@/lib/env";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/lib/styles";
import type { DashboardData } from "@/lib/types";
import {
  formatDisplayDate,
  formatPercent,
  formatShortDate,
  formatSignedNumber,
} from "@/lib/utils";

export function DashboardRightColumn({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const weeklyPayload = dashboard.latestWeeklySummary?.payload;

  return (
    <div className="space-y-6">
      <SectionCard
        actions={
          <form action={generateWeeklySummaryAction}>
            <SubmitButton
              className={secondaryButtonClass}
              pendingLabel="Analyzing..."
            >
              Refresh weekly
            </SubmitButton>
          </form>
        }
        description="Daily insight runs automatically after the first trade log of the day. Weekly summary stays cached to avoid repeat calls."
        title="AI Insight"
      >
        <div className="space-y-4">
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-400/8 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-200">
              <Bot className="size-4" />
              <span className="text-sm font-semibold">
                {dashboard.latestInsight?.title ?? "No insight yet"}
              </span>
            </div>
            {dashboard.latestInsight ? (
              <>
                <InsightLines body={dashboard.latestInsight.body} />
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-100/70">
                  Generated {formatDisplayDate(dashboard.latestInsight.period_end)}
                </p>
              </>
            ) : (
              <p className="text-sm leading-7 text-zinc-300">
                Log a trade to trigger the daily insight. If OpenAI is not configured,
                the rest of the journal still works.
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-zinc-100">
              <Sparkles className="size-4 text-amber-200" />
              <span className="text-sm font-semibold">Latest weekly summary</span>
            </div>

            {dashboard.latestWeeklySummary && weeklyPayload ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/6 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Win rate
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-50">
                      {formatPercent(weeklyPayload.tradeStats.winRate)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/6 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Total trades
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-50">
                      {weeklyPayload.tradeStats.totalTrades}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/6 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Net P/L
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-50">
                      {formatSignedNumber(weeklyPayload.tradeStats.netProfitLoss)}
                    </p>
                  </div>
                </div>

                <InsightLines body={dashboard.latestWeeklySummary.body} />

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Common mistakes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {weeklyPayload.commonMistakes.length > 0 ? (
                      weeklyPayload.commonMistakes.map((mistake) => (
                        <span
                          key={mistake.label}
                          className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs text-zinc-300"
                        >
                          {mistake.label} · {mistake.count}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">
                        No repeated mistakes in the current seven-day window.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-7 text-zinc-400">
                Run the weekly summary when you have enough journal entries to review.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm text-zinc-400">
            {hasOpenAiEnv()
              ? "AI generation is capped at two runs per user per day and stored in Supabase."
              : "OpenAI is currently disabled. Add OPENAI_API_KEY in `.env.local` to turn insights on."}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        description="Mark your attendance for the current session and keep a quick seven-day trail."
        title="Attendance"
      >
        <form action={upsertAttendanceAction} className="space-y-4">
          <input name="session_date" type="hidden" value={dashboard.today} />
          <div>
            <label className={labelClass} htmlFor="attendance-status">
              Status
            </label>
            <select
              className={inputClass}
              defaultValue="present"
              id="attendance-status"
              name="status"
            >
              <option value="present">Present</option>
              <option value="partial">Partial</option>
              <option value="missed">Missed</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="attendance-notes">
              Notes
            </label>
            <textarea
              className={textareaClass}
              id="attendance-notes"
              name="notes"
              placeholder="How focused was the session?"
            />
          </div>
          <SubmitButton className={primaryButtonClass} pendingLabel="Saving...">
            Save attendance
          </SubmitButton>
        </form>

        <div className="mt-5 space-y-3">
          {dashboard.recentAttendance.length > 0 ? (
            dashboard.recentAttendance.map((record) => (
              <div
                key={record.id}
                className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-100">
                    {formatShortDate(record.session_date)}
                  </span>
                  <span className="text-zinc-400">{record.status}</span>
                </div>
                {record.notes ? (
                  <p className="mt-2 leading-7 text-zinc-400">{record.notes}</p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              No attendance records yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        description="Log the mistakes that matter. These become part of your weekly summary payload."
        title="Mistake Tracker"
      >
        <form action={createMistakeAction} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="mistake-type">
              Mistake type
            </label>
            <select
              className={inputClass}
              defaultValue="Overtrading"
              id="mistake-type"
              name="mistake_type"
            >
              {[
                "Overtrading",
                "Rules break",
                "Early entry",
                "Late exit",
                "Poor sizing",
                "Impulse trade",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="mistake-severity">
                Severity
              </label>
              <select
                className={inputClass}
                defaultValue="3"
                id="mistake-severity"
                name="severity"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="mistake-date">
                Date
              </label>
              <input
                className={inputClass}
                defaultValue={dashboard.today}
                id="mistake-date"
                name="occurred_on"
                required
                type="date"
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="mistake-notes">
              Notes
            </label>
            <textarea
              className={textareaClass}
              id="mistake-notes"
              name="notes"
              placeholder="What happened, and what should be repeated or avoided next time?"
            />
          </div>
          <SubmitButton
            className={secondaryButtonClass}
            pendingLabel="Logging..."
          >
            Save mistake
          </SubmitButton>
        </form>

        <div className="mt-5 space-y-3">
          {dashboard.recentMistakes.length > 0 ? (
            dashboard.recentMistakes.map((mistake) => (
              <div
                key={mistake.id}
                className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      {mistake.mistake_type}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                      {formatShortDate(mistake.occurred_on)}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-400">
                    Severity {mistake.severity}
                  </span>
                </div>
                {mistake.notes ? (
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {mistake.notes}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              No mistakes logged yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        description="Pattern detection is computed locally so the model only spends tokens on advice."
        title="Pattern Detection"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-zinc-100">
              <Flame className="size-4 text-rose-200" />
              <p className="text-sm font-semibold">Loss streaks</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-50">
              {dashboard.patternSnapshot.currentLossStreak}
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Current streak. Longest recent streak:{" "}
              {dashboard.patternSnapshot.longestLossStreak}.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-zinc-100">
              <ClipboardList className="size-4 text-cyan-200" />
              <p className="text-sm font-semibold">Overtrading</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-50">
              {dashboard.patternSnapshot.overtrading ? "Flagged" : "Stable"}
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {dashboard.patternSnapshot.todayTradesCount} trades today. Threshold:{" "}
              {dashboard.patternSnapshot.overtradingThreshold}+.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2 text-zinc-100">
            <CalendarCheck2 className="size-4 text-amber-200" />
            <p className="text-sm font-semibold">Best trade types</p>
          </div>
          <div className="space-y-3">
            {dashboard.patternSnapshot.bestTradeTypes.length > 0 ? (
              dashboard.patternSnapshot.bestTradeTypes.map((tradeType) => (
                <div
                  key={tradeType.label}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-zinc-100">{tradeType.label}</p>
                    <p className="text-zinc-300">
                      {formatSignedNumber(tradeType.netProfitLoss)}
                    </p>
                  </div>
                  <p className="mt-2 text-zinc-400">
                    {tradeType.count} trades · {formatPercent(tradeType.winRate)} win rate
                    · avg {formatSignedNumber(tradeType.avgProfitLoss)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
                Add a few trades with trade types to surface the strongest setup.
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
