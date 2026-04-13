"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/workspace/workspace-ui";
import {
  createEmptyJournal,
  createEmptyResource,
  createEmptyTask,
  createEmptyTrade,
} from "@/lib/workspace-data";
import { cn } from "@/lib/utils";

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function QuickAddDrawer({
  open,
  onClose,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const {
    activeUser,
    addJournal,
    addResource,
    addScreenshot,
    addTask,
    addTrade,
    currentDate,
  } = useWorkspace();
  const [tab, setTab] = useState<
    "journal" | "resource" | "screenshot" | "task" | "trade"
  >("task");
  const [taskFiles, setTaskFiles] = useState<string[]>([]);
  const [journalFiles, setJournalFiles] = useState<string[]>([]);
  const [tradeFiles, setTradeFiles] = useState<string[]>([]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[linear-gradient(180deg,#0b1020,#070a13)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Quick Add
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-50">
              Capture the day without breaking flow
            </h2>
          </div>
          <Button onClick={onClose} type="button" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["task", "journal", "trade", "resource", "screenshot"] as const).map(
            (item) => (
              <button
                key={item}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm capitalize transition",
                  tab === item
                    ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                    : "border-white/10 bg-white/6 text-zinc-400 hover:text-zinc-100",
                )}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>

        {tab === "task" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const next = createEmptyTask(
                String(form.get("date") || currentDate),
                String(form.get("assignedTo") || activeUser.id),
              );

              addTask(
                {
                  ...next,
                  category: String(form.get("category") || "learning") as typeof next.category,
                  date: String(form.get("date") || currentDate),
                  description: String(form.get("description") || ""),
                  endTime: String(form.get("endTime") || "09:00"),
                  estimatedMinutes: Number(form.get("estimatedMinutes") || 30),
                  links: toList(String(form.get("links") || "")),
                  notes: String(form.get("notes") || ""),
                  priority: String(form.get("priority") || "medium") as typeof next.priority,
                  proof: String(form.get("proof") || ""),
                  startTime: String(form.get("startTime") || "08:30"),
                  title: String(form.get("title") || "Untitled task"),
                },
                taskFiles,
              );

              event.currentTarget.reset();
              setTaskFiles([]);
              onClose();
            }}
          >
            <Field label="Title">
              <Input name="title" placeholder="Watch NY session recap" required />
            </Field>
            <Field label="Description">
              <Textarea name="description" placeholder="What needs to be done?" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assigned To">
                <Select defaultValue={activeUser.id} name="assignedTo">
                  <option value="user-sumanth">Sumanth</option>
                  <option value="user-chandan">Chandan</option>
                </Select>
              </Field>
              <Field label="Date">
                <Input defaultValue={currentDate} name="date" type="date" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Start">
                <Input defaultValue="08:30" name="startTime" type="time" />
              </Field>
              <Field label="End">
                <Input defaultValue="09:00" name="endTime" type="time" />
              </Field>
              <Field label="Minutes">
                <Input defaultValue="30" min="5" name="estimatedMinutes" type="number" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select name="category">
                  <option value="learning">Learning</option>
                  <option value="execution">Execution</option>
                  <option value="revision">Revision</option>
                  <option value="market-review">Market review</option>
                  <option value="journal">Journal</option>
                  <option value="planning">Planning</option>
                  <option value="risk">Risk</option>
                </Select>
              </Field>
              <Field label="Priority">
                <Select name="priority">
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low</option>
                </Select>
              </Field>
            </div>
            <Field label="Links">
              <Input name="links" placeholder="Comma-separated URLs" />
            </Field>
            <Field label="Notes / proof">
              <Textarea name="notes" placeholder="Attach context, proof, or reminders" />
            </Field>
            <Field label="Screenshot / proof upload">
              <Input
                multiple
                onChange={(event) =>
                  setTaskFiles(Array.from(event.target.files ?? []).map((file) => file.name))
                }
                type="file"
              />
            </Field>
            <Button className="w-full" type="submit">
              Add task
            </Button>
          </form>
        ) : null}

        {tab === "journal" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const next = createEmptyJournal(
                String(form.get("date") || currentDate),
                String(form.get("userId") || activeUser.id),
              );

              addJournal(
                {
                  ...next,
                  actionPlanTomorrow: String(form.get("actionPlanTomorrow") || ""),
                  confidenceRating: Number(form.get("confidenceRating") || 7),
                  freeText: String(form.get("freeText") || ""),
                  lessonLearned: String(form.get("lessonLearned") || ""),
                  marketObservations: String(form.get("marketObservations") || ""),
                  mistakes: String(form.get("mistakes") || ""),
                  strategyPracticed: String(form.get("strategyPracticed") || ""),
                  summary: String(form.get("summary") || ""),
                  tags: toList(String(form.get("tags") || "")),
                  title: String(form.get("title") || "Journal entry"),
                  visibility: String(form.get("visibility") || "shared") as typeof next.visibility,
                },
                journalFiles,
              );

              event.currentTarget.reset();
              setJournalFiles([]);
              onClose();
            }}
          >
            <Field label="Title">
              <Input name="title" placeholder="What changed in execution today?" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="User">
                <Select defaultValue={activeUser.id} name="userId">
                  <option value="user-sumanth">Sumanth</option>
                  <option value="user-chandan">Chandan</option>
                </Select>
              </Field>
              <Field label="Date">
                <Input defaultValue={currentDate} name="date" type="date" />
              </Field>
            </div>
            <Field label="Summary">
              <Textarea name="summary" placeholder="Short end-of-day summary" />
            </Field>
            <Field label="Main reflection">
              <Textarea name="freeText" placeholder="What was learned, felt, or missed?" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lesson learned">
                <Textarea name="lessonLearned" />
              </Field>
              <Field label="Mistakes">
                <Textarea name="mistakes" />
              </Field>
            </div>
            <Field label="Action plan for tomorrow">
              <Textarea name="actionPlanTomorrow" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Strategy practiced">
                <Input name="strategyPracticed" />
              </Field>
              <Field label="Confidence">
                <Input defaultValue="7" max="10" min="1" name="confidenceRating" type="number" />
              </Field>
              <Field label="Tags">
                <Input name="tags" placeholder="comma, separated, tags" />
              </Field>
            </div>
            <Field label="Market observations">
              <Input name="marketObservations" />
            </Field>
            <Field label="Visibility">
              <Select name="visibility">
                <option value="shared">Shared</option>
                <option value="personal">Personal</option>
              </Select>
            </Field>
            <Field label="Screenshots">
              <Input
                multiple
                onChange={(event) =>
                  setJournalFiles(
                    Array.from(event.target.files ?? []).map((file) => file.name),
                  )
                }
                type="file"
              />
            </Field>
            <Button className="w-full" type="submit">
              Save journal entry
            </Button>
          </form>
        ) : null}

        {tab === "resource" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const next = createEmptyResource(
                String(form.get("assignedTo") || activeUser.id),
              );

              addResource({
                ...next,
                assignedTo: String(form.get("assignedTo") || activeUser.id),
                durationMinutes: Number(form.get("durationMinutes") || 20),
                keyTakeaways: toList(String(form.get("keyTakeaways") || "")),
                link: String(form.get("link") || ""),
                notes: String(form.get("notes") || ""),
                sourceType: String(form.get("sourceType") || "youtube") as typeof next.sourceType,
                status: String(form.get("status") || "not_started") as typeof next.status,
                summary: String(form.get("summary") || ""),
                tags: toList(String(form.get("tags") || "")),
                title: String(form.get("title") || ""),
              });

              event.currentTarget.reset();
              onClose();
            }}
          >
            <Field label="Title">
              <Input name="title" placeholder="Video / article / PDF title" required />
            </Field>
            <Field label="Link">
              <Input name="link" placeholder="https://..." required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Source">
                <Select name="sourceType">
                  <option value="youtube">YouTube</option>
                  <option value="article">Article</option>
                  <option value="pdf">PDF</option>
                  <option value="course">Course</option>
                  <option value="mentor-video">Mentor video</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select name="status">
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </Field>
              <Field label="Duration">
                <Input defaultValue="20" name="durationMinutes" type="number" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assigned To">
                <Select defaultValue={activeUser.id} name="assignedTo">
                  <option value="user-sumanth">Sumanth</option>
                  <option value="user-chandan">Chandan</option>
                </Select>
              </Field>
              <Field label="Tags">
                <Input name="tags" placeholder="setup, mindset, risk" />
              </Field>
            </div>
            <Field label="Summary">
              <Textarea name="summary" />
            </Field>
            <Field label="Key takeaways">
              <Input name="keyTakeaways" placeholder="comma-separated takeaways" />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" />
            </Field>
            <Button className="w-full" type="submit">
              Save resource
            </Button>
          </form>
        ) : null}

        {tab === "trade" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const pnl = Number(form.get("pnl") || 0);
              const next = createEmptyTrade(
                String(form.get("date") || currentDate),
                String(form.get("userId") || activeUser.id),
              );

              addTrade(
                {
                  ...next,
                  confluenceChecklist: toList(
                    String(form.get("confluenceChecklist") || ""),
                  ),
                  date: String(form.get("date") || currentDate),
                  entry: Number(form.get("entry") || 0),
                  exit: Number(form.get("exit") || 0),
                  followedPlan: form.get("followedPlan") === "on",
                  instrument: String(form.get("instrument") || "").toUpperCase(),
                  lessonLearned: String(form.get("lessonLearned") || ""),
                  mode: String(form.get("mode") || "demo") as typeof next.mode,
                  mistakes: String(form.get("mistakes") || ""),
                  pnl,
                  positionSize: Number(form.get("positionSize") || 1),
                  psychology: String(form.get("psychology") || ""),
                  reasonForEntry: String(form.get("reasonForEntry") || ""),
                  reasonForExit: String(form.get("reasonForExit") || ""),
                  result: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
                  riskReward: Number(form.get("riskReward") || 0),
                  setupType: String(form.get("setupType") || ""),
                  side: String(form.get("side") || "buy") as typeof next.side,
                  stopLoss: Number(form.get("stopLoss") || 0),
                  tags: toList(String(form.get("tags") || "")),
                  target: Number(form.get("target") || 0),
                  time: String(form.get("time") || "10:00"),
                  userId: String(form.get("userId") || activeUser.id),
                },
                tradeFiles,
              );

              event.currentTarget.reset();
              setTradeFiles([]);
              onClose();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instrument">
                <Input name="instrument" placeholder="NQ / EURUSD" required />
              </Field>
              <Field label="User">
                <Select defaultValue={activeUser.id} name="userId">
                  <option value="user-sumanth">Sumanth</option>
                  <option value="user-chandan">Chandan</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Date">
                <Input defaultValue={currentDate} name="date" type="date" />
              </Field>
              <Field label="Time">
                <Input defaultValue="10:00" name="time" type="time" />
              </Field>
              <Field label="Mode">
                <Select name="mode">
                  <option value="demo">Demo</option>
                  <option value="live">Live</option>
                </Select>
              </Field>
              <Field label="Side">
                <Select name="side">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-5">
              <Field label="Entry">
                <Input name="entry" step="0.01" type="number" />
              </Field>
              <Field label="Stop">
                <Input name="stopLoss" step="0.01" type="number" />
              </Field>
              <Field label="Target">
                <Input name="target" step="0.01" type="number" />
              </Field>
              <Field label="Exit">
                <Input name="exit" step="0.01" type="number" />
              </Field>
              <Field label="P/L">
                <Input name="pnl" step="0.01" type="number" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="R/R">
                <Input name="riskReward" step="0.1" type="number" />
              </Field>
              <Field label="Size">
                <Input name="positionSize" step="0.1" type="number" />
              </Field>
              <Field label="Setup">
                <Input name="setupType" placeholder="Liquidity sweep continuation" />
              </Field>
            </div>
            <Field label="Confluence checklist">
              <Input name="confluenceChecklist" placeholder="comma-separated confluences" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reason for entry">
                <Textarea name="reasonForEntry" />
              </Field>
              <Field label="Reason for exit">
                <Textarea name="reasonForExit" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mistakes">
                <Textarea name="mistakes" />
              </Field>
              <Field label="Psychology">
                <Textarea name="psychology" />
              </Field>
            </div>
            <Field label="Lesson learned">
              <Textarea name="lessonLearned" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tags">
                <Input name="tags" placeholder="tags, here" />
              </Field>
              <Field label="Screenshots">
                <Input
                  multiple
                  onChange={(event) =>
                    setTradeFiles(
                      Array.from(event.target.files ?? []).map((file) => file.name),
                    )
                  }
                  type="file"
                />
              </Field>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
              <input defaultChecked name="followedPlan" type="checkbox" />
              Followed plan
            </label>
            <Button className="w-full" type="submit">
              Log trade
            </Button>
          </form>
        ) : null}

        {tab === "screenshot" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              addScreenshot(
                String(form.get("label") || "Uploaded screenshot"),
                String(form.get("linkedType") || "task") as "task",
              );
              event.currentTarget.reset();
              onClose();
            }}
          >
            <Field label="Label">
              <Input name="label" placeholder="NY setup before entry" required />
            </Field>
            <Field label="Attach to">
              <Select name="linkedType">
                <option value="trade">Trade</option>
                <option value="task">Task</option>
                <option value="journal">Journal</option>
                <option value="note">Note</option>
                <option value="calendar">Calendar day</option>
              </Select>
            </Field>
            <Field label="Upload">
              <Input type="file" />
            </Field>
            <Button className="w-full" type="submit">
              Save screenshot reference
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
