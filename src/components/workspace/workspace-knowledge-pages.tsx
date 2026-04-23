"use client";

import { useMemo, useState } from "react";
import { Bookmark, Heart, Pin, Search, Star } from "lucide-react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  PageIntro,
  Panel,
  Pill,
  SectionTitle,
  SegmentedControl,
  Select,
  StackList,
  StatusPill,
  Textarea,
} from "@/components/workspace/workspace-ui";
import { getJournalForDate } from "@/lib/workspace-data";

function NoteEditor({
  initialBody,
  onSave,
}: {
  initialBody: string;
  onSave: (nextBody: string) => void;
}) {
  const [draftBody, setDraftBody] = useState(initialBody);

  return (
    <>
      <Textarea
        className="min-h-72 rounded-[24px] border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-100"
        onChange={(event) => setDraftBody(event.target.value)}
        value={draftBody}
      />
      <div className="flex justify-end">
        <Button
          onClick={() => onSave(draftBody)}
          disabled={draftBody === initialBody}
          type="button"
        >
          Save note
        </Button>
      </div>
    </>
  );
}

export function JournalPage() {
  const { currentDate, seed } = useWorkspace();
  const [filter, setFilter] = useState<"all" | "personal" | "shared">("all");
  const entries = seed.journalEntries.filter((entry) =>
    filter === "all" ? true : entry.visibility === filter,
  );
  const todayEntries = getJournalForDate(seed, currentDate);

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <SegmentedControl
            onChange={setFilter}
            options={["all", "shared", "personal"]}
            value={filter}
          />
        }
        description="Track what was learned, what went wrong, what emotions showed up, and exactly what changes tomorrow."
        eyebrow="Shared Journal"
        title="Daily journaling for both traders, with room for personal reflection and shared review."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Recent entries across the shared workspace."
            title="Journal Timeline"
          />
          <div className="space-y-4">
            {entries.map((entry) => {
              const owner = seed.users.find((user) => user.id === entry.userId) ?? seed.users[0];
              return (
                <article
                  key={entry.id}
                  className="rounded-[24px] border border-white/8 bg-black/18 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="zinc">{entry.date}</Pill>
                        <StatusPill status={entry.visibility}>{entry.visibility}</StatusPill>
                        <Pill tone="amber">{entry.emotion}</Pill>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-zinc-50">
                          {entry.title}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-zinc-400">
                          {entry.freeText}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Confidence
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-zinc-100">
                        {entry.confidenceRating}/10
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">{owner.name}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Lesson Learned
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-200">
                        {entry.lessonLearned}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Action Plan Tomorrow
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-200">
                        {entry.actionPlanTomorrow}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Pill key={tag} tone="cyan">
                        {tag}
                      </Pill>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Prompts for the current date."
              title="Today's Prompts"
            />
            <StackList
              items={[
                {
                  description: "What setup was observed and what made it valid or invalid?",
                  title: "Setup clarity",
                },
                {
                  description: "What mistake repeated today, and which rule should prevent it tomorrow?",
                  title: "Mistake review",
                },
                {
                  description: "What emotion changed the execution quality the most?",
                  title: "Emotion check",
                },
              ]}
            />
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description="Entries recorded on the currently selected date."
              title="Date Focus"
            />
            {todayEntries.length ? (
              <StackList
                items={todayEntries.map((entry) => ({
                  description: entry.summary,
                  meta: `${entry.emotion} • ${entry.confidenceRating}/10`,
                  tag: <StatusPill status={entry.visibility}>{entry.visibility}</StatusPill>,
                  title: entry.title,
                }))}
              />
            ) : (
              <EmptyState
                description="No journal entry has been recorded for the selected date yet."
                title="No entry today"
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function NotesPage() {
  const { activeUser, seed, toggleNoteFavorite, toggleNotePinned, updateNoteBody } =
    useWorkspace();
  const [query, setQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(seed.notes[0]?.id ?? "");

  const filteredNotes = useMemo(
    () =>
      seed.notes.filter((note) =>
        `${note.title} ${note.folder} ${note.category} ${note.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, seed.notes],
  );
  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ?? null;

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search note titles, tags, or folders"
              value={query}
            />
          </div>
        }
        description="Keep strategy notes, psychology rules, risk models, and revision decks in a searchable workspace."
        eyebrow="Notes"
        title="A compact note system with folders, favorites, pins, and lightweight version history."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Pinned and searchable note inventory."
            title="Note Library"
          />
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  selectedNote?.id === note.id
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/8 bg-black/18 hover:bg-white/6"
                }`}
                onClick={() => {
                  setSelectedNoteId(note.id);
                }}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-zinc-100">{note.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {note.folder} • {note.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.pinned ? <Pin className="size-4 text-amber-200" /> : null}
                    {note.favorite ? <Heart className="size-4 text-rose-300" /> : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Pill key={tag} tone="zinc">
                      {tag}
                    </Pill>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Edit plain-text notes safely without rendering stored HTML."
              title={selectedNote?.title ?? "Select a note"}
              action={
                selectedNote ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleNotePinned(selectedNote.id)}
                      type="button"
                      variant="secondary"
                    >
                      <Pin className="mr-2 size-4" />
                      {selectedNote.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button
                      onClick={() => toggleNoteFavorite(selectedNote.id)}
                      type="button"
                      variant="secondary"
                    >
                      <Star className="mr-2 size-4" />
                      {selectedNote.favorite ? "Unfavorite" : "Favorite"}
                    </Button>
                  </div>
                ) : null
              }
            />

            {selectedNote ? (
              <NoteEditor
                key={selectedNote.id}
                initialBody={selectedNote.bodyHtml}
                onSave={(draftBody) =>
                  updateNoteBody(
                    selectedNote.id,
                    draftBody,
                    activeUser.id,
                  )
                }
              />
            ) : (
              <EmptyState
                description="Search returned no notes."
                title="Nothing selected"
              />
            )}
          </Panel>

          {selectedNote ? (
            <Panel className="space-y-4">
              <SectionTitle
                description="Recent edits recorded for this note."
                title="Version History"
              />
              <StackList
                items={selectedNote.versions.map((version) => {
                  const owner =
                    seed.users.find((user) => user.id === version.changedBy) ?? seed.users[0];
                  return {
                    description: `${owner.name} • ${version.summary}`,
                    meta: version.changedAt,
                    tag: <Pill tone="amber">v</Pill>,
                    title: version.summary,
                  };
                })}
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

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
                  <p className="font-medium text-zinc-100">{resource.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {resource.tags.join(" • ")}
                  </p>
                </div>,
                <Pill key={`${resource.id}-type`} tone="zinc">
                  {resource.sourceType}
                </Pill>,
                <span key={`${resource.id}-owner`}>{owner.name}</span>,
                <div key={`${resource.id}-status`} className="flex flex-wrap gap-2">
                  {(["not_started", "in_progress", "completed"] as const).map((option) => (
                    <button
                      key={option}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        resource.status === option
                          ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                          : "border-white/10 text-zinc-400"
                      }`}
                      onClick={() => updateResourceStatus(resource.id, option)}
                      type="button"
                    >
                      {option.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>,
                <span key={`${resource.id}-duration`}>{resource.durationMinutes} min</span>,
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
                      <p className="font-medium text-zinc-100">{resource.title}</p>
                      <StatusPill status={resource.status}>{resource.status}</StatusPill>
                    </div>
                    <div className="mt-3 space-y-2">
                      {resource.keyTakeaways.map((takeaway) => (
                        <div key={takeaway} className="flex items-start gap-3 text-sm text-zinc-300">
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
