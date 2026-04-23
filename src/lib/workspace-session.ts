import { cache } from "react";
import { headers } from "next/headers";

import { getAuthUserBySupabaseUser } from "@/lib/auth-users";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { readWorkspaceAuthHeaders } from "@/lib/workspace-auth-headers";

export type WorkspaceSession = {
  displayName: string;
  username: string;
  workspaceUserId: string;
};

type WorkspaceAuthState =
  | {
      status: "authenticated";
      session: WorkspaceSession;
    }
  | {
      status: "signed_out";
    }
  | {
      status: "unconfigured";
    };

export const getWorkspaceAuthState = cache(
  async (): Promise<WorkspaceAuthState> => {
    if (!hasSupabaseEnv()) {
      return { status: "unconfigured" };
    }

    const requestHeaders = await headers();
    const headerAuthState = readWorkspaceAuthHeaders(requestHeaders);

    if (headerAuthState?.status === "authenticated") {
      return {
        session: headerAuthState.session,
        status: "authenticated",
      };
    }

    if (headerAuthState?.status === "signed_out") {
      return { status: "signed_out" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (error.name !== "AuthSessionMissingError") {
        console.error("Workspace session lookup failed", error);
      }

      return { status: "signed_out" };
    }

    if (!user) {
      return { status: "signed_out" };
    }

    const authUser = getAuthUserBySupabaseUser(user);

    if (!authUser) {
      console.error("Supabase session user is not mapped to a workspace user", {
        email: user.email ?? null,
      });

      return { status: "signed_out" };
    }

    return {
      status: "authenticated",
      session: {
        displayName: authUser.displayName,
        username: authUser.username,
        workspaceUserId: authUser.workspaceUserId,
      },
    };
  },
);
