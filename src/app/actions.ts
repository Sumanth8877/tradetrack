"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthUserByUsername } from "@/lib/auth-users";
import { DEEPSEEK_API_KEY_COOKIE } from "@/lib/deepseek-settings";
import { hasDeepSeekEnv, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { toRequiredString } from "@/lib/utils";

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
    console.error("Username sign-in failed", {
      message: error.message,
      username: authUser.username,
    });
    redirect("/login?flash=login_failed");
  }

  redirect("/?flash=signed_in");
}

export async function signOutAction() {
  const { supabase } = await requireSupabaseUser();
  const cookieStore = await cookies();

  cookieStore.set(DEEPSEEK_API_KEY_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

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
