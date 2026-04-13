import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  subDays,
} from "date-fns";

export type WorkspaceUser = {
  accent: string;
  avatar: string;
  bio: string;
  focus: string;
  handle: string;
  id: string;
  name: string;
  role: string;
};

export type AttachmentTargetType =
  | "calendar"
  | "journal"
  | "note"
  | "resource"
  | "task"
  | "trade";

export type WorkspaceAttachment = {
  caption: string;
  id: string;
  linkedId?: string;
  linkedType?: AttachmentTargetType;
  name: string;
  tone: string;
  type: "image" | "pdf" | "link";
};

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue"
  | "skipped";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskCategory =
  | "execution"
  | "journal"
  | "learning"
  | "market-review"
  | "planning"
  | "revision"
  | "risk";

export type PlannerTask = {
  assignedTo: string;
  attachments: string[];
  category: TaskCategory;
  date: string;
  description: string;
  endTime: string;
  estimatedMinutes: number;
  id: string;
  links: string[];
  notes: string;
  priority: TaskPriority;
  proof: string;
  recurringLabel?: string;
  startTime: string;
  status: TaskStatus;
  title: string;
};

export type JournalMood =
  | "confident"
  | "disciplined"
  | "focused"
  | "hesitant"
  | "neutral"
  | "stressed";

export type JournalEntry = {
  actionPlanTomorrow: string;
  confidenceRating: number;
  date: string;
  emotion: JournalMood;
  freeText: string;
  id: string;
  lessonLearned: string;
  marketObservations: string;
  mistakes: string;
  relatedResourceIds: string[];
  relatedScreenshotIds: string[];
  relatedTradeIds: string[];
  strategyPracticed: string;
  summary: string;
  tags: string[];
  title: string;
  userId: string;
  visibility: "personal" | "shared";
};

export type NoteVersion = {
  changedAt: string;
  changedBy: string;
  summary: string;
};

export type NoteItem = {
  bodyHtml: string;
  category: string;
  favorite: boolean;
  folder: string;
  id: string;
  pinned: boolean;
  tags: string[];
  title: string;
  updatedAt: string;
  versions: NoteVersion[];
};

export type ResourceStatus = "completed" | "in_progress" | "not_started";

export type ResourceItem = {
  assignedTo: string;
  durationMinutes: number;
  id: string;
  keyTakeaways: string[];
  link: string;
  notes: string;
  sourceType: "article" | "course" | "mentor-video" | "pdf" | "youtube";
  status: ResourceStatus;
  summary: string;
  tags: string[];
  title: string;
  watchedDate: string | null;
};

export type TradeMode = "demo" | "live";
export type TradeResult = "breakeven" | "loss" | "win";

export type TradeRecord = {
  afterScreenshotId: string | null;
  beforeScreenshotId: string | null;
  confluenceChecklist: string[];
  date: string;
  entry: number;
  exit: number;
  followedPlan: boolean;
  id: string;
  instrument: string;
  lessonLearned: string;
  mode: TradeMode;
  mistakes: string;
  pnl: number;
  positionSize: number;
  psychology: string;
  reasonForEntry: string;
  reasonForExit: string;
  result: TradeResult;
  riskReward: number;
  setupType: string;
  side: "buy" | "sell";
  stopLoss: number;
  tags: string[];
  target: number;
  time: string;
  userId: string;
};

export type AttendanceRecord = {
  checkedIn: boolean;
  completedLearningTasks: boolean;
  date: string;
  id: string;
  journalSubmitted: boolean;
  reviewLogged: boolean;
  score: number;
  userId: string;
};

export type ReminderItem = {
  channel: "dashboard" | "email" | "push";
  date: string;
  id: string;
  message: string;
  recurring: boolean;
  status: "done" | "due" | "missed";
  targetType: "journal" | "review" | "study" | "task";
  time: string;
};

export type CalendarEvent = {
  date: string;
  endTime: string;
  id: string;
  label: string;
  ownerId: string;
  startTime: string;
  tone: string;
  type:
    | "deadline"
    | "journal"
    | "learning"
    | "planner"
    | "review"
    | "trade";
};

export type WorkspaceSeed = {
  activeUserId: string;
  attachments: WorkspaceAttachment[];
  attendance: AttendanceRecord[];
  calendarEvents: CalendarEvent[];
  currentDate: string;
  journalEntries: JournalEntry[];
  notes: NoteItem[];
  reminders: ReminderItem[];
  resources: ResourceItem[];
  tasks: PlannerTask[];
  trades: TradeRecord[];
  users: WorkspaceUser[];
  workspaceName: string;
};

type ActivitySearchResult = {
  id: string;
  route: string;
  subtitle: string;
  title: string;
  type: string;
};

const CURRENT_DATE = "2026-04-13";

const users: WorkspaceUser[] = [
  {
    accent: "from-cyan-300 to-blue-500",
    avatar: "SK",
    bio: "Plans the day, reviews structure, and keeps execution disciplined.",
    focus: "Daily planner + strategy review",
    handle: "@sumanth",
    id: "user-sumanth",
    name: "Sumanth",
    role: "Planner / Primary trader",
  },
  {
    accent: "from-amber-300 to-orange-500",
    avatar: "CK",
    bio: "Balances work hours with execution blocks and night review sessions.",
    focus: "Execution + post-market review",
    handle: "@chandan",
    id: "user-chandan",
    name: "Chandan",
    role: "Execution / Review partner",
  },
];

