"use client";

import { addDays, format, parseISO, startOfWeek } from "date-fns";
import {
  AlarmClock,
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  Flame,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  ComparisonBars,
  EmptyState,
  KeyValueGrid,
  LineChart,
  MetricCard,
  PageIntro,
  Panel,
  Pill,
  RingMeter,
  SectionTitle,
  SegmentedControl,
  StackList,
  StatusPill,
  UserTag,
} from "@/components/workspace/workspace-ui";
import {
  getAttendanceStreak,
  getJournalForDate,
  getMonthMatrix,
  getSharedVsPersonalCompletion,
  getTasksForDate,
  getTradesForDate,
  getWeekSeries,
} from "@/lib/workspace-data";

function minutesLabel(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function DashboardPage() {
  const { activeUser, seed, summary, updateTaskStatus } = useWorkspace();
  const todayTasks = getTasksForDate(seed, seed.currentDate);
  const todayJournal = getJournalForDate(seed, seed.currentDate);
  const todayTrades = getTradesForDate(seed, seed.currentDate);
  const streak = getAttendanceStreak(seed, activeUser.id);
  const weekSeries = getWeekSeries(seed);
  const sharedProgress = getSharedVsPersonalCompletion(seed);
  const completedToday = todayTasks.filter((task) => task.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageIntro
        action={<UserTag accent={activeUser.accent} avatar={activeUser.avatar} name={activeUser.name} />}
        description="Shared daily command center for planning, execution, review, journaling, and learning consistency."
        eyebrow="Dashboard"
        title="One place to coordinate both schedules, capture trades quickly, and see whether the process stayed clean."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<CheckCircle2 className="size-5" />}
          label="Today's Tasks"
          meta={`${completedToday}/${todayTasks.length || 0} complete`}
          value={String(todayTasks.length)}
        />
        <MetricCard
          icon={<Flame className="size-5" />}
          label="Attendance Streak"
          meta="Checked-in days in a row"
          tone="amber"
          value={`${streak} days`}
        />
        <MetricCard
          icon={<PlayCircle className="size-5" />}
          label="Videos Watched"
          meta="Completed resources for the focus user"
          tone="emerald"
          value={String(summary.videosWatched)}
        />
        <MetricCard
          icon={<ChartNoAxesCombined className="size-5" />}
          label="Trade Mix"
          meta={summary.winLossLabel}
          tone="violet"
          value={`${summary.demoTrades} demo / ${summary.liveTrades} live`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="space-y-5">
          <SectionTitle
            description="The items that matter today, with ownership and status at a glance."
            title="Today's Command Board"
          />
          {todayTasks.length ? (
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const owner = seed.users.find((user) => user.id === task.assignedTo) ?? seed.users[0];
                return (
                  <div
                    key={task.id}
                    className="rounded-[24px] border border-white/8 bg-black/18 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill status={task.status}>{task.status}</StatusPill>
                          <Pill tone={task.priority === "critical" ? "rose" : "zinc"}>
                            {task.priority}
                          </Pill>
                          <Pill tone="zinc">{task.category}</Pill>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">
                            {task.title}
                          </h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="size-4" />
                            {task.startTime} - {task.endTime}
                          </span>
                          <span>{minutesLabel(task.estimatedMinutes)}</span>
                          <UserTag
                            accent={owner.accent}
                            avatar={owner.avatar}
                            name={owner.name}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["pending", "in_progress", "completed", "skipped"].map((status) => (
                          <button
                            key={status}
                            className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                              task.status === status
                                ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                                : "border-white/10 text-zinc-400 hover:text-zinc-100"
                            }`}
                            onClick={() => updateTaskStatus(task.id, status as typeof task.status)}
                            type="button"
                          >
                            {status.replaceAll("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              description="No tasks are scheduled for the selected date yet."
              title="Planner is empty"
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="This uses both ownership and completion history."
              title="Personal Completion"
            />
            <RingMeter label={`${activeUser.name} completion rate`} value={summary.completionRate} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Learning Hours
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">
                  {summary.learningHours.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Confidence Avg
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">
                  {summary.averageConfidence.toFixed(1)}/10
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description="Daily learning and completion trend over the last week."
              title="Week Pulse"
            />
            <LineChart
              points={weekSeries.map((point) => ({
                label: point.label,
                value: point.completed,
              }))}
            />
            <ComparisonBars
              items={weekSeries.map((point) => ({
                label: point.label,
                value: point.learningHours,
              }))}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="How the work is split between both people."
            title="Shared vs Personal Progress"
          />
          <ComparisonBars
            items={sharedProgress.map((item) => ({
              label: item.label,
              value: item.total ? (item.completed / item.total) * 100 : 0,
            }))}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Anything captured today shows up immediately."
            title="Daily Capture Feed"
          />
          <StackList
            items={[
              ...todayJournal.map((entry) => ({
                description: entry.summary,
                meta: "Journal",
                tag: <StatusPill status={entry.visibility}>{entry.visibility}</StatusPill>,
                title: entry.title,
              })),
              ...todayTrades.map((trade) => ({
                description: `${trade.instrument} ${trade.setupType} • ${trade.reasonForEntry}`,
                meta: `${trade.mode} ${trade.time}`,
                tag: <StatusPill status={trade.result}>{trade.result}</StatusPill>,
                title: `${trade.instrument} ${trade.side.toUpperCase()}`,
              })),
            ]}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Reminders generated from the current plan."
            title="Live Reminders"
          />
          <div className="space-y-3">
            {seed.reminders
              .filter((reminder) => reminder.date === seed.currentDate)
              .map((reminder) => (
                <div key={reminder.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Pill tone={reminder.status === "due" ? "amber" : "zinc"}>
                      {reminder.status}
                    </Pill>
                    <span className="text-sm text-zinc-500">{reminder.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-200">{reminder.message}</p>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function PlannerPage() {
  const { currentDate, seed, setCurrentDate, updateTaskStatus } = useWorkspace();
  const [assignee, setAssignee] = useState<"all" | string>("all");
  const tasks = getTasksForDate(seed, currentDate).filter((task) =>
    assignee === "all" ? true : task.assignedTo === assignee,
  );
  const grouped = {
    completed: tasks.filter((task) => task.status === "completed"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    pending: tasks.filter((task) => task.status === "pending"),
    skipped: tasks.filter((task) => task.status === "skipped"),
  };

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCurrentDate(format(addDays(parseISO(currentDate), -1), "yyyy-MM-dd"))} type="button" variant="secondary">
              Previous day
            </Button>
            <Button onClick={() => setCurrentDate(format(addDays(parseISO(currentDate), 1), "yyyy-MM-dd"))} type="button" variant="secondary">
              Next day
            </Button>
          </div>
        }
        description="Plan the exact day, assign work, protect review windows, and keep the workflow visible for both people."
        eyebrow="Daily Planner"
        title={`Planner for ${format(parseISO(currentDate), "EEEE, MMMM d")}`}
      />

      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-full border px-3 py-2 text-sm ${assignee === "all" ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 text-zinc-400"}`}
          onClick={() => setAssignee("all")}
          type="button"
        >
          All
        </button>
        {seed.users.map((user) => (
          <button
            key={user.id}
            className={`rounded-full border px-3 py-2 text-sm ${assignee === user.id ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 text-zinc-400"}`}
            onClick={() => setAssignee(user.id)}
            type="button"
          >
            {user.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="space-y-5">
          <SectionTitle
            description="Chronological timeline with quick status controls."
            title="Schedule Timeline"
          />
          {tasks.length ? (
            <div className="space-y-4">
              {tasks.map((task) => {
                const owner = seed.users.find((user) => user.id === task.assignedTo) ?? seed.users[0];
                return (
                  <div key={task.id} className="grid gap-4 rounded-[24px] border border-white/8 bg-black/16 p-4 md:grid-cols-[120px_1fr]">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Time
                      </p>
                      <p className="mt-3 text-lg font-semibold text-zinc-100">
                        {task.startTime}
                      </p>
                      <p className="text-sm text-zinc-500">{task.endTime}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={task.status}>{task.status}</StatusPill>
                        <Pill tone="zinc">{task.category}</Pill>
                        <Pill tone={task.priority === "critical" ? "rose" : "zinc"}>
                          {task.priority}
                        </Pill>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">
                          {task.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                        <UserTag
                          accent={owner.accent}
                          avatar={owner.avatar}
                          name={owner.name}
                        />
                        <span>{minutesLabel(task.estimatedMinutes)}</span>
                        {task.recurringLabel ? <Pill tone="amber">{task.recurringLabel}</Pill> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["pending", "in_progress", "completed", "skipped"].map((status) => (
                          <button
                            key={status}
                            className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                              task.status === status
                                ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                                : "border-white/10 text-zinc-400"
                            }`}
                            onClick={() => updateTaskStatus(task.id, status as typeof task.status)}
                            type="button"
                          >
                            {status.replaceAll("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              description="There are no planner items for the selected filter."
              title="Nothing scheduled"
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              description="Board by workflow stage."
              title="Status Board"
            />
            <div className="grid gap-4">
              {Object.entries(grouped).map(([label, items]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusPill status={label}>{label}</StatusPill>
                      <span className="text-sm text-zinc-500">{items.length} items</span>
                    </div>
                    <ArrowRight className="size-4 text-zinc-500" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {items.length ? (
                      items.map((task) => (
                        <div key={task.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                          <p className="text-sm font-medium text-zinc-100">{task.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {task.startTime} • {task.category}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No items here.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              description="Fast operational summary for the selected day."
              title="Planner Stats"
            />
            <KeyValueGrid
              items={[
                { label: "Planned", value: tasks.length },
                { label: "Completed", value: grouped.completed.length },
                { label: "In Progress", value: grouped.in_progress.length },
                {
                  label: "Learning Time",
                  value: minutesLabel(
                    tasks
                      .filter((task) => task.category === "learning" || task.category === "revision")
                      .reduce((sum, task) => sum + task.estimatedMinutes, 0),
                  ),
                },
              ]}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { currentDate, currentDayEvents, seed, setCurrentDate } = useWorkspace();
  const [view, setView] = useState<"day" | "month" | "week">("month");
  const monthMatrix = getMonthMatrix(seed);
  const weekStart = startOfWeek(parseISO(currentDate), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    format(addDays(weekStart, index), "yyyy-MM-dd"),
  );

  return (
    <div className="space-y-6">
      <PageIntro
        action={
          <SegmentedControl
            onChange={setView}
            options={["day", "week", "month"]}
            value={view}
          />
        }
        description="See tasks, learning blocks, review sessions, and trade activity in one calendar workspace."
        eyebrow="Calendar"
        title={`Calendar workspace for ${format(parseISO(currentDate), "MMMM yyyy")}`}
      />

      {view === "month" ? (
        <Panel className="space-y-4">
          <SectionTitle
            description="Click any day to load its full activity on the right."
            title="Month View"
          />
          <div className="grid grid-cols-7 gap-3 text-xs uppercase tracking-[0.24em] text-zinc-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
              <div key={label} className="px-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {monthMatrix.map((cell) => (
              <button
                key={cell.date}
                className={`min-h-32 rounded-[24px] border p-3 text-left transition ${
                  cell.date === currentDate
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : cell.inCurrentMonth
                      ? "border-white/10 bg-white/4 hover:bg-white/8"
                      : "border-white/6 bg-black/18 text-zinc-600"
                }`}
                onClick={() => setCurrentDate(cell.date)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cell.label}</span>
                  <span className="text-xs text-zinc-500">{cell.events.length}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {cell.events.slice(0, 3).map((event) => (
                    <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 px-2 py-2 text-xs text-zinc-300">
                      <p>{event.startTime}</p>
                      <p className="mt-1">{event.label}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Panel>
      ) : null}

      {view === "week" ? (
        <Panel className="space-y-4">
          <SectionTitle
            description="Week snapshot combining planner tasks and trade activity."
            title="Week View"
          />
          <div className="grid gap-4 lg:grid-cols-7">
            {weekDays.map((day) => {
              const items = seed.calendarEvents.filter((event) => event.date === day);
              return (
                <div key={day} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    {format(parseISO(day), "EEE")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {format(parseISO(day), "d")}
                  </p>
                  <div className="mt-4 space-y-3">
                    {items.length ? (
                      items.map((event) => (
                        <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {event.startTime}
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">{event.label}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No events</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ) : null}

      {view === "day" ? (
        <Panel className="space-y-4">
          <SectionTitle
            description="Detailed agenda for the currently selected date."
            title="Day View"
          />
          {currentDayEvents.length ? (
            <div className="space-y-4">
              {currentDayEvents.map((event) => (
                <div key={event.id} className="grid gap-4 rounded-[24px] border border-white/8 bg-black/16 p-4 md:grid-cols-[120px_1fr]">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
                    <p className="text-lg font-semibold text-zinc-100">{event.startTime}</p>
                    <p className="text-sm text-zinc-500">{event.endTime}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="zinc">{event.type}</Pill>
                      <Pill tone={event.tone as "amber"}>{event.ownerId === "user-sumanth" ? "Sumanth" : "Chandan"}</Pill>
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">
                      {event.label}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Selected day joins planner items, trade logs, and review sessions into one agenda.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="No calendar activity exists for the selected day."
              title="Day is clear"
            />
          )}
        </Panel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="space-y-4">
          <SectionTitle
            description="Every selected date reveals its tasks, journal notes, and trades."
            title="Date Activity"
          />
          <StackList
            items={[
              ...getTasksForDate(seed, currentDate).map((task) => ({
                description: task.description,
                meta: `${task.startTime} - ${task.endTime}`,
                tag: <StatusPill status={task.status}>{task.status}</StatusPill>,
                title: task.title,
              })),
              ...getJournalForDate(seed, currentDate).map((entry) => ({
                description: entry.summary,
                meta: "Journal",
                tag: <Pill tone="amber">{entry.visibility}</Pill>,
                title: entry.title,
              })),
              ...getTradesForDate(seed, currentDate).map((trade) => ({
                description: `${trade.instrument} ${trade.setupType} • ${trade.reasonForEntry}`,
                meta: `${trade.time} ${trade.mode}`,
                tag: <StatusPill status={trade.result}>{trade.result}</StatusPill>,
                title: `${trade.instrument} trade`,
              })),
            ]}
          />
        </Panel>

        <Panel className="space-y-4">
          <SectionTitle
            description="Quick cues for the selected day."
            title="Date Summary"
          />
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <AlarmClock className="size-4" />
                Planned blocks
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">
                {getTasksForDate(seed, currentDate).length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Sparkles className="size-4" />
                Journal entries
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">
                {getJournalForDate(seed, currentDate).length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <ChartNoAxesCombined className="size-4" />
                Trades logged
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">
                {getTradesForDate(seed, currentDate).length}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
