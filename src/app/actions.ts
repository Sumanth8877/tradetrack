"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { generateDailyInsightIfNeeded, generateWeeklySummary } from "@/lib/ai";
import { hasOpenAiEnv, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { toNumber, toOptionalString, toRequiredString } from "@/lib/utils";

const taskSchema = z.object({
  taskDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1).max(120),
});

const attendanceSchema = z.object({
  notes: z.string().max(400).nullable(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["present", "partial", "missed"]),
});

const tradeSchema = z.object({
  direction: z.enum(["long", "short"]),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive(),
  notes: z.string().max(1200).nullable(),
  profitLoss: z.number().finite(),
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tradeType: z.string().trim().min(1).max(60),
});

const mistakeSchema = z.object({
  mistakeType: z.string().trim().min(1).max(60),
  notes: z.string().max(800).nullable(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  severity: z.number().int().min(1).max(5),
});

async function requireSupabaseUser() {
  if (!hasSupabaseEnv()) {
    redirect("/login?flash=env_missing");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?flash=auth_required");
  }

  return { supabase, user };
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?flash=env_missing");
  }

  const email = toRequiredString(formData.get("email"));
  const password = toRequiredString(formData.get("password"));

  if (!z.string().email().safeParse(email).success || password.length < 8) {
    redirect("/login?flash=invalid_input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?flash=login_failed");
  }

  redirect("/?flash=signed_in");
}

export async function signOutAction() {
  const { supabase } = await requireSupabaseUser();
  await supabase.auth.signOut();
  redirect("/login?flash=signed_out");
}

export async function createTaskAction(formData: FormData) {
  const { supabase, user } = await requireSupabaseUser();
  const parsed = taskSchema.safeParse({
    taskDate: toRequiredString(formData.get("task_date")),
    title: toRequiredString(formData.get("title")),
  });

  if (!parsed.success) {
    redirect("/?flash=invalid_input");
  }

  const { error } = await supabase.from("tasks").insert({
    task_date: parsed.data.taskDate,
    title: parsed.data.title,
    user_id: user.id,
  });

  if (error) {
    redirect("/?flash=invalid_input");
  }

  revalidatePath("/");
  redirect("/?flash=task_saved");
}

export async function toggleTaskAction(formData: FormData) {
  const { supabase, user } = await requireSupabaseUser();
  const taskId = toRequiredString(formData.get("task_id"));
  const nextState = toRequiredString(formData.get("next_state")) === "true";

  if (!z.string().uuid().safeParse(taskId).success) {
    redirect("/?flash=invalid_input");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ is_done: nextState })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    redirect("/?flash=invalid_input");
  }

  revalidatePath("/");
  redirect("/?flash=task_toggled");
}

export async function upsertAttendanceAction(formData: FormData) {
  const { supabase, user } = await requireSupabaseUser();
  const parsed = attendanceSchema.safeParse({
    notes: toOptionalString(formData.get("notes")),
    sessionDate: toRequiredString(formData.get("session_date")),
    status: toRequiredString(formData.get("status")),
  });

  if (!parsed.success) {
    redirect("/?flash=invalid_input");
  }

  const { error } = await supabase.from("attendance_records").upsert(
    {
      notes: parsed.data.notes,
      session_date: parsed.data.sessionDate,
      status: parsed.data.status,
      user_id: user.id,
    },
    { onConflict: "user_id,session_date" },
  );

  if (error) {
    redirect("/?flash=invalid_input");
  }

  revalidatePath("/");
  redirect("/?flash=attendance_saved");
}

export async function createTradeAction(formData: FormData) {
  const { supabase, user } = await requireSupabaseUser();
  const parsed = tradeSchema.safeParse({
    direction: toRequiredString(formData.get("direction")),
    entryPrice: toNumber(formData.get("entry_price")),
    exitPrice: toNumber(formData.get("exit_price")),
    notes: toOptionalString(formData.get("notes")),
    profitLoss: toNumber(formData.get("profit_loss")),
    symbol: toRequiredString(formData.get("symbol")),
    tradeDate: toRequiredString(formData.get("traded_on")),
    tradeType: toRequiredString(formData.get("trade_type")),
  });

  if (!parsed.success) {
    redirect("/?flash=invalid_input");
  }

  let screenshotPath: string | null = null;
  const screenshot = formData.get("screenshot");

  if (screenshot instanceof File && screenshot.size > 0) {
    if (screenshot.size > 5 * 1024 * 1024 || !screenshot.type.startsWith("image/")) {
      redirect("/?flash=invalid_input");
    }

    const extension = screenshot.name.split(".").pop()?.toLowerCase() || "png";
    screenshotPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const screenshotBytes = Buffer.from(await screenshot.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("trade-screenshots")
      .upload(screenshotPath, screenshotBytes, {
        contentType: screenshot.type,
        upsert: false,
      });

    if (uploadError) {
      redirect("/?flash=upload_failed");
    }
  }

  const { error } = await supabase.from("trades").insert({
    direction: parsed.data.direction,
    entry_price: parsed.data.entryPrice,
    exit_price: parsed.data.exitPrice,
    notes: parsed.data.notes,
    profit_loss: parsed.data.profitLoss,
    screenshot_path: screenshotPath,
    symbol: parsed.data.symbol,
    trade_type: parsed.data.tradeType,
    traded_on: parsed.data.tradeDate,
    user_id: user.id,
  });

  if (error) {
    redirect("/?flash=invalid_input");
  }

  try {
    await generateDailyInsightIfNeeded(supabase, user.id);
  } catch (insightError) {
    console.error("Daily insight generation failed", insightError);
  }

  revalidatePath("/");
  redirect("/?flash=trade_saved");
}

export async function createMistakeAction(formData: FormData) {
  const { supabase, user } = await requireSupabaseUser();
  const parsed = mistakeSchema.safeParse({
    mistakeType: toRequiredString(formData.get("mistake_type")),
    notes: toOptionalString(formData.get("notes")),
    occurredOn: toRequiredString(formData.get("occurred_on")),
    severity: toNumber(formData.get("severity")),
  });

  if (!parsed.success) {
    redirect("/?flash=invalid_input");
  }

  const { error } = await supabase.from("mistakes").insert({
    mistake_type: parsed.data.mistakeType,
    notes: parsed.data.notes,
    occurred_on: parsed.data.occurredOn,
    severity: parsed.data.severity,
    trade_id: null,
    user_id: user.id,
  });

  if (error) {
    redirect("/?flash=invalid_input");
  }

  revalidatePath("/");
  redirect("/?flash=mistake_saved");
}

export async function generateWeeklySummaryAction() {
  const { supabase, user } = await requireSupabaseUser();

  if (!hasOpenAiEnv()) {
    redirect("/?flash=ai_unavailable");
  }

  const result = await generateWeeklySummary(supabase, user.id);

  if (result.status === "limited") {
    redirect("/?flash=ai_limit");
  }

  if (result.status === "skipped") {
    redirect("/?flash=no_weekly_data");
  }

  revalidatePath("/");
  redirect("/?flash=weekly_summary_saved");
}
