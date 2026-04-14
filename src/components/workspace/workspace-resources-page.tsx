"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  DataTable,
  PageIntro,
  Panel,
  Pill,
  SectionTitle,
  Select,
  StackList,
  StatusPill,
} from "@/components/workspace/workspace-ui";

export function ResourcesPage() {
  const { activeUser, seed, updateResourceStatus } = useWorkspace();
  const [assignee, setAssignee] = useState<"all" | string>("all");
  const [status, setStatus] = useState<"all" | "completed" | "in_progress" | "not_started">(
    "all",
  );

  const resources = seed.resources.filter((resource) => {
    const assigneeMatch = assignee === "all" ? true : resource.assignedTo === assignee;
    const statusMatch = status === "all" ? true : resource.status === status;
    return assigneeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <div className="flex flex-wrap gap-2">
            <Select
              onChange={(event) => setAssignee(event.target.value)}
              value={assignee}
            >
              <option value="all">All assignees</option>
              <option value="user-sumanth">Sumanth</option>
              <option value="user-chandan">Chandan</option>
            </Select>
            <Select onChange={(event) => setStatus(event.target.value as typeof status)} value={status}>
              <option value="all">All statuses</option>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        }
        description="Track videos, PDFs, courses, and mentor content with summaries, takeaways, and ownership."
        eyebrow="Resources"
        title="Learning tracker for videos, articles, course modules, and revision material."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Source, duration, status, and owner in one table."
            title="Resource Tracker"
          />
          <DataTable
            columns={["Resource", "Type", "Owner", "Status", "Duration"]}
            rows={resources.map((resource) => {
              const owner =
                seed.users.find((user) => user.id === resource.assignedTo) ?? seed.users[0];
              return [
                <div key={`${resource.id}-title`}>
                  <p className="font-medium text-zinc-50">{resource.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {resource.tags.join(" / ")}
                  </p>
                </div>,
                <Pill key={`${resource.id}-type`} tone="zinc">
                  {resource.sourceType}
                </Pill>,
                <span key={`${resource.id}-owner`} className="text-zinc-100">
                  {owner.name}
                </span>,
                <div key={`${resource.id}-status`} className="flex flex-wrap gap-2">
                  {(["not_started", "in_progress", "completed"] as const).map((option) => (
                    <button
                      key={option}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        resource.status === option
                          ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                          : "border-white/12 text-zinc-300 hover:border-white/20 hover:text-zinc-100"
                      }`}
                      onClick={() => updateResourceStatus(resource.id, option)}
                      type="button"
                    >
                      {option.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>,
                <span key={`${resource.id}-duration`} className="text-zinc-100">
                  {resource.durationMinutes} min
                </span>,
              ];
            })}
          />
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Where the current learning attention should go."
              title="Learning Queue"
            />
            <StackList
              items={resources
                .filter((resource) => resource.status !== "completed")
                .map((resource) => ({
                  description: resource.summary,
                  meta: `${resource.durationMinutes} min`,
                  tag: <StatusPill status={resource.status}>{resource.status}</StatusPill>,
                  title: resource.title,
                }))}
            />
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description={`Compact takeaways assigned to ${activeUser.name}.`}
              title="Takeaway Bank"
            />
            <div className="space-y-3">
              {seed.resources
                .filter((resource) => resource.assignedTo === activeUser.id)
                .map((resource) => (
                  <div key={resource.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-zinc-50">{resource.title}</p>
                      <StatusPill status={resource.status}>{resource.status}</StatusPill>
                    </div>
                    <div className="mt-3 space-y-2">
                      {resource.keyTakeaways.map((takeaway) => (
                        <div key={takeaway} className="flex items-start gap-3 text-sm text-zinc-200">
                          <Bookmark className="mt-0.5 size-4 text-cyan-200" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
