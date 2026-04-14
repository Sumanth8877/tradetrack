"use client";

import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace route failed", {
      digest: error.digest ?? null,
      message: error.message,
      name: error.name,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 py-16 text-zinc-50">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_-48px_rgba(0,0,0,0.95)]">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Workspace Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-50">
          The workspace could not load.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Try loading the route again. If the problem continues, sign out and
          sign back in to refresh the session.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <a
            className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/12"
            href="/login"
          >
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}
