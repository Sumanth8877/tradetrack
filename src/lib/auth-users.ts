import authUsers from "../../config/auth-users.json";

export type AuthUser = {
  aliases?: string[];
  displayName: string;
  email: string;
  username: string;
  workspaceUserId: string;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function getAuthUserByUsername(username: string): AuthUser | null {
  const normalizedUsername = normalizeUsername(username);

  return (
    authUsers.find(
      (user) =>
        normalizeUsername(user.username) === normalizedUsername ||
        user.aliases?.some(
          (alias) => normalizeUsername(alias) === normalizedUsername,
        ),
    ) ?? null
  );
}

export function getAuthUserByEmail(email: string): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();

  return authUsers.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export function getAuthUserBySupabaseUser(user: {
  email?: string | null;
  user_metadata?: {
    username?: unknown;
  } | null;
}) {
  if (user.email) {
    const authUser = getAuthUserByEmail(user.email);

    if (authUser) {
      return authUser;
    }
  }

  if (typeof user.user_metadata?.username === "string") {
    return getAuthUserByUsername(user.user_metadata.username);
  }

  return null;
}

export function getAllowedUsernames() {
  return authUsers.map((user) => user.username);
}
