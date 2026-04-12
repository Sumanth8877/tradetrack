import { redirect } from "next/navigation";
import {
  ArrowRight,
  CandlestickChart,
  LockKeyhole,
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

const quoteSteps = [
  "Learn the setup",
  "Trade the plan",
  "Review the result",
  "Repeat with discipline",
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
  const flashCode = params.flash === "signed_out" ? undefined : params.flash;

  if (!hasSupabaseEnv()) {
    return <SetupState flashCode={flashCode} />;
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
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.98fr)_minmax(390px,520px)]">
          <section className="min-w-0 space-y-6 login-rise [animation-delay:120ms]">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100 shadow-[0_0_50px_-28px_rgba(52,211,153,0.8)]">
              <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              Learn. Trade. Repeat.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-[clamp(3.25rem,6.6vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-50">
                Master every session before the market tests you.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Plan with focus, journal with honesty, and turn every trading
                day into a cleaner decision loop.
              </p>
            </div>

            <FlashBanner code={flashCode} />

            <div className="relative overflow-hidden rounded-[30px] border border-cyan-200/15 bg-cyan-200/[0.045] p-5 shadow-[0_24px_90px_-60px_rgba(34,211,238,0.9)] backdrop-blur">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent login-scan" />
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">
                Session mantra
              </p>
              <blockquote className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-zinc-50 sm:text-3xl">
                &quot;Learn the setup. Trade the plan. Review the result. Repeat.&quot;
              </blockquote>
              <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                {quoteSteps.map((item) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5"
                    key={item}
                  >
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
                    Enter your username and password to continue.
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
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
