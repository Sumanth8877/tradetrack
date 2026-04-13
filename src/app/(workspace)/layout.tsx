import { redirect } from "next/navigation";

import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getAuthUserBySupabaseUser } from "@/lib/auth-users";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?flash=auth_required");
    }

    const authUser = getAuthUserBySupabaseUser(user);

    if (authUser) {
      session = {
        displayName: authUser.displayName,
        username: authUser.username,
        workspaceUserId: authUser.workspaceUserId,
      };
    }
  }

  return (
    <WorkspaceProvider session={session}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
