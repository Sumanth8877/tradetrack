import { Camera } from "lucide-react";

import { createTaskAction, createTradeAction, toggleTaskAction } from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { primaryButtonClass, inputClass, labelClass, secondaryButtonClass, textareaClass } from "@/lib/styles";
import type { DashboardData } from "@/lib/types";
import {
  formatPercent,
  formatShortDate,
  formatSignedNumber,
} from "@/lib/utils";

export function DashboardLeftColumn({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        description="Set the plan for today and clear items as the session progresses."
        title="Daily Tasks"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-3">
            {dashboard.tasks.length > 0 ? (
              dashboard.tasks.map((task) => (
                <form
                  key={task.id}
                  action={toggleTaskAction}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <input name="task_id" type="hidden" value={task.id} />
                  <input
                    name="next_state"
                    type="hidden"
                    value={String(!task.is_done)}
                  />
                  <p
                    className={
                      task.is_done
                        ? "text-sm text-zinc-500 line-through"
                        : "text-sm text-zinc-100"
                    }
                  >
                    {task.title}
                  </p>
                  <SubmitButton
                    className={
                      task.is_done ? secondaryButtonClass : primaryButtonClass
                    }
                    pendingLabel="Updating..."
                  >
                    {task.is_done ? "Undo" : "Done"}
                  </SubmitButton>
                </form>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
                No tasks logged for today yet.
              </div>
            )}
          </div>

          <form action={createTaskAction} className="space-y-4">
            <input name="task_date" type="hidden" value={dashboard.today} />
            <div>
              <label className={labelClass} htmlFor="task-title">
                Add task
              </label>
              <input
                className={inputClass}
                id="task-title"
                name="title"
                placeholder="Review pre-market levels"
                required
                type="text"
              />
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm text-zinc-400">
              Completion rate: {formatPercent(dashboard.stats.checklist.percent)}
            </div>
            <SubmitButton
              className={primaryButtonClass}
              pendingLabel="Adding..."
            >
              Save task
            </SubmitButton>
          </form>
        </div>
      </SectionCard>

      <SectionCard
        description="Capture the full trade: prices, result, context, and optional chart screenshot."
        title="Trade Journal"
      >
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form action={createTradeAction} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="symbol">
                Symbol
              </label>
              <input
                className={inputClass}
                id="symbol"
                name="symbol"
                placeholder="NQ"
                required
                type="text"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="trade-type">
                Trade type
              </label>
              <input
                className={inputClass}
                id="trade-type"
                name="trade_type"
                placeholder="Opening range breakout"
                required
                type="text"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="direction">
                Direction
              </label>
              <select className={inputClass} defaultValue="long" id="direction" name="direction">
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="traded-on">
                Trade date
              </label>
              <input
                className={inputClass}
                defaultValue={dashboard.today}
                id="traded-on"
                name="traded_on"
                required
                type="date"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="entry-price">
                Entry price
              </label>
              <input
                className={inputClass}
                id="entry-price"
                name="entry_price"
                required
                step="0.01"
                type="number"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="exit-price">
                Exit price
              </label>
              <input
                className={inputClass}
                id="exit-price"
                name="exit_price"
                required
                step="0.01"
                type="number"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="profit-loss">
                Profit / Loss
              </label>
              <input
                className={inputClass}
                id="profit-loss"
                name="profit_loss"
                required
                step="0.01"
                type="number"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="screenshot">
                Screenshot
              </label>
              <input
                accept="image/*"
                className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950`}
                id="screenshot"
                name="screenshot"
                type="file"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="trade-notes">
                Notes
              </label>
              <textarea
                className={textareaClass}
                id="trade-notes"
                name="notes"
                placeholder="Why the setup was valid, what broke, and whether execution followed the plan."
              />
            </div>
            <div className="md:col-span-2">
              <SubmitButton
                className={primaryButtonClass}
                pendingLabel="Logging trade..."
              >
                Save trade
              </SubmitButton>
            </div>
          </form>

          <div className="space-y-3">
            {dashboard.recentTrades.length > 0 ? (
              dashboard.recentTrades.map((trade) => (
                <article
                  key={trade.id}
                  className="rounded-[24px] border border-white/8 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-50">
                        {trade.symbol} · {trade.trade_type}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                        {trade.direction} · {formatShortDate(trade.traded_on)}
                      </p>
                    </div>
                    <span
                      className={
                        trade.profit_loss >= 0
                          ? "rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                          : "rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200"
                      }
                    >
                      {formatSignedNumber(trade.profit_loss)}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2 text-sm text-zinc-400">
                      <p>
                        Entry {trade.entry_price.toFixed(2)} · Exit{" "}
                        {trade.exit_price.toFixed(2)}
                      </p>
                      {trade.notes ? (
                        <p className="leading-7 text-zinc-300">{trade.notes}</p>
                      ) : null}
                    </div>
                    {trade.screenshot_url ? (
                      <div className="overflow-hidden rounded-2xl border border-white/8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={`${trade.symbol} chart screenshot`}
                          className="h-24 w-32 object-cover"
                          src={trade.screenshot_url}
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-32 items-center justify-center rounded-2xl border border-dashed border-white/10 text-zinc-600">
                        <Camera className="size-4" />
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
                Your recent trades will appear here once you start journaling.
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
