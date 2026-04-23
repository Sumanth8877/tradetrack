export const WORKSPACE_AUTH_STATUS_HEADER = "x-tradetrack-auth-status";
export const WORKSPACE_DISPLAY_NAME_HEADER = "x-tradetrack-display-name";
export const WORKSPACE_USERNAME_HEADER = "x-tradetrack-username";
export const WORKSPACE_USER_ID_HEADER = "x-tradetrack-user-id";

export type WorkspaceAuthHeaderState =
  | {
      session: {
        displayName: string;
        username: string;
        workspaceUserId: string;
      };
      status: "authenticated";
    }
  | {
      status: "signed_out";
    };

const WORKSPACE_AUTH_HEADER_NAMES = [
  WORKSPACE_AUTH_STATUS_HEADER,
  WORKSPACE_DISPLAY_NAME_HEADER,
  WORKSPACE_USERNAME_HEADER,
  WORKSPACE_USER_ID_HEADER,
] as const;

export function clearWorkspaceAuthHeaders(target: Headers) {
  for (const headerName of WORKSPACE_AUTH_HEADER_NAMES) {
    target.delete(headerName);
  }
}

export function setWorkspaceSignedOutHeaders(target: Headers) {
  clearWorkspaceAuthHeaders(target);
  target.set(WORKSPACE_AUTH_STATUS_HEADER, "signed_out");
}

export function setWorkspaceAuthenticatedHeaders(
  target: Headers,
  session: WorkspaceAuthHeaderState & { status: "authenticated" },
) {
  clearWorkspaceAuthHeaders(target);
  target.set(WORKSPACE_AUTH_STATUS_HEADER, session.status);
  target.set(WORKSPACE_DISPLAY_NAME_HEADER, session.session.displayName);
  target.set(WORKSPACE_USERNAME_HEADER, session.session.username);
  target.set(WORKSPACE_USER_ID_HEADER, session.session.workspaceUserId);
}

export function readWorkspaceAuthHeaders(
  target: Pick<Headers, "get">,
): WorkspaceAuthHeaderState | null {
  const status = target.get(WORKSPACE_AUTH_STATUS_HEADER);

  if (status === "signed_out") {
    return { status };
  }

  if (status !== "authenticated") {
    return null;
  }

  const displayName = target.get(WORKSPACE_DISPLAY_NAME_HEADER);
  const username = target.get(WORKSPACE_USERNAME_HEADER);
  const workspaceUserId = target.get(WORKSPACE_USER_ID_HEADER);

  if (!displayName || !username || !workspaceUserId) {
    return null;
  }

  return {
    session: {
      displayName,
      username,
      workspaceUserId,
    },
    status,
  };
}
