import { SectionCard } from "@/components/section-card";
import { subtleBadgeClass } from "@/lib/styles";

function LoadingBar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />;
}

export function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <header className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className={subtleBadgeClass}>TradeTrack Dashboard</span>
            <div className="space-y-3">
              <LoadingBar className="h-12 w-full max-w-3xl" />
              <LoadingBar className="h-5 w-full max-w-2xl" />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <LoadingBar className="h-12 w-48" />
            <LoadingBar className="h-10 w-28" />
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur"
          >
            <LoadingBar className="h-4 w-24" />
            <LoadingBar className="mt-5 h-10 w-28" />
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard
          description="Loading your tasks, recent trades, and journal forms."
          title="Trading Desk"
        >
          <div className="space-y-4">
            <LoadingBar className="h-12 w-full" />
            <LoadingBar className="h-32 w-full rounded-[24px]" />
            <LoadingBar className="h-32 w-full rounded-[24px]" />
          </div>
        </SectionCard>

        <SectionCard
          description="Loading your latest insight, attendance, mistakes, and patterns."
          title="Review Panel"
        >
          <div className="space-y-4">
            <LoadingBar className="h-28 w-full rounded-[24px]" />
            <LoadingBar className="h-28 w-full rounded-[24px]" />
            <LoadingBar className="h-28 w-full rounded-[24px]" />
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