const baseAttachments: WorkspaceAttachment[] = [
  {
    caption: "London session scalp before breakout",
    id: "shot-eurusd-before",
    linkedId: "trade-01",
    linkedType: "trade",
    name: "EURUSD pre-entry setup",
    tone: "cyan",
    type: "image",
  },
  {
    caption: "Trade management after partial exit",
    id: "shot-eurusd-after",
    linkedId: "trade-01",
    linkedType: "trade",
    name: "EURUSD managed exit",
    tone: "emerald",
    type: "image",
  },
  {
    caption: "NQ rejection at daily high",
    id: "shot-nq-demo",
    linkedId: "trade-05",
    linkedType: "trade",
    name: "NQ demo fade",
    tone: "violet",
    type: "image",
  },
  {
    caption: "Morning checklist completion proof",
    id: "shot-checklist",
    linkedId: "task-13",
    linkedType: "task",
    name: "Planner checklist proof",
    tone: "amber",
    type: "image",
  },
  {
    caption: "Marked-up chart from video lesson",
    id: "shot-journal-markup",
    linkedId: "journal-03",
    linkedType: "journal",
    name: "BOS + liquidity notes",
    tone: "sky",
    type: "image",
  },
  {
    caption: "Trade review template PDF",
    id: "pdf-trade-playbook",
    linkedId: "resource-05",
    linkedType: "resource",
    name: "Playbook revision sheet",
    tone: "zinc",
    type: "pdf",
  },
];

const tasks: PlannerTask[] = [
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "learning",
    date: "2026-04-13",
    description: "Watch the ICT liquidity sweep recap and note the replay timestamps.",
    endTime: "08:45",
    estimatedMinutes: 45,
    id: "task-01",
    links: ["https://youtube.com/watch?v=ict-liquidity-recap"],
    notes: "Capture the exact invalidation conditions in the journal.",
    priority: "high",
    proof: "",
    startTime: "08:00",
    status: "completed",
    title: "Watch YouTube video",
  },
  {
    assignedTo: "user-chandan",
    attachments: ["shot-checklist"],
    category: "revision",
    date: "2026-04-13",
    description: "Upload two demo screenshots and annotate whether entry aligned with bias.",
    endTime: "09:30",
    estimatedMinutes: 40,
    id: "task-02",
    links: [],
    notes: "One screenshot should include a failed setup.",
    priority: "high",
    proof: "Two screenshots uploaded to gallery",
    startTime: "08:50",
    status: "in_progress",
    title: "Demo trade screenshots",
  },
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "execution",
    date: "2026-04-13",
    description: "Take one A+ setup only. Skip every average setup.",
    endTime: "11:15",
    estimatedMinutes: 75,
    id: "task-03",
    links: [],
    notes: "No second trade unless the first one followed plan fully.",
    priority: "critical",
    proof: "",
    startTime: "10:00",
    status: "pending",
    title: "Take one trade",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "revision",
    date: "2026-04-13",
    description: "Revise risk model notes and the last three overtrading mistakes.",
    endTime: "19:45",
    estimatedMinutes: 30,
    id: "task-04",
    links: ["https://notion.so/risk-model"],
    notes: "Summarize the best correction in one line.",
    priority: "medium",
    proof: "",
    recurringLabel: "Mon-Fri",
    startTime: "19:15",
    status: "pending",
    title: "Revise notes",
  },
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "market-review",
    date: "2026-04-13",
    description: "Review NY session structure, missed setups, and tomorrow's bias.",
    endTime: "22:00",
    estimatedMinutes: 60,
    id: "task-05",
    links: [],
    notes: "Tag one trade idea for tomorrow.",
    priority: "high",
    proof: "",
    recurringLabel: "Daily",
    startTime: "21:00",
    status: "pending",
    title: "Market review",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "journal",
    date: "2026-04-13",
    description: "Complete end-of-day journal with confidence score and action plan.",
    endTime: "22:30",
    estimatedMinutes: 25,
    id: "task-06",
    links: [],
    notes: "Do not submit a journal entry without one mistake and one improvement.",
    priority: "high",
    proof: "",
    recurringLabel: "Daily",
    startTime: "22:05",
    status: "pending",
    title: "End-of-day journal",
  },
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "planning",
    date: "2026-04-12",
    description: "Plan both schedules with realistic time windows around work hours.",
    endTime: "07:45",
    estimatedMinutes: 25,
    id: "task-07",
    links: [],
    notes: "Keep max 5 core tasks per person.",
    priority: "medium",
    proof: "Planner shared",
    startTime: "07:20",
    status: "completed",
    title: "Build daily plan",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "learning",
    date: "2026-04-12",
    description: "Watch mentor video and extract two takeaways into psychology notes.",
    endTime: "21:00",
    estimatedMinutes: 50,
    id: "task-08",
    links: ["https://youtube.com/watch?v=mentor-review-session"],
    notes: "Prioritize patience and execution quality.",
    priority: "medium",
    proof: "",
    startTime: "20:10",
    status: "completed",
    title: "Mentor review session",
  },
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "execution",
    date: "2026-04-11",
    description: "Replay a demo setup on NQ with screenshots before and after.",
    endTime: "10:30",
    estimatedMinutes: 35,
    id: "task-09",
    links: [],
    notes: "Focus on entry timing around the opening range.",
    priority: "medium",
    proof: "",
    startTime: "09:55",
    status: "skipped",
    title: "Demo replay drill",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "risk",
    date: "2026-04-11",
    description: "Backtest stop placement on three recent losses.",
    endTime: "21:15",
    estimatedMinutes: 45,
    id: "task-10",
    links: [],
    notes: "Label avoidable vs acceptable loss.",
    priority: "high",
    proof: "Backtest notes saved",
    startTime: "20:30",
    status: "completed",
    title: "Risk review batch",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "learning",
    date: "2026-04-10",
    description: "Complete the market structure lesson and save timestamps for revision.",
    endTime: "20:00",
    estimatedMinutes: 55,
    id: "task-11",
    links: ["https://youtube.com/watch?v=market-structure-drill"],
    notes: "Summarize change-of-character triggers.",
    priority: "high",
    proof: "",
    startTime: "19:05",
    status: "completed",
    title: "Market structure lesson",
  },
  {
    assignedTo: "user-sumanth",
    attachments: [],
    category: "journal",
    date: "2026-04-10",
    description: "Write a review on emotional control after consecutive losses.",
    endTime: "22:20",
    estimatedMinutes: 20,
    id: "task-12",
    links: [],
    notes: "Keep it short and specific.",
    priority: "medium",
    proof: "",
    startTime: "22:00",
    status: "completed",
    title: "Psychology reflection",
  },
  {
    assignedTo: "user-sumanth",
    attachments: ["shot-checklist"],
    category: "planning",
    date: "2026-04-14",
    description: "Draft the next day plan with clear work / study separation.",
    endTime: "07:40",
    estimatedMinutes: 20,
    id: "task-13",
    links: [],
    notes: "Keep the evening review protected.",
    priority: "medium",
    proof: "",
    recurringLabel: "Daily",
    startTime: "07:20",
    status: "pending",
    title: "Prepare next-day planner",
  },
  {
    assignedTo: "user-chandan",
    attachments: [],
    category: "market-review",
    date: "2026-04-14",
    description: "Tag the most productive session and one setup to avoid tomorrow.",
    endTime: "22:15",
    estimatedMinutes: 30,
    id: "task-14",
    links: [],
    notes: "Compare against the weekly pattern report.",
    priority: "medium",
    proof: "",
    startTime: "21:45",
    status: "pending",
    title: "Night review sync",
  },
];

