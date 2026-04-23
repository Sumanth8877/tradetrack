"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthUserByUsername } from "@/lib/auth-users";
import { DEEPSEEK_API_KEY_COOKIE } from "@/lib/deepseek-settings";
import {
  hasDeepSeekEnv,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
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

const deepSeekApiKeySchema = z.object({
  apiKey: z.string().trim().min(8, "Enter a valid DeepSeek API key.").max(500),
});

type DeepSeekApiKeyActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

async function requireSupabaseUser() {
  if (!hasSupabaseEnv()) {
    redirect("/login?flash=env_missing");
  }

  const supabase = await createClient();
  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;
  } catch (error) {
    console.error("Supabase session lookup failed", error);
    redirect("/login?flash=auth_required");
  }

  if (!user) {
    redirect("/login?flash=auth_required");
  }

  return { supabase, user };
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?flash=env_missing");
  }

  const username = toRequiredString(formData.get("username"));
  const password = toRequiredString(formData.get("password"));
  const authUser = getAuthUserByUsername(username);

  if (password.length < 8) {
    redirect("/login?flash=invalid_input");
  }

  if (!authUser) {
    redirect("/login?flash=login_failed");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password,
  });

  if (error) {
    if (hasSupabaseAdminEnv()) {
      const adminSupabase = createAdminClient();
      const { data: usersData, error: usersError } =
        await adminSupabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (!usersError) {
        const existingUser = usersData.users.find(
          (user) => user.email?.toLowerCase() === authUser.email.toLowerCase(),
        );

        if (!existingUser) {
          const { error: createError } =
            await adminSupabase.auth.admin.createUser({
              email: authUser.email,
              email_confirm: true,
              password,
              user_metadata: {
                username: authUser.username,
              },
            });

          if (!createError) {
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: authUser.email,
              password,
            });

            if (!retryError) {
              redirect("/?flash=signed_in");
            }
          }
        }
      }
    }

    console.error("Username sign-in failed", {
      message: error.message,
      username: authUser.username,
    });
    redirect("/login?flash=login_failed");
  }

  redirect("/?flash=signed_in");
}

export async function resetPasswordAction(formData: FormData) {
  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    redirect("/login?flash=reset_unavailable");
  }

  const username = toRequiredString(formData.get("username"));
  const password = toRequiredString(formData.get("password"));
  const confirmPassword = toRequiredString(formData.get("confirm_password"));
  const authUser = getAuthUserByUsername(username);

  if (password.length < 8 || password !== confirmPassword) {
    redirect("/login?flash=invalid_input");
  }

  if (!authUser) {
    redirect("/login?flash=reset_failed");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    redirect("/login?flash=reset_failed");
  }

  const existingUser = data.users.find(
    (user) => user.email?.toLowerCase() === authUser.email.toLowerCase(),
  );

  if (!existingUser) {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: authUser.email,
      email_confirm: true,
      password,
      user_metadata: {
        username: authUser.username,
      },
    });

    if (createError) {
      console.error("Password reset user creation failed", createError);
      redirect("/login?flash=reset_failed");
    }

    redirect("/login?flash=password_reset");
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    existingUser.id,
    {
      password,
    },
  );

  if (updateError) {
    console.error("Password reset update failed", updateError);
    redirect("/login?flash=reset_failed");
  }

  redirect("/login?flash=password_reset");
}

export async function signOutAction() {
  const { supabase } = await requireSupabaseUser();
  await supabase.auth.signOut();
  redirect("/login?flash=signed_out");
}

export async function saveDeepSeekApiKeyAction(
  _prevState: DeepSeekApiKeyActionState,
  formData: FormData,
): Promise<DeepSeekApiKeyActionState> {
  await requireSupabaseUser();

  const parsed = deepSeekApiKeySchema.safeParse({
    apiKey: toRequiredString(formData.get("api_key")),
  });

  if (!parsed.success) {
    return {
      message:
        parsed.error.flatten().fieldErrors.apiKey?.[0] ??
        "Enter a valid DeepSeek API key.",
      status: "error",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(DEEPSEEK_API_KEY_COOKIE, parsed.data.apiKey, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/settings");
  revalidatePath("/analytics");

  return {
    message: "DeepSeek API key saved. Analytics will use it on the server.",
    status: "success",
  };
}

export async function deleteDeepSeekApiKeyAction(
  prevState: DeepSeekApiKeyActionState,
  formData: FormData,
): Promise<DeepSeekApiKeyActionState> {
  void prevState;
  void formData;

  await requireSupabaseUser();

  const cookieStore = await cookies();
  cookieStore.set(DEEPSEEK_API_KEY_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/settings");
  revalidatePath("/analytics");

  return {
    message: hasDeepSeekEnv()
      ? "Stored DeepSeek API key removed. Analytics will fall back to the server environment key."
      : "Stored DeepSeek API key removed.",
    status: "success",
  };
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
