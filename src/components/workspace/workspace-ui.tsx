"use client";

import { Fragment, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowUpRight, Dot, Flame, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const toneStyles = {
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  sky: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
  zinc: "border-white/10 bg-white/8 text-zinc-200",
} as const;

function getToneStyle(tone: keyof typeof toneStyles | string) {
  return toneStyles[tone as keyof typeof toneStyles] ?? toneStyles.zinc;
}

export function Panel({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,39,0.95),rgba(7,10,19,0.96))] p-5 shadow-[0_22px_100px_-50px_rgba(0,0,0,0.9)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export function PageIntro({
  title,
  eyebrow,
  description,
  action,
}: {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-zinc-400">
          <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(125,211,252,0.8)]" />
          {eyebrow}
        </div>
        <div className="space-y-2">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  meta,
  icon,
  tone = "cyan",
}: {
  icon?: ReactNode;
  label: string;
  meta?: string;
  tone?: keyof typeof toneStyles;
  value: string;
}) {
  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-50">
            {value}
          </p>
          {meta ? <p className="mt-2 text-sm text-zinc-400">{meta}</p> : null}
        </div>
        <div
          className={cn(
            "grid size-11 place-items-center rounded-2xl border",
            getToneStyle(tone),
          )}
        >
          {icon ?? <TrendingUp className="size-5" />}
        </div>
      </div>
    </Panel>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  action?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        getToneStyle(tone),
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  children,
  status,
}: {
  children: ReactNode;
  status: string;
}) {
  const tone =
    status === "completed" || status === "win"
      ? "emerald"
      : status === "pending" || status === "in_progress"
        ? "cyan"
        : status === "skipped" || status === "loss" || status === "overdue"
          ? "rose"
          : "amber";

  return <Pill tone={tone}>{String(children).replaceAll("_", " ")}</Pill>;
}

export function UserTag({
  name,
  avatar,
  accent,
}: {
  accent: string;
  avatar: string;
  name: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2">
      <div
        className={cn(
          "grid size-8 place-items-center rounded-full bg-gradient-to-br text-xs font-semibold text-slate-950",
          accent,
        )}
      >
        {avatar}
      </div>
      <span className="text-sm text-zinc-200">{name}</span>
    </div>
  );
}

export function ComparisonBars({
  items,
  valueKey = "value",
}: {
  items: Array<Record<string, number | string>>;
  valueKey?: string;
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey])), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={String(item.label)} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">{String(item.label)}</span>
            <span className="text-zinc-500">{Number(item[valueKey]).toFixed(0)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-200"
              style={{
                width: `${(Number(item[valueKey]) / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LineChart({
  points,
  color = "#7dd3fc",
}: {
  color?: string;
  points: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const areaPath = `${path} L 100 100 L 0 100 Z`;

  return (
    <div className="space-y-3">
      <svg className="h-36 w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`fill-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#fill-${color})`} />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
      <div className="grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Heatmap({
  cells,
}: {
  cells: Array<{ date: string; day: string; score: number; weekday: string }>;
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell) => (
        <div key={cell.date} className="space-y-1">
          <div
            className={cn(
              "grid aspect-square place-items-center rounded-2xl border text-xs",
              cell.score >= 80
                ? "border-emerald-300/30 bg-emerald-300/18 text-emerald-50"
                : cell.score >= 60
                  ? "border-cyan-300/25 bg-cyan-300/14 text-cyan-50"
                  : cell.score >= 40
                    ? "border-amber-300/25 bg-amber-300/12 text-amber-50"
                    : "border-white/10 bg-white/6 text-zinc-500",
            )}
            title={`${cell.weekday} ${cell.date}: ${cell.score}`}
          >
            {cell.day}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RingMeter({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 44;
  const dash = circumference - (bounded / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg className="size-24 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="44"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="44"
          stroke="url(#meter-gradient)"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          strokeWidth="12"
        />
        <defs>
          <linearGradient id="meter-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="text-3xl font-semibold tracking-[-0.04em] text-zinc-50">
          {bounded.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  onChange: (next: T) => void;
  options: T[];
  value: T;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/6 p-1">
      {options.map((option) => (
        <button
          key={option}
          className={cn(
            "rounded-full px-3 py-2 text-sm capitalize transition",
            option === value
              ? "bg-white text-slate-950"
              : "text-zinc-400 hover:text-zinc-200",
          )}
          onClick={() => onChange(option)}
          type="button"
        >
          {option.replaceAll("_", " ")}
        </button>
      ))}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15",
        className,
      )}
      {...props}
    />
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "ghost" | "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          : variant === "secondary"
            ? "border border-white/12 bg-white/8 text-zinc-100 hover:bg-white/12"
            : "text-zinc-300 hover:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-6 py-8 text-center">
      <p className="text-base font-medium text-zinc-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

export function StackList({
  items,
}: {
  items: Array<{
    description?: string;
    meta?: string;
    tag?: ReactNode;
    title: string;
  }>;
}) {
  return (
    <div className="divide-y divide-white/6 overflow-hidden rounded-[24px] border border-white/8">
      {items.map((item) => (
        <div
          key={`${item.title}-${item.meta}`}
          className="flex flex-col gap-3 bg-black/10 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-100">{item.title}</p>
            {item.description ? (
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                {item.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {item.meta ? <span>{item.meta}</span> : null}
            {item.tag}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatDelta({
  value,
  label,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
        <Flame className="size-3.5" />
        {label}
      </div>
      <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-zinc-100">
        {value}
        <ArrowUpRight className="size-4 text-emerald-300" />
      </div>
    </div>
  );
}

export function AttachmentBadge({
  name,
  tone,
}: {
  name: string;
  tone: keyof typeof toneStyles | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
        getToneStyle(tone),
      )}
    >
      <Dot className="size-3" />
      {name}
    </span>
  );
}

export function KeyValueGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {item.label}
          </p>
          <div className="mt-3 text-base font-medium text-zinc-100">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="grid grid-cols-1 bg-white/6 sm:grid-cols-none" style={gridStyle}>
        {columns.map((column) => (
          <div
            key={column}
            className="border-b border-white/8 px-4 py-3 text-xs uppercase tracking-[0.24em] text-zinc-500 sm:border-b-0"
          >
            {column}
          </div>
        ))}
      </div>
      <div className="divide-y divide-white/6">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 bg-black/12 sm:grid-cols-none"
            style={gridStyle}
          >
            {row.map((cell, cellIndex) => (
              <Fragment key={cellIndex}>
                <div className="px-4 py-3 text-sm text-zinc-200">{cell}</div>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