const journalEntries: JournalEntry[] = [
  {
    actionPlanTomorrow:
      "Trade only after liquidity sweep + market structure shift. Skip every mid-range impulse.",
    confidenceRating: 8,
    date: "2026-04-13",
    emotion: "focused",
    freeText:
      "The plan felt clear in the morning. I did not need more information, just better patience around NY open. The best work happened when I ignored low-quality movement and waited for displacement.",
    id: "journal-01",
    lessonLearned: "Bias becomes useful only when paired with exact invalidation.",
    marketObservations:
      "Asia built the range, London took one side, NY respected the opposite liquidity.",
    mistakes: "Almost forced an early entry before confirmation.",
    relatedResourceIds: ["resource-01"],
    relatedScreenshotIds: ["shot-eurusd-before"],
    relatedTradeIds: ["trade-01"],
    strategyPracticed: "Liquidity sweep into continuation",
    summary: "Strong patience, one near-mistake, bias handling improving.",
    tags: ["liquidity", "discipline", "ny-session"],
    title: "Held back until confirmation",
    userId: "user-sumanth",
    visibility: "shared",
  },
  {
    actionPlanTomorrow:
      "Review screenshots before live execution and label invalid entries.",
    confidenceRating: 6,
    date: "2026-04-13",
    emotion: "hesitant",
    freeText:
      "Work compressed the study window, so the evening review needs to stay protected. I noticed hesitation comes from not trusting the risk cap, not from lack of setup knowledge.",
    id: "journal-02",
    lessonLearned:
      "Reduced confidence usually means the plan was not rehearsed enough.",
    marketObservations:
      "Momentum was clean after the open, but I spent too long waiting for the perfect candle.",
    mistakes: "Delayed execution on the best setup.",
    relatedResourceIds: ["resource-03"],
    relatedScreenshotIds: [],
    relatedTradeIds: ["trade-04"],
    strategyPracticed: "Opening range rejection",
    summary: "Good read, slow trigger, needs more deliberate rehearsal.",
    tags: ["confidence", "execution", "review"],
    title: "Hesitation came from weak rehearsal",
    userId: "user-chandan",
    visibility: "shared",
  },
  {
    actionPlanTomorrow:
      "Mark the BOS and pullback zones before watching any recap.",
    confidenceRating: 7,
    date: "2026-04-11",
    emotion: "disciplined",
    freeText:
      "The notes finally feel compact. When the chart is already marked up, the replay becomes much easier to understand and much harder to overcomplicate.",
    id: "journal-03",
    lessonLearned: "Pre-marked charts reduce reactive note taking.",
    marketObservations:
      "NQ kept punishing early shorts until the session high was swept cleanly.",
    mistakes: "Ignored the higher-timeframe premium zone on the first pass.",
    relatedResourceIds: ["resource-02"],
    relatedScreenshotIds: ["shot-journal-markup"],
    relatedTradeIds: ["trade-05"],
    strategyPracticed: "BOS + premium discount framing",
    summary: "Chart preparation made the whole session calmer.",
    tags: ["market-structure", "markup", "prep"],
    title: "Prep removed most of the noise",
    userId: "user-sumanth",
    visibility: "shared",
  },
  {
    actionPlanTomorrow:
      "Lock the study block on the calendar before the work shift starts.",
    confidenceRating: 5,
    date: "2026-04-10",
    emotion: "stressed",
    freeText:
      "I felt rushed through the whole evening because I started late. Once the session was compressed, everything turned reactive. The solution is scheduling, not more effort.",
    id: "journal-04",
    lessonLearned: "Consistency problems are often planning problems first.",
    marketObservations:
      "By the time I opened the replay, the best move was already gone and I started chasing examples.",
    mistakes: "Tried to cover too much material in one sitting.",
    relatedResourceIds: ["resource-04"],
    relatedScreenshotIds: [],
    relatedTradeIds: [],
    strategyPracticed: "Risk review",
    summary:
      "Low-quality session caused by late start and poor scope control.",
    tags: ["consistency", "scheduling", "review"],
    title: "Started late and paid for it",
    userId: "user-chandan",
    visibility: "personal",
  },
];

