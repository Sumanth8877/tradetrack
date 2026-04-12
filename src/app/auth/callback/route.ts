import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/";
  const code = requestUrl.searchParams.get("code");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/login?flash=env_missing", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?flash=login_failed", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?flash=login_failed", request.url));
  }

  const redirectUrl = new URL(next, request.url);
  redirectUrl.searchParams.set("flash", "signed_in");

  return NextResponse.redirect(redirectUrl);
}
