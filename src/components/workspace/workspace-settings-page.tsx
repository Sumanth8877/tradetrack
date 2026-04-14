"use client";

import { signOutAction } from "@/app/actions";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  Button,
  EmptyState,
  Panel,
  SectionTitle,
} from "@/components/workspace/workspace-ui";

export function SettingsPage() {
  const { isSessionUserLocked } = useWorkspace();

  return (
    <div className="space-y-6">
      {isSessionUserLocked ? (
        <Panel className="max-w-xl space-y-4">
          <SectionTitle
            description="End the current workspace session from here."
            title="Account"
          />
          <form action={signOutAction}>
            <Button className="w-full" type="submit" variant="secondary">
              Logout
            </Button>
          </form>
        </Panel>
      ) : (
        <Panel className="max-w-xl">
          <EmptyState
            description="Sign in to manage this workspace session."
            title="No active account"
          />
        </Panel>
      )}
    </div>
  );
}
