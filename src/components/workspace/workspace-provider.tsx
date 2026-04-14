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
import type { WorkspaceSession } from "@/lib/workspace-session";

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
  isSessionUserLocked: boolean;
  resetWorkspace: () => void;
  seed: WorkspaceSeed;
  session: WorkspaceSession | null;
  sessionUser: WorkspaceUser | null;
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

const STORAGE_KEY_PREFIX = "tradetrack-workspace-v3";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const initializedKeys = new Set<string>();
const storeListeners = new Map<string, Set<() => void>>();
const storeSnapshots = new Map<string, WorkspaceSeed>();

function getStorageKey(session: WorkspaceSession | null) {
  return `${STORAGE_KEY_PREFIX}:${session?.workspaceUserId ?? "guest"}`;
}

function getStoreListeners(storageKey: string) {
  const existingListeners = storeListeners.get(storageKey);

  if (existingListeners) {
    return existingListeners;
  }

  const nextListeners = new Set<() => void>();
  storeListeners.set(storageKey, nextListeners);
  return nextListeners;
}

function coerceSeedForSession(
  seed: WorkspaceSeed,
  session: WorkspaceSession | null,
): WorkspaceSeed {
  if (session) {
    const baseSeed = seed.users.some((user) => user.id === session.workspaceUserId)
      ? seed
      : workspaceSeed;

    return {
      ...baseSeed,
      activeUserId: session.workspaceUserId,
    };
  }

  const hasValidActiveUser = seed.users.some((user) => user.id === seed.activeUserId);

  return {
    ...seed,
    activeUserId: hasValidActiveUser ? seed.activeUserId : workspaceSeed.activeUserId,
  };
}

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

function isWorkspaceSeed(value: unknown): value is WorkspaceSeed {
  if (!value || typeof value !== "object") {
    return false;
  }

  const seed = value as Partial<WorkspaceSeed>;

  return (
    typeof seed.activeUserId === "string" &&
    Array.isArray(seed.attachments) &&
    Array.isArray(seed.attendance) &&
    Array.isArray(seed.calendarEvents) &&
    typeof seed.currentDate === "string" &&
    Array.isArray(seed.journalEntries) &&
    Array.isArray(seed.notes) &&
    Array.isArray(seed.reminders) &&
    Array.isArray(seed.resources) &&
    Array.isArray(seed.tasks) &&
    Array.isArray(seed.trades) &&
    Array.isArray(seed.users) &&
    seed.users.length > 0 &&
    typeof seed.workspaceName === "string"
  );
}

function safeParseSeed(raw: string | null) {
  if (!raw) {
    return workspaceSeed;
  }

  try {
    const parsed = JSON.parse(raw);
    return isWorkspaceSeed(parsed) ? parsed : workspaceSeed;
  } catch {
    return workspaceSeed;
  }
}

function getSnapshot(storageKey: string, session: WorkspaceSession | null) {
  if (typeof window === "undefined") {
    return coerceSeedForSession(workspaceSeed, session);
  }

  if (!initializedKeys.has(storageKey)) {
    const storedSeed = safeParseSeed(window.localStorage.getItem(storageKey));
    storeSnapshots.set(storageKey, coerceSeedForSession(storedSeed, session));
    initializedKeys.add(storageKey);
  }

  return coerceSeedForSession(
    storeSnapshots.get(storageKey) ?? workspaceSeed,
    session,
  );
}

function subscribe(storageKey: string, listener: () => void) {
  const listeners = getStoreListeners(storageKey);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function commitSeed(
  storageKey: string,
  session: WorkspaceSession | null,
  updater: (current: WorkspaceSeed) => WorkspaceSeed,
) {
  const next = coerceSeedForSession(
    updater(getSnapshot(storageKey, session)),
    session,
  );
  storeSnapshots.set(storageKey, next);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  getStoreListeners(storageKey).forEach((listener) => listener());
}

export function WorkspaceProvider({
  children,
  session = null,
}: {
  children: React.ReactNode;
  session?: WorkspaceSession | null;
}) {
  const storageKey = getStorageKey(session);
  const seed = useSyncExternalStore(
    (listener) => subscribe(storageKey, listener),
    () => getSnapshot(storageKey, session),
    () => coerceSeedForSession(workspaceSeed, session),
  );
  const activeUser = useMemo(() => getUser(seed, seed.activeUserId), [seed]);
  const sessionUser = useMemo(
    () =>
      session
        ? seed.users.find((user) => user.id === session.workspaceUserId) ?? null
        : null,
    [seed, session],
  );
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
          commitSeed(storageKey, session, (current) => ({
            ...current,
            attachments: [...attachments, ...current.attachments],
            journalEntries: [entry, ...current.journalEntries],
          }));
        });
      },
      addNote(note) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
            ...current,
            notes: [note, ...current.notes],
          }));
        });
      },
      addResource(resource) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
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
          commitSeed(storageKey, session, (current) => ({
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
          commitSeed(storageKey, session, (current) => ({
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
          commitSeed(storageKey, session, (current) => ({
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
      isSessionUserLocked: Boolean(sessionUser),
      resetWorkspace() {
        startTransition(() => {
          commitSeed(storageKey, session, () => workspaceSeed);
        });
      },
      seed,
      session,
      sessionUser,
      setActiveUser(userId) {
        if (sessionUser) {
          return;
        }

        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
            ...current,
            activeUserId: userId,
          }));
        });
      },
      setCurrentDate(date) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
            ...current,
            currentDate: date,
          }));
        });
      },
      summary,
      toggleNoteFavorite(noteId) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId ? { ...note, favorite: !note.favorite } : note,
            ),
          }));
        });
      },
      toggleNotePinned(noteId) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteId ? { ...note, pinned: !note.pinned } : note,
            ),
          }));
        });
      },
      updateNoteBody(noteId, bodyHtml, changedBy) {
        startTransition(() => {
          commitSeed(storageKey, session, (current) => ({
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
          commitSeed(storageKey, session, (current) => ({
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
          commitSeed(storageKey, session, (current) => ({
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
    [activeUser, currentDayEvents, seed, session, sessionUser, storageKey, summary],
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