const notes: NoteItem[] = [
  {
    bodyHtml:
      "<h3>London Sweep Checklist</h3><ul><li>Map previous day high/low.</li><li>Wait for displacement after the sweep.</li><li>Entry only on reclaim or confirmed pullback.</li></ul><p>Risk stays fixed at 0.5R until two clean executions in a row.</p>",
    category: "Setup notes",
    favorite: true,
    folder: "Execution",
    id: "note-01",
    pinned: true,
    tags: ["london", "liquidity", "checklist"],
    title: "London sweep continuation",
    updatedAt: "2026-04-13T08:30:00.000Z",
    versions: [
      {
        changedAt: "2026-04-10T19:10:00.000Z",
        changedBy: "user-sumanth",
        summary: "Initial checklist",
      },
      {
        changedAt: "2026-04-13T08:30:00.000Z",
        changedBy: "user-sumanth",
        summary: "Added reduced risk rule",
      },
    ],
  },
  {
    bodyHtml:
      "<h3>Psychology Rule</h3><p>Hesitation is usually missing rehearsal, not missing knowledge.</p><blockquote>Rehearse the setup, then trust the stop.</blockquote>",
    category: "Psychology notes",
    favorite: false,
    folder: "Mindset",
    id: "note-02",
    pinned: true,
    tags: ["psychology", "hesitation"],
    title: "Trust the risk cap",
    updatedAt: "2026-04-12T21:00:00.000Z",
    versions: [
      {
        changedAt: "2026-04-09T20:15:00.000Z",
        changedBy: "user-chandan",
        summary: "Added hesitation reframing",
      },
    ],
  },
  {
    bodyHtml:
      "<h3>Risk Management</h3><p>Daily stop rules:</p><ol><li>2 full losses ends live trading.</li><li>Third setup can only be demo replay.</li><li>Journal before any reset.</li></ol>",
    category: "Risk management notes",
    favorite: true,
    folder: "Risk",
    id: "note-03",
    pinned: false,
    tags: ["risk", "discipline", "rules"],
    title: "Daily stop protocol",
    updatedAt: "2026-04-11T22:20:00.000Z",
    versions: [
      {
        changedAt: "2026-04-11T22:20:00.000Z",
        changedBy: "user-sumanth",
        summary: "Version 1",
      },
    ],
  },
  {
    bodyHtml:
      "<h3>Revision Deck</h3><p>Repeat these every Sunday:</p><ul><li>Confluence checklist</li><li>Most missed task categories</li><li>Best-performing day review</li></ul>",
    category: "Revision notes",
    favorite: false,
    folder: "Weekly reset",
    id: "note-04",
    pinned: false,
    tags: ["revision", "weekly"],
    title: "Sunday reset template",
    updatedAt: "2026-04-08T18:00:00.000Z",
    versions: [
      {
        changedAt: "2026-04-08T18:00:00.000Z",
        changedBy: "user-chandan",
        summary: "Created template",
      },
    ],
  },
];

const resources: ResourceItem[] = [
  {
    assignedTo: "user-sumanth",
    durationMinutes: 38,
    id: "resource-01",
    keyTakeaways: [
      "Wait for the external liquidity sweep before bias confirmation.",
      "Refine invalidation before the pullback starts.",
    ],
    link: "https://youtube.com/watch?v=ict-liquidity-recap",
    notes: "Best timestamp starts around the NY open segment.",
    sourceType: "youtube",
    status: "completed",
    summary:
      "Short recap on liquidity sweeps, displacement, and pullback timing.",
    tags: ["liquidity", "execution", "recap"],
    title: "ICT liquidity sweep recap",
    watchedDate: "2026-04-13",
  },
  {
    assignedTo: "user-sumanth",
    durationMinutes: 64,
    id: "resource-02",
    keyTakeaways: [
      "Mark BOS first, then ask if the zone is tradable.",
      "Context is more important than candle pattern memory.",
    ],
    link: "https://youtube.com/watch?v=market-structure-lab",
    notes: "Useful for Saturday review.",
    sourceType: "mentor-video",
    status: "completed",
    summary:
      "Deep dive on market structure, BOS, CHoCH, and premium/discount context.",
    tags: ["structure", "bos", "context"],
    title: "Market structure lab",
    watchedDate: "2026-04-11",
  },
  {
    assignedTo: "user-chandan",
    durationMinutes: 26,
    id: "resource-03",
    keyTakeaways: [
      "Execution speed improves when entries are rehearsed in advance.",
      "Confidence rating should track process, not outcome.",
    ],
    link: "https://youtube.com/watch?v=confidence-and-risk",
    notes: "Convert this into a nightly checklist.",
    sourceType: "youtube",
    status: "in_progress",
    summary:
      "Trading confidence framework tied to process quality and rehearsal.",
    tags: ["confidence", "risk", "process"],
    title: "Confidence without forcing trades",
    watchedDate: null,
  },
  {
    assignedTo: "user-chandan",
    durationMinutes: 18,
    id: "resource-04",
    keyTakeaways: [
      "Smaller task lists improve consistency.",
      "Time blocking matters more than motivation.",
    ],
    link: "https://example.com/article/consistency-for-traders",
    notes: "Good support piece for planner discipline.",
    sourceType: "article",
    status: "completed",
    summary:
      "Article on creating repeatable learning routines for active traders.",
    tags: ["consistency", "planning"],
    title: "Routine beats intensity",
    watchedDate: "2026-04-10",
  },
  {
    assignedTo: "user-sumanth",
    durationMinutes: 12,
    id: "resource-05",
    keyTakeaways: [
      "Review setups using the same sequence every time.",
      "Do not rewrite the playbook during a losing streak.",
    ],
    link: "https://example.com/files/trade-playbook.pdf",
    notes: "Pinned as the main revision sheet.",
    sourceType: "pdf",
    status: "completed",
    summary:
      "Compact PDF template for reviewing setups, psychology, and risk adherence.",
    tags: ["playbook", "review", "pdf"],
    title: "Trade review playbook",
    watchedDate: "2026-04-09",
  },
];

