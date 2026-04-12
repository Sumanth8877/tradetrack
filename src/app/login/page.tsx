import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bot,
  CandlestickChart,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { signInAction } from "@/app/actions";
import { FlashBanner } from "@/components/flash-banner";
import { PasswordResetDialog } from "@/components/password-reset-dialog";
import { SectionCard } from "@/components/section-card";
import { hasSupabaseEnv } from "@/lib/env";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  subtleBadgeClass,
} from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    flash?: string;
  }>;
};

const commandCards = [
  {
    label: "Checklist",
    value: "Daily",
    detail: "Rules before entries",
  },
  {
    label: "Journal",
    value: "8 trades",
    detail: "Screenshots indexed",
  },
  {
    label: "AI Cache",
    value: "2 runs",
    detail: "Daily cost guard",
  },
];

const intelligenceCards = [
  {
    icon: CheckCircle2,
    label: "Pre-market",
    text: "Plan, bias, and discipline checks before the first trade.",
  },
  {
    icon: CandlestickChart,
    label: "Execution",
    text: "Entries, exits, P/L, screenshots, and mistake tags in one flow.",
  },
  {
    icon: Bot,
    label: "Coaching",
    text: "Cached daily and weekly summaries so feedback stays fast and cheap.",
  },
];

const tickerItems = [
  "Risk locked",
  "Journal ready",
  "Screenshots secured",
  "AI capped",
  "RLS protected",
  "Two-user access",
];

function SetupState({ flashCode }: { flashCode?: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20">
      <div className="space-y-6">
        <span className={subtleBadgeClass}>TradeTrack Setup</span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Add your Supabase keys first, then auth will come online automatically.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-400">
          The app is built, but `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are still missing from
          `.env.local`.
        </p>
        <FlashBanner code={flashCode} />
        <SectionCard
          description="Copy `.env.example` to `.env.local`, create a Supabase project, and run the SQL file in `supabase/schema.sql`."
          title="Required variables"
        >
          <div className="grid gap-3 text-sm text-zinc-300">
            <code className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              NEXT_PUBLIC_SUPABASE_URL=
            </code>
            <code className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
            </code>
            <code className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              OPENAI_API_KEY=
            </code>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  if (!hasSupabaseEnv()) {
    return <SetupState flashCode={params.flash} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#030711] px-5 py-6 text-zinc-50 sm:px-8 lg:px-10">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl login-drift" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center">
        <div className="mb-6 flex items-center justify-between gap-4 login-rise">
          <div className="flex items-center gap-3">
            <div className="relative grid size-12 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_60px_-18px_rgba(125,211,252,0.9)]">
              <div className="absolute inset-1 rounded-xl border border-dashed border-cyan-200/30 login-orbit" />
              <CandlestickChart className="size-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80">
                TradeTrack
              </p>
              <p className="text-sm text-zinc-500">Private command center</p>
            </div>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400 backdrop-blur md:block">
            Two-user access only
          </div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.98fr)_minmax(390px,520px)]">
          <section className="min-w-0 space-y-6 login-rise [animation-delay:120ms]">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100 shadow-[0_0_50px_-28px_rgba(52,211,153,0.8)]">
              <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              Session control online
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-[clamp(3.25rem,6.6vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-50">
                Trade discipline with a sharper command surface.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Track checklist execution, trading attendance, screenshots,
                mistakes, and cached AI feedback from one locked-down dashboard.
              </p>
            </div>

            <FlashBanner code={params.flash} />

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {commandCards.map((card, index) => (
                <div
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur login-rise"
                  key={card.label}
                  style={{ animationDelay: `${220 + index * 90}ms` }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent login-scan" />
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-50">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{card.detail}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-full border border-white/10 bg-black/30 py-3 text-xs uppercase tracking-[0.26em] text-zinc-400">
              <div className="flex min-w-max gap-8 login-ticker">
                {[...tickerItems, ...tickerItems].map((item, index) => (
                  <span className="flex items-center gap-3" key={`${item}-${index}`}>
                    <span className="size-1.5 rounded-full bg-cyan-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="relative min-w-0 login-rise [animation-delay:260ms] lg:sticky lg:top-6 lg:justify-self-end">
            <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-cyan-300/20 via-transparent to-amber-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#101722]/85 p-6 shadow-[0_40px_120px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                    <LockKeyhole className="size-4" />
                    Auth terminal
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50">
                    Sign In
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                    Use one of the two provisioned usernames to enter the
                    dashboard.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                  Secure
                </div>
              </div>

              <form
                action={signInAction}
                autoComplete="off"
                className="space-y-5"
                id="sign-in-form"
              >
                <div>
                  <label className={labelClass} htmlFor="login-username">
                    Username
                  </label>
                  <input
                    autoComplete="off"
                    className={`${inputClass} h-14 border-white/12 bg-black/35 text-base shadow-inner shadow-black/30`}
                    id="login-username"
                    name="username"
                    placeholder="Enter username"
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="login-password">
                    Password
                  </label>
                  <input
                    autoComplete="off"
                    className={`${inputClass} h-14 border-white/12 bg-black/35 text-base shadow-inner shadow-black/30`}
                    id="login-password"
                    minLength={8}
                    name="password"
                    placeholder="Enter password"
                    required
                    type="password"
                  />
                </div>
              </form>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  className={`${primaryButtonClass} h-12 gap-2 px-6 shadow-[0_0_45px_-18px_rgba(103,232,249,0.95)]`}
                  form="sign-in-form"
                  type="submit"
                >
                  Open dashboard
                  <ArrowRight className="size-4" />
                </button>
                <PasswordResetDialog />
              </div>

              <div className="mt-6 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <ShieldCheck className="mb-3 size-5 text-cyan-200" />
                  Supabase RLS keeps each trader isolated by user id.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <Clock3 className="mb-3 size-5 text-amber-200" />
                  AI summaries are cached with daily caps.
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {intelligenceCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <div
                    className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400 backdrop-blur login-rise"
                    key={card.label}
                    style={{ animationDelay: `${360 + index * 90}ms` }}
                  >
                    <Icon className="mb-3 size-5 text-cyan-200" />
                    <p className="font-semibold text-zinc-100">{card.label}</p>
                    <p className="mt-2 leading-6">{card.text}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500 login-rise [animation-delay:520ms]">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
            <Activity className="size-4 text-emerald-300" />
            Live journal
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
            <Target className="size-4 text-amber-300" />
            Mistake review
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
            <Sparkles className="size-4 text-cyan-300" />
            Cached coaching
          </span>
        </div>
      </section>
    </main>
  );
}
