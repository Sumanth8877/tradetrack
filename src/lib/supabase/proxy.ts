import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";

const SAFE_PROXY_METHODS = new Set(["GET", "HEAD"]);

function createNextResponse(requestHeaders: Headers) {
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv() || !SAFE_PROXY_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const env = getSupabaseEnv();
  const requestHeaders = new Headers(request.headers);
  let response = createNextResponse(requestHeaders);

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        requestHeaders.set("cookie", request.cookies.toString());
        response = createNextResponse(requestHeaders);

        Object.entries(headersToSet).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch (error) {
    console.error("Supabase session refresh failed in proxy", error);
  }

  return response;
}
