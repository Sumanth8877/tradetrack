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

import { Panel } from "@/components/workspace/workspace-ui";
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
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_18%),linear-gradient(180deg,#050814_0%,#080d19_52%,#05070e_100%)] text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 xl:block">
          <Panel className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col justify-between p-6">
            <div>
              <nav className="space-y-2">
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

          </Panel>
        </aside>

        <div className="min-w-0 flex-1">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
