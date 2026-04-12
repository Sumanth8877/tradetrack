import authUsers from "../../config/auth-users.json";

type AuthUser = {
  aliases?: string[];
  email: string;
  username: string;
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

export function getAllowedUsernames() {
  return authUsers.map((user) => user.username);
}