const trades: TradeRecord[] = [
  {
    afterScreenshotId: "shot-eurusd-after",
    beforeScreenshotId: "shot-eurusd-before",
    confluenceChecklist: [
      "Daily bias aligned",
      "Liquidity sweep",
      "Displacement candle",
    ],
    date: "2026-04-13",
    entry: 1.0832,
    exit: 1.0851,
    followedPlan: true,
    id: "trade-01",
    instrument: "EURUSD",
    lessonLearned:
      "Entry quality improves when the stop is mapped before the pullback begins.",
    mode: "live",
    mistakes: "None. Could have held the final piece slightly longer.",
    pnl: 124.5,
    positionSize: 0.5,
    psychology: "Calm, patient, no urge to add size.",
    reasonForEntry: "Sweep of Asia low into NY displacement and reclaim.",
    reasonForExit: "Scaled at 2R, final exit into opposing liquidity.",
    result: "win",
    riskReward: 2.4,
    setupType: "Liquidity sweep continuation",
    side: "buy",
    stopLoss: 1.0824,
    tags: ["a-plus", "ny", "liquidity"],
    target: 1.0852,
    time: "10:18",
    userId: "user-sumanth",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: ["Range high", "Opening rejection"],
    date: "2026-04-13",
    entry: 22124,
    exit: 22108,
    followedPlan: false,
    id: "trade-02",
    instrument: "NQ",
    lessonLearned:
      "The setup idea was okay, but the entry came before confirmation.",
    mode: "demo",
    mistakes: "Shorted before the displacement candle printed.",
    pnl: -42,
    positionSize: 1,
    psychology: "Impatient after missing the first clean move.",
    reasonForEntry: "Expected rejection from the session high.",
    reasonForExit: "Stop hit after continuation higher.",
    result: "loss",
    riskReward: -1,
    setupType: "Opening range rejection",
    side: "sell",
    stopLoss: 22130,
    tags: ["demo", "impatience"],
    target: 22096,
    time: "10:41",
    userId: "user-chandan",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: ["Higher timeframe bias", "Premium zone tap"],
    date: "2026-04-12",
    entry: 21982,
    exit: 22036,
    followedPlan: true,
    id: "trade-03",
    instrument: "NQ",
    lessonLearned:
      "The slowest entries were still profitable when the context stayed clean.",
    mode: "demo",
    mistakes: "Slightly late entry but still within plan.",
    pnl: 88,
    positionSize: 1,
    psychology: "Confident and measured.",
    reasonForEntry: "Pullback into premium after BOS.",
    reasonForExit: "Target hit near liquidity pool.",
    result: "win",
    riskReward: 2.2,
    setupType: "BOS pullback",
    side: "buy",
    stopLoss: 21956,
    tags: ["structure", "demo", "bos"],
    target: 22038,
    time: "09:58",
    userId: "user-sumanth",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: ["News flush", "VWAP reclaim"],
    date: "2026-04-12",
    entry: 532.4,
    exit: 531.8,
    followedPlan: true,
    id: "trade-04",
    instrument: "SPY",
    lessonLearned:
      "The setup worked, but the trigger needed to be quicker.",
    mode: "live",
    mistakes: "Hesitated on the add-on.",
    pnl: 36,
    positionSize: 10,
    psychology: "Cautious but controlled.",
    reasonForEntry: "VWAP reclaim after the flush.",
    reasonForExit:
      "Flattened into resistance instead of holding for full target.",
    result: "win",
    riskReward: 1.2,
    setupType: "VWAP reclaim",
    side: "buy",
    stopLoss: 531.2,
    tags: ["live", "vwap"],
    target: 533.1,
    time: "11:05",
    userId: "user-chandan",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: "shot-nq-demo",
    confluenceChecklist: [
      "Daily high",
      "Displacement lower",
      "Failed reclaim",
    ],
    date: "2026-04-11",
    entry: 22094,
    exit: 22054,
    followedPlan: true,
    id: "trade-05",
    instrument: "NQ",
    lessonLearned: "The chart markup made the execution feel obvious.",
    mode: "demo",
    mistakes: "Could have taken partials sooner.",
    pnl: 72,
    positionSize: 1,
    psychology: "Clear and decisive.",
    reasonForEntry: "Failed reclaim after the high sweep.",
    reasonForExit: "Target hit into support.",
    result: "win",
    riskReward: 2,
    setupType: "Liquidity fade",
    side: "sell",
    stopLoss: 22114,
    tags: ["fade", "demo", "markup"],
    target: 22054,
    time: "10:12",
    userId: "user-sumanth",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: ["Range low", "No displacement"],
    date: "2026-04-10",
    entry: 1.081,
    exit: 1.0801,
    followedPlan: false,
    id: "trade-06",
    instrument: "EURUSD",
    lessonLearned:
      "No confirmation means no trade, even if the bias feels obvious.",
    mode: "live",
    mistakes: "Entered before reclaim and widened the stop mentally.",
    pnl: -68,
    positionSize: 0.4,
    psychology: "Rushed because the session was already moving.",
    reasonForEntry: "Tried to front-run the sweep reversal.",
    reasonForExit: "Stopped out.",
    result: "loss",
    riskReward: -1,
    setupType: "Sweep reversal",
    side: "buy",
    stopLoss: 1.0799,
    tags: ["loss", "rush"],
    target: 1.0832,
    time: "09:44",
    userId: "user-chandan",
  },
  {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: ["HTF level", "Patience"],
    date: "2026-04-09",
    entry: 521.6,
    exit: 521.6,
    followedPlan: true,
    id: "trade-07",
    instrument: "SPY",
    lessonLearned:
      "Breakeven exits are still good outcomes when the setup loses momentum.",
    mode: "demo",
    mistakes: "None. Managed to flat before chop.",
    pnl: 0,
    positionSize: 8,
    psychology: "Neutral.",
    reasonForEntry: "Test of the level after opening drive.",
    reasonForExit: "No follow-through.",
    result: "breakeven",
    riskReward: 0,
    setupType: "Opening pullback",
    side: "buy",
    stopLoss: 520.9,
    tags: ["breakeven", "discipline"],
    target: 522.8,
    time: "10:07",
    userId: "user-sumanth",
  },
];

