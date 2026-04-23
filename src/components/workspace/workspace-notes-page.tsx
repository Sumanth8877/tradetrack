"use client";

import { Heart, Pin, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  EmptyState,
  Input,
  PageIntro,
  Panel,
  Pill,
  SectionTitle,
  StackList,
  Textarea,
} from "@/components/workspace/workspace-ui";
import { cn } from "@/lib/utils";

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
        className="min-h-72 rounded-[24px] border-white/10 bg-black/24 p-5 text-sm leading-7 text-zinc-50"
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
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
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
            {filteredNotes.map((note) => {
              const selected = selectedNote?.id === note.id;

              return (
                <button
                  key={note.id}
                  className={cn(
                    "w-full rounded-[24px] border p-4 text-left transition",
                    selected
                      ? "border-cyan-300/35 bg-cyan-300/12 shadow-[0_24px_70px_-42px_rgba(34,211,238,0.65)]"
                      : "border-white/8 bg-black/18 hover:bg-white/6",
                  )}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-50">
                        {note.title}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xs uppercase tracking-[0.2em]",
                          selected ? "text-cyan-100/80" : "text-zinc-400",
                        )}
                      >
                        {note.folder} / {note.category}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {note.pinned ? <Pin className="size-4 text-amber-200" /> : null}
                      {note.favorite ? <Heart className="size-4 text-rose-300" /> : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Pill key={tag} tone={selected ? "sky" : "zinc"}>
                        {tag}
                      </Pill>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Edit plain-text notes safely without rendering stored HTML."
              title={selectedNote?.title ?? "Select a note"}
              action={
                selectedNote ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => toggleNotePinned(selectedNote.id)}
                      type="button"
                      variant="secondary"
                    >
                      <Pin className="size-4" />
                      {selectedNote.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button
                      onClick={() => toggleNoteFavorite(selectedNote.id)}
                      type="button"
                      variant="secondary"
                    >
                      <Star className="size-4" />
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
                    description: `${owner.name} - ${version.summary}`,
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
