import { redirect } from "next/navigation";

import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getWorkspaceAuthState } from "@/lib/workspace-session";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = await getWorkspaceAuthState();

  if (authState.status === "signed_out") {
    redirect("/login?flash=auth_required");
  }

  return (
    <WorkspaceProvider
      session={authState.status === "authenticated" ? authState.session : null}
    >
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
