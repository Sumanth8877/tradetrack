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
  Settings,
  TrendingUp,
} from "lucide-react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Panel, Pill } from "@/components/workspace/workspace-ui";
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
  const { seed, summary } = useWorkspace();
  const pathname = usePathname();

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
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium leading-none transition-colors",
                        active
                          ? "border-cyan-300/30 bg-cyan-300/14 text-cyan-50 shadow-[0_18px_50px_-32px_rgba(34,211,238,0.45)]"
                          : "border-transparent text-zinc-300 hover:border-white/8 hover:bg-white/6 hover:text-zinc-50",
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
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