const reminders: ReminderItem[] = [
  {
    channel: "dashboard",
    date: "2026-04-13",
    id: "rem-01",
    message: "Finish both journal entries before 10:30 PM.",
    recurring: true,
    status: "due",
    targetType: "journal",
    time: "22:05",
  },
  {
    channel: "dashboard",
    date: "2026-04-13",
    id: "rem-02",
    message: "Upload live or demo screenshot after the first trade.",
    recurring: true,
    status: "due",
    targetType: "review",
    time: "11:20",
  },
  {
    channel: "push",
    date: "2026-04-13",
    id: "rem-03",
    message: "Chandan evening revision block starts in 15 minutes.",
    recurring: true,
    status: "due",
    targetType: "study",
    time: "19:00",
  },
  {
    channel: "email",
    date: "2026-04-12",
    id: "rem-04",
    message: "Planner was not finalized before the session started.",
    recurring: false,
    status: "missed",
    targetType: "task",
    time: "07:35",
  },
];

function buildAttendance() {
  const days = eachDayOfInterval({
    end: parseISO(CURRENT_DATE),
    start: subDays(parseISO(CURRENT_DATE), 29),
  });

  return days.flatMap((day, dayIndex) =>
    users.map((user, userIndex) => {
      const checkedIn = (dayIndex + userIndex) % 6 !== 0;
      const completedLearningTasks = (dayIndex + userIndex) % 5 !== 0;
      const journalSubmitted = (dayIndex + userIndex) % 4 !== 0;
      const reviewLogged = (dayIndex + userIndex) % 7 !== 0;
      const score =
        Number(checkedIn) * 30 +
        Number(completedLearningTasks) * 30 +
        Number(journalSubmitted) * 20 +
        Number(reviewLogged) * 20;

      return {
        checkedIn,
        completedLearningTasks,
        date: format(day, "yyyy-MM-dd"),
        id: `attendance-${user.id}-${format(day, "yyyyMMdd")}`,
        journalSubmitted,
        reviewLogged,
        score,
        userId: user.id,
      } satisfies AttendanceRecord;
    }),
  );
}

function buildCalendarEvents() {
  const taskEvents = tasks.map((task) => ({
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
  })) satisfies CalendarEvent[];

  const tradeEvents = trades.map((trade) => ({
    date: trade.date,
    endTime: trade.time,
    id: `cal-${trade.id}`,
    label: `${trade.instrument} ${trade.mode} ${trade.result}`,
    ownerId: trade.userId,
    startTime: trade.time,
    tone:
      trade.result === "win"
        ? "emerald"
        : trade.result === "loss"
          ? "rose"
          : "amber",
    type: "trade",
  })) satisfies CalendarEvent[];

  return [...taskEvents, ...tradeEvents];
}

export const workspaceSeed: WorkspaceSeed = {
  activeUserId: "user-sumanth",
  attachments: baseAttachments,
  attendance: buildAttendance(),
  calendarEvents: buildCalendarEvents(),
  currentDate: CURRENT_DATE,
  journalEntries,
  notes,
  reminders,
  resources,
  tasks,
  trades,
  users,
  workspaceName: "TradeTrack Shared Desk",
};

export type WorkspaceSummary = {
  activeUser: WorkspaceUser;
  averageConfidence: number;
  completionRate: number;
  consistencyAverage: number;
  demoTrades: number;
  learningHours: number;
  liveTrades: number;
  notesAdded: number;
  pendingTasks: number;
  personalCompleted: number;
  totalTasks: number;
  videosWatched: number;
  winLossLabel: string;
};

export function getUser(seed: WorkspaceSeed, userId: string) {
  return seed.users.find((user) => user.id === userId) ?? seed.users[0];
}

export function getTasksForDate(seed: WorkspaceSeed, date: string) {
  return seed.tasks
    .filter((task) => task.date === date)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
}

export function getJournalForDate(seed: WorkspaceSeed, date: string) {
  return seed.journalEntries.filter((entry) => entry.date === date);
}

export function getTradesForDate(seed: WorkspaceSeed, date: string) {
  return seed.trades.filter((trade) => trade.date === date);
}

export function getDateLabel(date: string) {
  return format(parseISO(date), "EEE, MMM d");
}

export function getTaskStatusOptions() {
  return ["pending", "in_progress", "completed", "skipped"] as const;
}

export function createEmptyTask(date: string, userId: string): PlannerTask {
  return {
    assignedTo: userId,
    attachments: [],
    category: "learning",
    date,
    description: "",
    endTime: "09:00",
    estimatedMinutes: 30,
    id: `task-${crypto.randomUUID()}`,
    links: [],
    notes: "",
    priority: "medium",
    proof: "",
    startTime: "08:30",
    status: "pending",
    title: "",
  };
}

export function createEmptyJournal(date: string, userId: string): JournalEntry {
  return {
    actionPlanTomorrow: "",
    confidenceRating: 7,
    date,
    emotion: "focused",
    freeText: "",
    id: `journal-${crypto.randomUUID()}`,
    lessonLearned: "",
    marketObservations: "",
    mistakes: "",
    relatedResourceIds: [],
    relatedScreenshotIds: [],
    relatedTradeIds: [],
    strategyPracticed: "",
    summary: "",
    tags: [],
    title: "",
    userId,
    visibility: "shared",
  };
}

