"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck2,
  Gauge,
  Settings2,
  ShieldCheck,
  Target,
  Users2,
} from "lucide-react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  ComparisonBars,
  DataTable,
  Heatmap,
  KeyValueGrid,
  LineChart,
  MetricCard,
  PageIntro,
  Panel,
  Pill,
  SectionTitle,
  Select,
  StackList,
  StatusPill,
} from "@/components/workspace/workspace-ui";
import {
  getAttendanceStreak,
  getBestPerformingDays,
  getMistakeFrequency,
  getMonthlyHeatmap,
  getMoodTrend,
  getMostMissedCategories,
  getProductiveTimeOfDay,
  getSetupUsage,
  getTaskBreakdown,
  getWeekSeries,
} from "@/lib/workspace-data";

export function TradesPage() {
  const { seed } = useWorkspace();
  const [filters, setFilters] = useState({
    instrument: "all",
    mode: "all",
    result: "all",
    setup: "all",
    userId: "all",
  });
  const [selectedTradeId, setSelectedTradeId] = useState(seed.trades[0]?.id ?? "");

  const filteredTrades = useMemo(
    () =>
      seed.trades.filter((trade) => {
        return (
          (filters.instrument === "all" || trade.instrument === filters.instrument) &&
          (filters.mode === "all" || trade.mode === filters.mode) &&
          (filters.result === "all" || trade.result === filters.result) &&
          (filters.setup === "all" || trade.setupType === filters.setup) &&
          (filters.userId === "all" || trade.userId === filters.userId)
        );
      }),
    [filters, seed.trades],
  );

  const selectedTrade =
    filteredTrades.find((trade) => trade.id === selectedTradeId) ??
    filteredTrades[0] ??
    null;

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, userId: event.target.value }))
              }
              value={filters.userId}
            >
              <option value="all">All users</option>
              <option value="user-sumanth">Sumanth</option>
              <option value="user-chandan">Chandan</option>
            </Select>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, instrument: event.target.value }))
              }
              value={filters.instrument}
            >
              <option value="all">All instruments</option>
              {[...new Set(seed.trades.map((trade) => trade.instrument))].map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </Select>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, setup: event.target.value }))
              }
              value={filters.setup}
            >
              <option value="all">All setups</option>
              {[...new Set(seed.trades.map((trade) => trade.setupType))].map((setup) => (
                <option key={setup} value={setup}>
                  {setup}
                </option>
              ))}
            </Select>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, result: event.target.value }))
              }
              value={filters.result}
            >
              <option value="all">All results</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </Select>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, mode: event.target.value }))
              }
              value={filters.mode}
            >
              <option value="all">All modes</option>
              <option value="demo">Demo</option>
              <option value="live">Live</option>
            </Select>
          </div>
        }
        description="Detailed trade logging with setup, confluence, psychology, review, and outcome filters."
        eyebrow="Trade Journal"
        title="Review every trade with context, not just the outcome."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Filterable trade table across date, user, setup, and result."
            title="Trade Log"
          />
          <DataTable
            columns={["Trade", "Setup", "Mode", "Result", "P/L"]}
            rows={filteredTrades.map((trade) => [
              <button
                key={`${trade.id}-title`}
                className="text-left"
                onClick={() => setSelectedTradeId(trade.id)}
                type="button"
              >
                <p className="font-medium text-zinc-100">
                  {trade.instrument} {trade.side.toUpperCase()}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {trade.date} • {trade.time}
                </p>
              </button>,
              <span key={`${trade.id}-setup`}>{trade.setupType}</span>,
              <Pill key={`${trade.id}-mode`} tone={trade.mode === "live" ? "amber" : "zinc"}>
                {trade.mode}
              </Pill>,
              <StatusPill key={`${trade.id}-result`} status={trade.result}>
                {trade.result}
              </StatusPill>,
              <span
                key={`${trade.id}-pnl`}
                className={trade.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}
              >
                {trade.pnl >= 0 ? "+" : ""}
                {trade.pnl}
              </span>,
            ])}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Selected trade detail, including reasoning and review fields."
            title={selectedTrade ? `${selectedTrade.instrument} review` : "Trade detail"}
          />
          {selectedTrade ? (
            <>
              <KeyValueGrid
                items={[
                  { label: "Setup", value: selectedTrade.setupType },
                  { label: "R/R", value: selectedTrade.riskReward },
                  {
                    label: "Result",
                    value: <StatusPill status={selectedTrade.result}>{selectedTrade.result}</StatusPill>,
                  },
                  { label: "Followed Plan", value: selectedTrade.followedPlan ? "Yes" : "No" },
                ]}
              />
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Confluence
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTrade.confluenceChecklist.map((item) => (
                      <Pill key={item} tone="cyan">
                        {item}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Entry / Exit Review
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {selectedTrade.reasonForEntry}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {selectedTrade.reasonForExit}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Psychology / mistake / lesson
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {selectedTrade.psychology}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {selectedTrade.mistakes}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-200">
                    {selectedTrade.lessonLearned}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-6 py-8 text-center text-sm text-zinc-500">
              No trade matches the current filters.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { activeUser, seed, summary } = useWorkspace();
  const weekSeries = getWeekSeries(seed);
  const heatmap = getMonthlyHeatmap(seed, activeUser.id);
  const setupUsage = getSetupUsage(seed);
  const taskBreakdown = getTaskBreakdown(seed);
  const moodTrend = getMoodTrend(seed)
    .filter((point) => point.userId === activeUser.id)
    .map((point) => ({ label: point.label, value: point.mood }));
  const mistakeFrequency = getMistakeFrequency(seed);
  const productiveTimes = getProductiveTimeOfDay(seed);
  const bestDays = getBestPerformingDays(seed);
  const missedCategories = getMostMissedCategories(seed);
  const streak = getAttendanceStreak(seed, activeUser.id);

  return (
    <div className="space-y-6">
      <PageIntro
        description="Measure consistency, task completion, strategy usage, trading performance, and emotional trends over time."
        eyebrow="Analytics"
        title="Personal and shared analytics for process quality, not just raw outcomes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<CalendarCheck2 className="size-5" />}
          label="Consistency Average"
          meta="Based on attendance, learning, journal, and review check-ins"
          value={`${summary.consistencyAverage.toFixed(0)} / 100`}
        />
        <MetricCard
          icon={<Gauge className="size-5" />}
          label="Completion Rate"
          meta={`${summary.personalCompleted}/${summary.totalTasks} personal tasks completed`}
          tone="emerald"
          value={`${summary.completionRate.toFixed(0)}%`}
        />
        <MetricCard
          icon={<BarChart3 className="size-5" />}
          label="Current Streak"
          meta="Continuous check-in days"
          tone="amber"
          value={`${streak} days`}
        />
        <MetricCard
          icon={<Target className="size-5" />}
          label="Best Setup"
          meta={setupUsage[0] ? `${setupUsage[0].winRate.toFixed(0)}% win rate` : "No setup data"}
          tone="violet"
          value={setupUsage[0]?.label ?? "n/a"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Tasks completed over the last week."
            title="Weekly Progress Trend"
          />
          <LineChart
            points={weekSeries.map((point) => ({
              label: point.label,
              value: point.completed,
            }))}
          />
          <ComparisonBars
            items={weekSeries.map((point) => ({
              label: point.label,
              value: point.learningHours,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Monthly attendance-like heatmap for the focus user."
            title="Consistency Heatmap"
          />
          <Heatmap cells={heatmap} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="space-y-4">
          <SectionTitle
            description="Completion rate by task category."
            title="Task Categories"
          />
          <ComparisonBars
            items={taskBreakdown.map((item) => ({
              label: item.label,
              value: item.completion,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Setup frequency, P/L, and win rate context."
            title="Setup Usage"
          />
          <StackList
            items={setupUsage.map((setup) => ({
              description: `${setup.count} trades • ${setup.winRate.toFixed(0)}% win rate • ${setup.pnl >= 0 ? "+" : ""}${setup.pnl} P/L`,
              title: setup.label,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Mood score based on journal entries."
            title="Emotional Trend"
          />
          <LineChart points={moodTrend} color="#fde68a" />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="space-y-4">
          <SectionTitle
            description="Mistakes that showed up most often."
            title="Mistake Frequency"
          />
          <ComparisonBars
            items={mistakeFrequency.map((item) => ({
              label: item.label,
              value: item.count,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="When completed work tends to happen."
            title="Productive Time"
          />
          <ComparisonBars
            items={productiveTimes.map((item) => ({
              label: item.label,
              value: item.count,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Categories most often missed or skipped."
            title="Missed Categories"
          />
          <StackList
            items={missedCategories.map((item) => ({
              description: `${item.count} missed / skipped items`,
              title: item.label,
            }))}
          />
        </Panel>
      </div>

      <Panel className="space-y-4">
        <SectionTitle
          description="Best-performing trading days across the current seed data."
          title="Best Days"
        />
        <StackList
          items={bestDays.map((day) => ({
            description: `${day.pnl >= 0 ? "+" : ""}${day.pnl} net P/L`,
            meta: day.date,
            title: day.label,
          }))}
        />
      </Panel>
    </div>
  );
}

export function SettingsPage() {
  const {
    activeUser,
    isSessionUserLocked,
    resetWorkspace,
    seed,
    sessionUser,
    setActiveUser,
  } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageIntro
        description={
          isSessionUserLocked
            ? "Each trader has a separate login. This page shows both profiles, but only the signed-in account stays active in this browser session."
            : "Manage the two-user workspace profile, reminders, and local demo data state."
        }
        eyebrow="Settings"
        title="Profiles, workspace preferences, and reminder habits."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="This workspace is intentionally designed for two people only."
            title="Profiles"
          />
          <div className="space-y-4">
            {seed.users.map((user) => (
              <div key={user.id} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className={`grid size-11 place-items-center rounded-full bg-gradient-to-br ${user.accent} font-semibold text-slate-950`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">{user.name}</p>
                        <p className="text-sm text-zinc-500">{user.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-zinc-400">{user.bio}</p>
                    <p className="mt-2 text-sm text-zinc-300">Focus: {user.focus}</p>
                  </div>
                  {isSessionUserLocked ? (
                    <Button
                      type="button"
                      variant={sessionUser?.id === user.id ? "primary" : "secondary"}
                    >
                      {sessionUser?.id === user.id ? "Signed in" : "Separate login"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveUser(user.id)}
                      type="button"
                      variant={activeUser.id === user.id ? "primary" : "secondary"}
                    >
                      {activeUser.id === user.id ? "Active" : "Set Active"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Reminder and workflow defaults currently modeled in the app."
            title="Workspace Preferences"
          />
          <StackList
            items={[
              {
                description: "Dashboard cards and backgrounds are optimized for dark mode first.",
                title: "Dark workspace",
              },
              {
                description: "Quick add supports task, journal, trade, screenshot, and resource capture.",
                title: "Fast daily entry",
              },
              {
                description: "Calendar day click sets the active date across planner, journal, and analytics.",
                title: "Shared date context",
              },
              {
                description: isSessionUserLocked
                  ? "Local demo state is stored separately for each signed-in trader on this browser."
                  : "Local state persists in browser storage so demo edits survive refreshes.",
                title: isSessionUserLocked
                  ? "Per-user local demo data"
                  : "Persistent local demo data",
              },
            ]}
          />
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Current reminder model."
              title="Reminder Channels"
            />
            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-100">
                  <Settings2 className="size-4 text-cyan-200" />
                  Dashboard reminders
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Used for today&apos;s tasks, unfinished work, and journal prompts.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-100">
                  <ShieldCheck className="size-4 text-amber-200" />
                  End-of-day prompt
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Keeps the journaling habit tied to consistency tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-100">
                  <Users2 className="size-4 text-emerald-200" />
                  Shared visibility
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Shows who completed what without losing personal tracking.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description="Reset the in-browser seed back to the shipped demo dataset."
              title="Data Controls"
            />
            <Button className="w-full" onClick={resetWorkspace} type="button" variant="secondary">
              Reset demo workspace
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
