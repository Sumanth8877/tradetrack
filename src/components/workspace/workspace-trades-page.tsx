"use client";

import { useMemo, useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  DataTable,
  KeyValueGrid,
  PageIntro,
  Panel,
  Pill,
  SectionTitle,
  Select,
  StatusPill,
} from "@/components/workspace/workspace-ui";

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
                <p className="font-medium text-zinc-50">
                  {trade.instrument} {trade.side.toUpperCase()}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  {trade.date} / {trade.time}
                </p>
              </button>,
              <span key={`${trade.id}-setup`} className="text-zinc-100">
                {trade.setupType}
              </span>,
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
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
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
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Entry / Exit Review
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-200">
                    {selectedTrade.reasonForEntry}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {selectedTrade.reasonForExit}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Psychology / mistake / lesson
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-200">
                    {selectedTrade.psychology}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {selectedTrade.mistakes}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-100">
                    {selectedTrade.lessonLearned}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-6 py-8 text-center text-sm text-zinc-400">
              No trade matches the current filters.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
