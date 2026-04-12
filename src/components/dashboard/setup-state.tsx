import { FlashBanner } from "@/components/flash-banner";
import { panelClass, subtleBadgeClass } from "@/lib/styles";

export function SetupState({ flashCode }: { flashCode?: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20">
      <div className="space-y-6">
        <span className={subtleBadgeClass}>TradeTrack Setup</span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          TradeTrack is ready. It only needs Supabase and OpenAI environment keys.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-400">
          Copy `.env.example` to `.env.local`, run the SQL in `supabase/schema.sql`,
          and restart the dev server.
        </p>
        <FlashBanner code={flashCode} />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Supabase powers auth, storage, and PostgreSQL data.",
            "OpenAI insights are cached in the database to avoid repeat calls.",
            "Deploy the same project to Vercel after env vars are added.",
          ].map((item) => (
            <div key={item} className={panelClass}>
              <p className="text-sm leading-7 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
