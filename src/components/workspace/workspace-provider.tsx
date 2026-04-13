"use client";

import {
  createContext,
  startTransition,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  createAttachment,
  getDayEvents,
  getUser,
  summarizeWorkspace,
  type JournalEntry,
  type NoteItem,
  type PlannerTask,
  type ResourceItem,
  type TaskStatus,
  type TradeRecord,
  type WorkspaceAttachment,
  type WorkspaceSeed,
  type WorkspaceSummary,
  type WorkspaceUser,
  workspaceSeed,
} from "@/lib/workspace-data";

type WorkspaceContextValue = {
  activeUser: WorkspaceUser;
  addJournal: (entry: JournalEntry, attachmentNames?: string[]) => void;
  addNote: (note: NoteItem) => void;
  addResource: (resource: ResourceItem) => void;
  addScreenshot: (
    name: string,
    linkedType?: WorkspaceAttachment["linkedType"],
    linkedId?: string,
  ) => void;
  addTask: (task: PlannerTask, attachmentNames?: string[]) => void;
  addTrade: (trade: TradeRecord, attachmentNames?: string[]) => void;
  currentDate: string;
  currentDayEvents: ReturnType<typeof getDayEvents>;
  hydrated: boolean;
  resetWorkspace: () => void;
  seed: WorkspaceSeed;
  setActiveUser: (userId: string) => void;
  setCurrentDate: (date: string) => void;
  summary: WorkspaceSummary;
  toggleNoteFavorite: (noteId: string) => void;
  toggleNotePinned: (noteId: string) => void;
  updateNoteBody: (noteId: string, bodyHtml: string, changedBy: string) => void;
  updateResourceStatus: (
    resourceId: string,
    status: ResourceItem["status"],
  ) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
};

const STORAGE_KEY = "tradetrack-workspace-v2";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const listeners = new Set<() => void>();

let workspaceSnapshot = workspaceSeed;
let workspaceInitialized = false;

function buildCalendarEventFromTask(task: PlannerTask) {
  return {
    date: task.date,
    endTime: task.endTime,
    id: `cal-${task.id}`,
    label: task.title,
    ownerId: task.assignedTo,
    startTime: task.startTime,
    tone:
      task.status === "completed"
        ? "emerald"
        : task.priority === "critical"
          ? "rose"
          : "cyan",
    type:
      task.category === "learning"
        ? "learning"
        : task.category === "journal"
          ? "journal"
          : task.category === "market-review"
            ? "review"
            : "planner",
  } as const;
}

function buildCalendarEventFromTrade(trade: TradeRecord) {
  return {
    date: trade.date,
    endTime: trade.time,
    id: `cal-${trade.id}`,
    label: `${trade.instrument || "Trade"} ${trade.mode} ${trade.result}`,
    ownerId: trade.userId,
    startTime: trade.time,
    tone:
      trade.result === "win"
        ? "emerald"
        : trade.result === "loss"
          ? "rose"
          : "amber",
    type: "trade" as const,
  };
}

function createLinkedAttachments(
  names: string[],
  linkedType: WorkspaceAttachment["linkedType"],
  linkedId: string,
) {
  return names.map((name) => ({
    ...createAttachment(name, linkedType),
    linkedId,
  }));
}

