import { redirect } from "next/navigation";
import {
  CandlestickChart,
} from "lucide-react";

import { FlashBanner } from "@/components/flash-banner";
import { LoginStage } from "@/components/login-stage";
import { SectionCard } from "@/components/section-card";
import { UsernameLoginForm } from "@/components/username-login-form";
import { subtleBadgeClass } from "@/lib/styles";
import { getWorkspaceAuthState } from "@/lib/workspace-session";
import authUsers from "../../../config/auth-users.json";

type LoginPageProps = {
  searchParams: Promise<{
    flash?: string;
  }>;
};

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
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const flashCode = params.flash === "signed_out" ? undefined : params.flash;
  const authState = await getWorkspaceAuthState();

  if (authState.status === "unconfigured") {
    return <SetupState flashCode={flashCode} />;
  }

  if (authState.status === "authenticated") {
    redirect("/");
  }

  return (
    <LoginStage>
      <div className="mb-8 flex justify-center">
        <div className="login-icon-shell relative grid size-20 place-items-center rounded-[30px] border border-cyan-300/28 bg-cyan-300/10 shadow-[0_0_110px_-16px_rgba(125,211,252,0.95)]">
          <div className="absolute -inset-4 rounded-full border border-cyan-200/10 login-orbit" />
          <div className="absolute inset-1 rounded-[24px] border border-dashed border-cyan-200/35 login-orbit" />
          <div className="absolute inset-0 rounded-[30px] border border-cyan-200/20 login-pulse-ring" />
          <div className="login-glimmer absolute -inset-y-8 left-[-45%] w-[45%] rotate-12 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
          <div className="login-icon-core absolute inset-2 rounded-[24px]" />
          <CandlestickChart className="relative z-10 size-8 text-cyan-100" />
        </div>
      </div>

      <h1 className="login-title text-center text-5xl font-semibold tracking-[-0.05em] text-zinc-50 sm:text-6xl">
        Sign In
      </h1>
      <p className="mt-4 text-center text-sm leading-6 text-zinc-400 sm:text-base">
        Each trader uses a separate username and password. Logging out returns to
        this screen so the other account can sign in independently. Account setup
        and password changes are handled outside this public screen.
      </p>

      <UsernameLoginForm
        flashCode={flashCode}
        users={authUsers.map((user) => ({
          aliases: user.aliases,
          email: user.email,
          username: user.username,
        }))}
      />
    </LoginStage>
  );
}
