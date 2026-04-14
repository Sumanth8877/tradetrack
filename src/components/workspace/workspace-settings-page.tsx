"use client";

import { signOutAction } from "@/app/actions";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  EmptyState,
  Panel,
  Pill,
  SectionTitle,
} from "@/components/workspace/workspace-ui";

export function SettingsPage() {
  const { isSessionUserLocked } = useWorkspace();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {isSessionUserLocked ? (
        <Panel className="space-y-4">
          <SectionTitle
            description="End the current workspace session from here."
            title="Account"
          />
          <form action={signOutAction}>
            <Button className="w-full" type="submit" variant="secondary">
              Logout
            </Button>
          </form>
        </Panel>
      ) : (
        <Panel>
          <EmptyState
            description="Sign in to manage this workspace session."
            title="No active account"
          />
        </Panel>
      )}

      <Panel className="space-y-4">
        <SectionTitle
          description="Placeholder for analytics model configuration."
          title="API Management"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              Provider
            </p>
            <p className="mt-3 text-base font-semibold text-zinc-50">
              DeepSeek
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Planned analytics model provider.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              Status
            </p>
            <div className="mt-3">
              <Pill tone="amber">Placeholder</Pill>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              API key, base URL, and model selector can be wired here later.
            </p>
          </div>
        </div>
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 p-5">
          <p className="text-sm font-medium text-zinc-100">
            Keep DeepSeek keys server-side only.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Use environment variables and call the provider from server actions or API routes, not directly from client components.
          </p>
          <Button className="mt-4" disabled type="button" variant="secondary">
            Coming soon
          </Button>
        </div>
      </Panel>
    </div>
  );
}
