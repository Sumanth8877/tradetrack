import {
  AlertTriangle,
  CheckCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/actions";
import { DashboardLeftColumn } from "@/components/dashboard/left-column";
import { DashboardRightColumn } from "@/components/dashboard/right-column";
import { SetupState } from "@/components/dashboard/setup-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { FlashBanner } from "@/components/flash-banner";
import { SubmitButton } from "@/components/submit-button";
import { getDashboardData } from "@/lib/dashboard";
import { hasSupabaseEnv } from "@/lib/env";
import { panelClass, secondaryButtonClass, subtleBadgeClass } from "@/lib/styles";
import { formatDisplayDate, formatPercent, formatSignedNumber } from "@/lib/utils";

type HomePageProps = {
  searchParams: Promise<{
    flash?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  if (!hasSupabaseEnv()) {
    return <SetupState flashCode={params.flash} />;
  }

  const dashboard = await getDashboardData();

  if (!dashboard) {
    redirect("/login?flash=auth_required");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <header className={panelClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className={subtleBadgeClass}>TradeTrack Dashboard</span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                A focused trading review desk for {formatDisplayDate(dashboard.today)}.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-400">
                Keep the day clean: finish the checklist, log attendance, journal
                every trade, and let cached AI insights stay short and cheap.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-300">
              Signed in as {dashboard.username ?? "anonymous trader"}
            </div>
            <form action={signOutAction}>
              <SubmitButton
                className={secondaryButtonClass}
                pendingLabel="Signing out..."
              >
                Sign out
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <FlashBanner code={params.flash} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCheck}
          label="Checklist Done"
          value={`${dashboard.stats.checklist.completed}/${dashboard.stats.checklist.total || 0}`}
        />
        <StatCard
          icon={TrendingUp}
          label="30D Win Rate"
          value={formatPercent(dashboard.stats.winRate)}
        />
        <StatCard
          icon={Sparkles}
          label="Today's P/L"
          value={formatSignedNumber(dashboard.stats.todayProfitLoss)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Mistakes This Week"
          value={String(dashboard.stats.mistakesThisWeek)}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DashboardLeftColumn dashboard={dashboard} />
        <DashboardRightColumn dashboard={dashboard} />
      </div>
    </main>
  );
}
