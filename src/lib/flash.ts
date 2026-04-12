import type { FlashTone } from "@/lib/types";

type FlashMessage = {
  message: string;
  title: string;
  tone: FlashTone;
};

const FLASH_MESSAGES: Record<string, FlashMessage> = {
  account_created: {
    message: "Check your inbox and confirm the account before signing in.",
    title: "Account created",
    tone: "success",
  },
  ai_limit: {
    message: "TradeTrack stores AI results and caps insight generation at two runs per day.",
    title: "AI limit reached",
    tone: "info",
  },
  ai_unavailable: {
    message: "Add a valid OpenAI key to enable fresh insight generation.",
    title: "AI unavailable",
    tone: "error",
  },
  attendance_saved: {
    message: "Today's attendance checkpoint is recorded.",
    title: "Attendance updated",
    tone: "success",
  },
  auth_required: {
    message: "Sign in to access your dashboard.",
    title: "Authentication required",
    tone: "info",
  },
  env_missing: {
    message: "Add your Supabase project keys in `.env.local` to unlock auth and data sync.",
    title: "Project configuration needed",
    tone: "error",
  },
  invalid_input: {
    message: "One or more form fields were invalid. Review the inputs and try again.",
    title: "Input error",
    tone: "error",
  },
  login_failed: {
    message: "Check your credentials or confirm your email first.",
    title: "Sign-in failed",
    tone: "error",
  },
  mistake_saved: {
    message: "The mistake is saved and will be included in weekly summaries.",
    title: "Mistake logged",
    tone: "success",
  },
  no_weekly_data: {
    message: "Add trades or mistakes in the last seven days before generating a summary.",
    title: "Not enough data",
    tone: "info",
  },
  signed_in: {
    message: "Your workspace is ready.",
    title: "Signed in",
    tone: "success",
  },
  signed_out: {
    message: "Your session was closed cleanly.",
    title: "Signed out",
    tone: "info",
  },
  task_saved: {
    message: "Today's checklist was updated.",
    title: "Task saved",
    tone: "success",
  },
  task_toggled: {
    message: "Checklist progress has been refreshed.",
    title: "Task updated",
    tone: "success",
  },
  trade_saved: {
    message: "The trade is in your journal and today's dashboard has been refreshed.",
    title: "Trade logged",
    tone: "success",
  },
  upload_failed: {
    message: "The screenshot upload failed. The image may be too large or storage is not configured yet.",
    title: "Upload failed",
    tone: "error",
  },
  weekly_summary_saved: {
    message: "A fresh weekly summary is cached for the current seven-day window.",
    title: "Weekly summary ready",
    tone: "success",
  },
};

export function getFlashMessage(code?: string | null) {
  if (!code) {
    return null;
  }

  return FLASH_MESSAGES[code] ?? null;
}
