"use client";

import { Settings2, ShieldCheck, Users2 } from "lucide-react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  PageIntro,
  Panel,
  SectionTitle,
  StackList,
} from "@/components/workspace/workspace-ui";

export function SettingsPage() {
  const {
    activeUser,
    isSessionUserLocked,
    resetWorkspace,
    seed,
    sessionUser,
    setActiveUser,
  } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageIntro
        description={
          isSessionUserLocked
            ? "Each trader has a separate login. This page shows both profiles, but only the signed-in account stays active in this browser session."
            : "Manage the two-user workspace profile, reminders, and local demo data state."
        }
        eyebrow="Settings"
        title="Profiles, workspace preferences, and reminder habits."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="This workspace is intentionally designed for two people only."
            title="Profiles"
          />
          <div className="space-y-4">
            {seed.users.map((user) => (
              <div key={user.id} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={`grid size-11 place-items-center rounded-full bg-gradient-to-br ${user.accent} font-semibold text-slate-950`}>
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-zinc-50">{user.name}</p>
                        <p className="text-sm text-zinc-400">{user.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-zinc-300">{user.bio}</p>
                    <p className="mt-2 text-sm text-zinc-200">Focus: {user.focus}</p>
                  </div>
                  {isSessionUserLocked ? (
                    <Button
                      type="button"
                      variant={sessionUser?.id === user.id ? "primary" : "secondary"}
                    >
                      {sessionUser?.id === user.id ? "Signed in" : "Separate login"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveUser(user.id)}
                      type="button"
                      variant={activeUser.id === user.id ? "primary" : "secondary"}
                    >
                      {activeUser.id === user.id ? "Active" : "Set Active"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Reminder and workflow defaults currently modeled in the app."
            title="Workspace Preferences"
          />
          <StackList
            items={[
              {
                description: "Dashboard cards and backgrounds are optimized for dark mode first.",
                title: "Dark workspace",
              },
              {
                description: "Quick add supports task, journal, trade, screenshot, and resource capture.",
                title: "Fast daily entry",
              },
              {
                description: "Calendar day click sets the active date across planner, journal, and analytics.",
                title: "Shared date context",
              },
              {
                description: isSessionUserLocked
                  ? "Local demo state is stored separately for each signed-in trader on this browser."
                  : "Local state persists in browser storage so demo edits survive refreshes.",
                title: isSessionUserLocked
                  ? "Per-user local demo data"
                  : "Persistent local demo data",
              },
            ]}
          />
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Current reminder model."
              title="Reminder Channels"
            />
            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-50">
                  <Settings2 className="size-4 text-cyan-200" />
                  Dashboard reminders
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Used for today&apos;s tasks, unfinished work, and journal prompts.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-50">
                  <ShieldCheck className="size-4 text-amber-200" />
                  End-of-day prompt
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Keeps the journaling habit tied to consistency tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-3 text-zinc-50">
                  <Users2 className="size-4 text-emerald-200" />
                  Shared visibility
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Shows who completed what without losing personal tracking.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description="Reset the in-browser seed back to the shipped demo dataset."
              title="Data Controls"
            />
            <Button className="w-full" onClick={resetWorkspace} type="button" variant="secondary">
              Reset demo workspace
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
