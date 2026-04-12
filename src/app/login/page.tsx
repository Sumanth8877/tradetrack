import { redirect } from "next/navigation";
import {
  ArrowRight,
  CandlestickChart,
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

const candleHeights = [
  74,
  38,
  92,
  51,
  84,
  45,
  68,
  58,
  96,
  42,
  77,
  63,
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
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#020711] px-5 py-8 text-zinc-50">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="login-aurora pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.18),transparent_27%),radial-gradient(circle_at_50%_86%,rgba(16,185,129,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-200/10 login-orbit" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/10 login-pulse-ring" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl login-drift" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl login-drift" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-56 items-end justify-center gap-4 opacity-30">
        {candleHeights.map((height, index) => (
          <span
            className="login-candle w-3 rounded-t-full bg-gradient-to-t from-cyan-500/0 via-cyan-300/50 to-amber-200/70"
            key={`${height}-${index}`}
            style={{
              animationDelay: `${index * 130}ms`,
              height: `${height}px`,
            }}
          />
        ))}
      </div>

      <section className="relative z-10 w-full max-w-[31rem] login-rise">
        <div className="absolute -inset-8 rounded-[48px] bg-gradient-to-br from-cyan-300/20 via-transparent to-amber-300/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#101722]/88 p-6 shadow-[0_40px_120px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent login-scan" />
          <div className="mb-8 flex justify-center">
            <div className="relative grid size-16 place-items-center rounded-[24px] border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_70px_-18px_rgba(125,211,252,0.95)]">
              <div className="absolute inset-1 rounded-[19px] border border-dashed border-cyan-200/35 login-orbit" />
              <div className="absolute inset-0 rounded-[24px] border border-cyan-200/20 login-pulse-ring" />
              <CandlestickChart className="size-7 text-cyan-100" />
            </div>
          </div>

          <h1 className="text-center text-4xl font-semibold tracking-[-0.04em] text-zinc-50">
            Sign In
          </h1>

          <FlashBanner code={flashCode} />

          <form
            action={signInAction}
            autoComplete="off"
            className="mt-8 space-y-5"
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              className={`${primaryButtonClass} h-12 flex-1 gap-2 px-6 shadow-[0_0_45px_-18px_rgba(103,232,249,0.95)]`}
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
    </main>
  );
}
