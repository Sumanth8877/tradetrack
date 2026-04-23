import type { FlashTone } from "@/lib/types";

type FlashMessage = {
  message: string;
  title: string;
  tone: FlashTone;
};

const FLASH_MESSAGES: Record<string, FlashMessage> = {
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
    message: "Check your username and password or ask the admin to confirm the account setup.",
    title: "Sign-in failed",
    tone: "error",
  },
  login_timeout: {
    message: "The sign-in request took too long. Check your connection and try again.",
    title: "Sign-in timed out",
    tone: "error",
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
};

export function getFlashMessage(code?: string | null) {
  if (!code) {
    return null;
  }

  return FLASH_MESSAGES[code] ?? null;
}