export function createEmptyTrade(date: string, userId: string): TradeRecord {
  return {
    afterScreenshotId: null,
    beforeScreenshotId: null,
    confluenceChecklist: [],
    date,
    entry: 0,
    exit: 0,
    followedPlan: true,
    id: `trade-${crypto.randomUUID()}`,
    instrument: "",
    lessonLearned: "",
    mode: "demo",
    mistakes: "",
    pnl: 0,
    positionSize: 1,
    psychology: "",
    reasonForEntry: "",
    reasonForExit: "",
    result: "breakeven",
    riskReward: 0,
    setupType: "",
    side: "buy",
    stopLoss: 0,
    tags: [],
    target: 0,
    time: "10:00",
    userId,
  };
}

export function createEmptyResource(userId: string): ResourceItem {
  return {
    assignedTo: userId,
    durationMinutes: 20,
    id: `resource-${crypto.randomUUID()}`,
    keyTakeaways: [],
    link: "",
    notes: "",
    sourceType: "youtube",
    status: "not_started",
    summary: "",
    tags: [],
    title: "",
    watchedDate: null,
  };
}

export function createEmptyNote(): NoteItem {
  return {
    bodyHtml: "<p>Capture the setup, rule, or lesson here.</p>",
    category: "Strategy notes",
    favorite: false,
    folder: "Inbox",
    id: `note-${crypto.randomUUID()}`,
    pinned: false,
    tags: [],
    title: "",
    updatedAt: new Date().toISOString(),
    versions: [],
  };
}

export function createAttachment(
  name: string,
  linkedType?: AttachmentTargetType,
): WorkspaceAttachment {
  return {
    caption: "Uploaded from the quick add panel",
    id: `attachment-${crypto.randomUUID()}`,
    linkedType,
    name,
    tone: "cyan",
    type: "image",
  };
}

export function getWeekSeries(seed: WorkspaceSeed) {
  const end = parseISO(seed.currentDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = format(subDays(end, 6 - index), "yyyy-MM-dd");
    const completed = seed.tasks.filter(
      (task) => task.date === date && task.status === "completed",
    ).length;
    const planned = seed.tasks.filter((task) => task.date === date).length;
    const learningHours =
      seed.tasks
        .filter(
          (task) =>
            task.date === date &&
            (task.category === "learning" || task.category === "revision"),
        )
        .reduce((sum, task) => sum + task.estimatedMinutes, 0) / 60;

    return {
      completed,
      date,
      label: format(parseISO(date), "EEE"),
      learningHours,
      planned,
    };
  });
}

export function getMonthlyHeatmap(seed: WorkspaceSeed, userId: string) {
  const monthStart = startOfMonth(parseISO(seed.currentDate));
  const monthEnd = addMonths(monthStart, 1);
  const days = eachDayOfInterval({
    end: subDays(monthEnd, 1),
    start: monthStart,
  });

  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const row = seed.attendance.find(
      (item) => item.userId === userId && item.date === key,
    );

    return {
      date: key,
      day: format(day, "d"),
      score: row?.score ?? 0,
      weekday: format(day, "EEE"),
    };
  });
}

export function getTaskBreakdown(seed: WorkspaceSeed) {
  const groups = new Map<string, { completed: number; total: number }>();

  for (const task of seed.tasks) {
    const current = groups.get(task.category) ?? { completed: 0, total: 0 };
    current.total += 1;
    current.completed += Number(task.status === "completed");
    groups.set(task.category, current);
  }

  return [...groups.entries()].map(([label, value]) => ({
    completion: value.total ? (value.completed / value.total) * 100 : 0,
    label,
    ...value,
  }));
}

export function getSetupUsage(seed: WorkspaceSeed) {
  const groups = new Map<string, { count: number; pnl: number; wins: number }>();

  for (const trade of seed.trades) {
    const current = groups.get(trade.setupType) ?? { count: 0, pnl: 0, wins: 0 };
    current.count += 1;
    current.pnl += trade.pnl;
    current.wins += Number(trade.result === "win");
    groups.set(trade.setupType, current);
  }

  return [...groups.entries()]
    .map(([label, value]) => ({
      count: value.count,
      label,
      pnl: value.pnl,
      winRate: (value.wins / value.count) * 100,
    }))
    .sort((left, right) => right.count - left.count);
}

export function getMoodTrend(seed: WorkspaceSeed) {
  return seed.journalEntries
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((entry) => ({
      date: entry.date,
      label: format(parseISO(entry.date), "MMM d"),
      mood:
        entry.emotion === "confident"
          ? 9
          : entry.emotion === "focused"
            ? 8
            : entry.emotion === "disciplined"
              ? 7
              : entry.emotion === "neutral"
                ? 5
                : entry.emotion === "hesitant"
                  ? 4
                  : 3,
      userId: entry.userId,
    }));
}

export function getMistakeFrequency(seed: WorkspaceSeed) {
  const groups = new Map<string, number>();

  for (const trade of seed.trades) {
    for (const phrase of trade.mistakes.split(/[.,]/).map((value) => value.trim())) {
      if (!phrase) {
        continue;
      }

      groups.set(phrase, (groups.get(phrase) ?? 0) + 1);
    }
  }

  return [...groups.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);
}

export function getSharedVsPersonalCompletion(seed: WorkspaceSeed) {
  return seed.users.map((user) => {
    const personalTasks = seed.tasks.filter((task) => task.assignedTo === user.id);
    const completed = personalTasks.filter((task) => task.status === "completed").length;
    return {
      completed,
      label: user.name,
      total: personalTasks.length,
    };
  });
}

