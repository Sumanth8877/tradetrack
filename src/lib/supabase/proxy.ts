import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getAuthUserBySupabaseUser } from "@/lib/auth-users";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";
import {
  clearWorkspaceAuthHeaders,
  setWorkspaceAuthenticatedHeaders,
  setWorkspaceSignedOutHeaders,
} from "@/lib/workspace-auth-headers";

const SAFE_PROXY_METHODS = new Set(["GET", "HEAD"]);

type ResponseCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  partitioned?: boolean;
  path?: string;
  priority?: "high" | "low" | "medium";
  sameSite?: boolean | "lax" | "none" | "strict";
  secure?: boolean;
};

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
  let responseHeadersToSet: Record<string, string> = {};
  const responseCookiesToSet: Array<{
    name: string;
    options: ResponseCookieOptions;
    value: string;
  }> = [];

  clearWorkspaceAuthHeaders(requestHeaders);

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        requestHeaders.set("cookie", request.cookies.toString());
        responseHeadersToSet = {
          ...responseHeadersToSet,
          ...headersToSet,
        };

        cookiesToSet.forEach(({ name, options, value }) => {
          responseCookiesToSet.push({ name, options, value });
        });
      },
    },
  });

  try {
    // Supabase SSR expects the middleware/proxy refresh path to initialize
    // the session with getUser() so refreshed cookies are written back safely.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const authUser = user ? getAuthUserBySupabaseUser(user) : null;

    if (authUser) {
      setWorkspaceAuthenticatedHeaders(requestHeaders, {
        session: {
          displayName: authUser.displayName,
          username: authUser.username,
          workspaceUserId: authUser.workspaceUserId,
        },
        status: "authenticated",
      });
    } else {
      setWorkspaceSignedOutHeaders(requestHeaders);
    }
  } catch (error) {
    console.error("Supabase session refresh failed in proxy", error);
    setWorkspaceSignedOutHeaders(requestHeaders);
  }

  const response = createNextResponse(requestHeaders);

  Object.entries(responseHeadersToSet).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  responseCookiesToSet.forEach(({ name, options, value }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
