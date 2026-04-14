"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChartCandlestick,
  FileText,
  FolderKanban,
  LayoutDashboard,
  NotebookPen,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Input, Panel, Pill, UserTag } from "@/components/workspace/workspace-ui";
import { searchWorkspace } from "@/lib/workspace-data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/planner", icon: FolderKanban, label: "Daily Planner" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/journal", icon: NotebookPen, label: "Shared Journal" },
  { href: "/notes", icon: FileText, label: "Notes" },
  { href: "/resources", icon: BookOpen, label: "Resources" },
  { href: "/trades", icon: ChartCandlestick, label: "Trade Journal" },
  { href: "/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const {
    activeUser,
    isSessionUserLocked,
    session,
    seed,
    sessionUser,
    summary,
  } = useWorkspace();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const searchResults = useMemo(
    () => searchWorkspace(seed, deferredQuery),
    [deferredQuery, seed],
  );
  const headerUser = sessionUser ?? activeUser;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_18%),linear-gradient(180deg,#050814_0%,#080d19_52%,#05070e_100%)] text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 xl:block">
          <Panel className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col justify-between p-6">
            <div>
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Shared Desk
                </p>
                <h2 className="mt-3 max-w-[8ch] text-2xl font-semibold leading-[1.05] tracking-[-0.04em]">
                  {seed.workspaceName}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Two-user daily planner, journal, trade log, and review cockpit.
                </p>
              </div>

              <nav className="mt-6 space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium leading-none transition",
                        active
                          ? "bg-white text-slate-950 shadow-[0_18px_50px_-28px_rgba(255,255,255,0.85)]"
                          : "text-zinc-400 hover:bg-white/8 hover:text-zinc-100",
                      )}
                      href={item.href}
                      prefetch
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-cyan-300/12 bg-cyan-300/8 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">
                  {isSessionUserLocked ? "Signed In User" : "Focus User"}
                </p>
                <div className="mt-3">
                  <UserTag
                    accent={headerUser.accent}
                    avatar={headerUser.avatar}
                    name={headerUser.name}
                  />
                </div>
                {isSessionUserLocked && session ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    @{session.username}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {headerUser.bio}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Daily Snapshot
                </p>
                <div className="mt-3 grid gap-3">
                  <Pill tone="cyan">{summary.pendingTasks} items left today</Pill>
                  <Pill tone="emerald">{summary.winLossLabel} current trade mix</Pill>
                  <Pill tone="amber">
                    {summary.learningHours.toFixed(1)}h completed learning
                  </Pill>
                </div>
              </div>
            </div>
          </Panel>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <div className="relative max-w-3xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                className="h-14 pl-11"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tasks, notes, journals, trades, and resources"
                value={searchQuery}
              />
              {searchQuery && searchResults.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 rounded-[24px] border border-white/10 bg-[#0b1020]/95 p-3 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.95)] backdrop-blur">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-white/7"
                      href={result.route}
                      onClick={() => setSearchQuery("")}
                      prefetch
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          {result.title}
                        </p>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                          {result.subtitle}
                        </p>
                      </div>
                      <Pill tone="zinc">{result.type}</Pill>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