function safeParseSeed(raw: string | null) {
  if (!raw) {
    return workspaceSeed;
  }

  try {
    return JSON.parse(raw) as WorkspaceSeed;
  } catch {
    return workspaceSeed;
  }
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return workspaceSeed;
  }

  if (!workspaceInitialized) {
    workspaceSnapshot = safeParseSeed(window.localStorage.getItem(STORAGE_KEY));
    workspaceInitialized = true;
  }

  return workspaceSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function commitSeed(updater: (current: WorkspaceSeed) => WorkspaceSeed) {
  const next = updater(getSnapshot());
  workspaceSnapshot = next;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  listeners.forEach((listener) => listener());
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const seed = useSyncExternalStore(subscribe, getSnapshot, () => workspaceSeed);
  const activeUser = useMemo(() => getUser(seed, seed.activeUserId), [seed]);
  const summary = useMemo(() => summarizeWorkspace(seed, seed.activeUserId), [seed]);
  const currentDayEvents = useMemo(() => getDayEvents(seed, seed.currentDate), [seed]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeUser,
      addJournal(entry, attachmentNames = []) {
        const attachments = createLinkedAttachments(
          attachmentNames,
          "journal",
          entry.id,
        );

        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            attachments: [...attachments, ...current.attachments],
            journalEntries: [entry, ...current.journalEntries],
          }));
        });
      },
      addNote(note) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            notes: [note, ...current.notes],
          }));
        });
      },
      addResource(resource) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            resources: [resource, ...current.resources],
          }));
        });
      },
      addScreenshot(name, linkedType, linkedId) {
        const attachment = {
          ...createAttachment(name, linkedType),
          linkedId,
        };

        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            attachments: [attachment, ...current.attachments],
          }));
        });
      },
      addTask(task, attachmentNames = []) {
        const attachments = createLinkedAttachments(
          attachmentNames,
          "task",
          task.id,
        );

        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            attachments: [...attachments, ...current.attachments],
            calendarEvents: [
              buildCalendarEventFromTask(task),
              ...current.calendarEvents,
            ],
            tasks: [task, ...current.tasks],
          }));
        });
      },
      addTrade(trade, attachmentNames = []) {
        const createdAttachments = createLinkedAttachments(
          attachmentNames,
          "trade",
          trade.id,
        );
        const before = createdAttachments[0]?.id ?? null;
        const after = createdAttachments[1]?.id ?? null;

        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            attachments: [...createdAttachments, ...current.attachments],
            calendarEvents: [
              buildCalendarEventFromTrade({
                ...trade,
                afterScreenshotId: after,
                beforeScreenshotId: before,
              }),
              ...current.calendarEvents,
            ],
            trades: [
              {
                ...trade,
                afterScreenshotId: trade.afterScreenshotId ?? after,
                beforeScreenshotId: trade.beforeScreenshotId ?? before,
              },
              ...current.trades,
            ],
          }));
        });
      },
      currentDate: seed.currentDate,
      currentDayEvents,
      hydrated: true,
      resetWorkspace() {
        startTransition(() => {
          commitSeed(() => workspaceSeed);
        });
      },
      seed,
      setActiveUser(userId) {
        startTransition(() => {
          commitSeed((current) => ({ ...current, activeUserId: userId }));
        });
      },
      setCurrentDate(date) {
        startTransition(() => {
          commitSeed((current) => ({ ...current, currentDate: date }));
        });
      },
      summary,
      toggleNoteFavorite(noteId) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId ? { ...note, favorite: !note.favorite } : note,
            ),
          }));
        });
      },
      toggleNotePinned(noteId) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId ? { ...note, pinned: !note.pinned } : note,
            ),
          }));
        });
      },
      updateNoteBody(noteId, bodyHtml, changedBy) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    bodyHtml,
                    updatedAt: new Date().toISOString(),
                    versions: [
                      {
                        changedAt: new Date().toISOString(),
                        changedBy,
                        summary: "Edited note body",
                      },
                      ...note.versions,
                    ],
                  }
                : note,
            ),
          }));
        });
      },
      updateResourceStatus(resourceId, status) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            resources: current.resources.map((resource) =>
              resource.id === resourceId
                ? {
                    ...resource,
                    status,
                    watchedDate:
                      status === "completed"
                        ? resource.watchedDate ?? current.currentDate
                        : resource.watchedDate,
                  }
                : resource,
            ),
          }));
        });
      },
      updateTaskStatus(taskId, status) {
        startTransition(() => {
          commitSeed((current) => ({
            ...current,
            calendarEvents: current.calendarEvents.map((event) =>
              event.id === `cal-${taskId}`
                ? {
                    ...event,
                    tone:
                      status === "completed"
                        ? "emerald"
                        : status === "skipped" || status === "overdue"
                          ? "rose"
                          : event.tone,
                  }
                : event,
            ),
            tasks: current.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          }));
        });
      },
    }),
    [activeUser, currentDayEvents, seed, summary],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}
