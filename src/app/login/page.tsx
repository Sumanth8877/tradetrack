import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/app/actions";
import { FlashBanner } from "@/components/flash-banner";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { hasSupabaseEnv } from "@/lib/env";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  subtleBadgeClass,
} from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <span className={subtleBadgeClass}>TradeTrack</span>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
              Daily discipline, trade journaling, and cached AI coaching in one dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-400">
              Log your checklist, attendance, trades, and mistakes. TradeTrack keeps
              the product simple and limits AI generation to avoid burning through
              credits.
            </p>
          </div>
          <FlashBanner code={params.flash} />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Supabase auth plus storage",
              "Trade journal with screenshots",
              "OpenAI insights with daily caps",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <SectionCard
            description="Use your existing account to access the dashboard."
            title="Sign In"
          >
            <form action={signInAction} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="login-email">
                  Email
                </label>
                <input
                  className={inputClass}
                  id="login-email"
                  name="email"
                  placeholder="trader@example.com"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="login-password">
                  Password
                </label>
                <input
                  className={inputClass}
                  id="login-password"
                  minLength={8}
                  name="password"
                  placeholder="At least 8 characters"
                  required
                  type="password"
                />
              </div>
              <SubmitButton
                className={primaryButtonClass}
                pendingLabel="Signing in..."
              >
                Open dashboard
              </SubmitButton>
            </form>
          </SectionCard>

          <SectionCard
            description="Create a fresh account. Supabase email confirmation is enabled through the callback route."
            title="Create Account"
          >
            <form action={signUpAction} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="signup-email">
                  Email
                </label>
                <input
                  className={inputClass}
                  id="signup-email"
                  name="email"
                  placeholder="trader@example.com"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="signup-password">
                  Password
                </label>
                <input
                  className={inputClass}
                  id="signup-password"
                  minLength={8}
                  name="password"
                  placeholder="At least 8 characters"
                  required
                  type="password"
                />
              </div>
              <SubmitButton
                className={secondaryButtonClass}
                pendingLabel="Creating account..."
              >
                Create account
              </SubmitButton>
            </form>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