export function summarizeWorkspace(
  seed: WorkspaceSeed,
  userId: string,
): WorkspaceSummary {
  const activeUser = getUser(seed, userId);
  const personalTasks = seed.tasks.filter((task) => task.assignedTo === userId);
  const completedTasks = personalTasks.filter((task) => task.status === "completed");
  const pendingTasks = seed.tasks.filter(
    (task) => task.date === seed.currentDate && task.status !== "completed",
  ).length;
  const tradesByUser = seed.trades.filter((trade) => trade.userId === userId);
  const wins = tradesByUser.filter((trade) => trade.result === "win").length;
  const losses = tradesByUser.filter((trade) => trade.result === "loss").length;
  const attendanceRows = seed.attendance.filter((row) => row.userId === userId);
  const journals = seed.journalEntries.filter((entry) => entry.userId === userId);
  const averageConfidence =
    journals.reduce((sum, entry) => sum + entry.confidenceRating, 0) /
    Math.max(journals.length, 1);

  return {
    activeUser,
    averageConfidence,
    completionRate: personalTasks.length
      ? (completedTasks.length / personalTasks.length) * 100
      : 0,
    consistencyAverage:
      attendanceRows.reduce((sum, row) => sum + row.score, 0) /
      Math.max(attendanceRows.length, 1),
    demoTrades: tradesByUser.filter((trade) => trade.mode === "demo").length,
    learningHours:
      seed.resources
        .filter(
          (resource) =>
            resource.assignedTo === userId && resource.status === "completed",
        )
        .reduce((sum, resource) => sum + resource.durationMinutes, 0) / 60,
    liveTrades: tradesByUser.filter((trade) => trade.mode === "live").length,
    notesAdded: seed.notes.filter((note) =>
      note.versions.some((version) => version.changedBy === userId),
    ).length,
    pendingTasks,
    personalCompleted: completedTasks.length,
    totalTasks: personalTasks.length,
    videosWatched: seed.resources.filter(
      (resource) =>
        resource.assignedTo === userId &&
        resource.status === "completed" &&
        (resource.sourceType === "youtube" ||
          resource.sourceType === "mentor-video"),
    ).length,
    winLossLabel: `${wins}W / ${losses}L`,
  };
}

export function getAttendanceStreak(seed: WorkspaceSeed, userId: string) {
  const rows = seed.attendance
    .filter((row) => row.userId === userId)
    .sort((left, right) => right.date.localeCompare(left.date));

  let streak = 0;

  for (const row of rows) {
    if (!row.checkedIn) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function getMostMissedCategories(seed: WorkspaceSeed) {
  const groups = new Map<string, number>();

  for (const task of seed.tasks) {
    if (task.status !== "skipped" && task.status !== "overdue") {
      continue;
    }

    groups.set(task.category, (groups.get(task.category) ?? 0) + 1);
  }

  return [...groups.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((left, right) => right.count - left.count);
}

export function getProductiveTimeOfDay(seed: WorkspaceSeed) {
  const buckets = new Map<string, number>();

  for (const task of seed.tasks.filter((item) => item.status === "completed")) {
    const hour = Number(task.startTime.split(":")[0] ?? "0");
    const label =
      hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night";
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((left, right) => right.count - left.count);
}

export function getBestPerformingDays(seed: WorkspaceSeed) {
  const groups = new Map<string, number>();

  for (const trade of seed.trades) {
    groups.set(trade.date, (groups.get(trade.date) ?? 0) + trade.pnl);
  }

  return [...groups.entries()]
    .map(([date, pnl]) => ({
      date,
      label: format(parseISO(date), "MMM d"),
      pnl,
    }))
    .sort((left, right) => right.pnl - left.pnl)
    .slice(0, 5);
}

export function searchWorkspace(seed: WorkspaceSeed, query: string): ActivitySearchResult[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const results: ActivitySearchResult[] = [];

  for (const task of seed.tasks) {
    if (`${task.title} ${task.description}`.toLowerCase().includes(normalized)) {
      results.push({
        id: task.id,
        route: "/planner",
        subtitle: `${getDateLabel(task.date)} • ${task.status.replace("_", " ")}`,
        title: task.title,
        type: "Task",
      });
    }
  }

  for (const note of seed.notes) {
    if (`${note.title} ${note.folder} ${note.category}`.toLowerCase().includes(normalized)) {
      results.push({
        id: note.id,
        route: "/notes",
        subtitle: `${note.folder} • ${note.category}`,
        title: note.title,
        type: "Note",
      });
    }
  }

  for (const journal of seed.journalEntries) {
    if (
      `${journal.title} ${journal.summary} ${journal.tags.join(" ")}`
        .toLowerCase()
        .includes(normalized)
    ) {
      results.push({
        id: journal.id,
        route: "/journal",
        subtitle: `${getDateLabel(journal.date)} • ${getUser(seed, journal.userId).name}`,
        title: journal.title,
        type: "Journal",
      });
    }
  }

  for (const resource of seed.resources) {
    if (`${resource.title} ${resource.tags.join(" ")}`.toLowerCase().includes(normalized)) {
      results.push({
        id: resource.id,
        route: "/resources",
        subtitle: `${resource.sourceType} • ${resource.status.replace("_", " ")}`,
        title: resource.title,
        type: "Resource",
      });
    }
  }

  for (const trade of seed.trades) {
    if (
      `${trade.instrument} ${trade.setupType} ${trade.tags.join(" ")}`
        .toLowerCase()
        .includes(normalized)
    ) {
      results.push({
        id: trade.id,
        route: "/trades",
        subtitle: `${trade.date} • ${trade.mode} • ${trade.result}`,
        title: `${trade.instrument} ${trade.setupType}`,
        type: "Trade",
      });
    }
  }

  return results.slice(0, 8);
}

export function getDayEvents(seed: WorkspaceSeed, date: string) {
  return seed.calendarEvents
    .filter((event) => event.date === date)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
}

export function getMonthMatrix(seed: WorkspaceSeed) {
  const monthStart = startOfMonth(parseISO(seed.currentDate));
  const firstCell = subDays(monthStart, monthStart.getDay());
  const days = Array.from({ length: 35 }, (_, index) => addDays(firstCell, index));

  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      date: key,
      events: getDayEvents(seed, key),
      inCurrentMonth: isSameDay(startOfMonth(parseISO(key)), monthStart),
      label: format(day, "d"),
    };
  });
}
