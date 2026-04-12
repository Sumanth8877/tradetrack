import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const authUsersPath = path.join(projectRoot, "config", "auth-users.json");
const authUsers = JSON.parse(fs.readFileSync(authUsersPath, "utf8"));

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  npm run auth:create-users -- <shared-password>",
      "  npm run auth:create-users -- <username-1> <password-1> <username-2> <password-2>",
      "",
      "Configured usernames:",
      ...authUsers.map((user) => `  ${user.username}`),
      "",
      "Or set AUTH_DEFAULT_PASSWORD before running the command.",
      "",
      "Required .env.local values:",
      "  NEXT_PUBLIC_SUPABASE_URL",
      "  SUPABASE_SERVICE_ROLE_KEY",
    ].join("\n"),
  );
}

function exitWithError(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function getConfiguredUser(username) {
  const normalizedUsername = normalizeUsername(username);

  return authUsers.find(
    (user) => normalizeUsername(user.username) === normalizedUsername,
  );
}

function parseCredentials() {
  const args = process.argv.slice(2);

  if (args.length === 1) {
    return authUsers.map((user) => ({
      ...user,
      password: args[0],
    }));
  }

  if (args.length === authUsers.length * 2) {
    const credentials = [];

    for (let index = 0; index < args.length; index += 2) {
      const configuredUser = getConfiguredUser(args[index]);

      if (!configuredUser) {
        exitWithError(`Unknown username: ${args[index]}.`);
      }

      credentials.push({
        ...configuredUser,
        password: args[index + 1],
      });
    }

    return credentials;
  }

  if (process.env.AUTH_DEFAULT_PASSWORD) {
    return authUsers.map((user) => ({
      ...user,
      password: process.env.AUTH_DEFAULT_PASSWORD,
    }));
  }

  printUsage();
  process.exit(1);
}

function validateCredentials(credentials) {
  const uniqueUsernames = new Set(
    credentials.map((credential) => normalizeUsername(credential.username)),
  );

  if (uniqueUsernames.size !== authUsers.length) {
    exitWithError("Provide exactly one password for each configured username.");
  }

  for (const credential of credentials) {
    if (credential.password.length < 8) {
      exitWithError(
        `Password for ${credential.username} must be at least 8 characters.`,
      );
    }
  }
}

async function upsertAuthUsers() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const credentials = parseCredentials();
  validateCredentials(credentials);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    exitWithError("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    exitWithError("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    exitWithError(usersError.message);
  }

  const usersByEmail = new Map(
    usersData.users
      .filter((user) => Boolean(user.email))
      .map((user) => [user.email.toLowerCase(), user]),
  );

  for (const credential of credentials) {
    const existingUser = usersByEmail.get(credential.email.toLowerCase());
    const attributes = {
      email_confirm: true,
      password: credential.password,
      user_metadata: {
        username: credential.username,
      },
    };

    if (existingUser) {
      const { error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        attributes,
      );

      if (error) {
        exitWithError(`Failed to update ${credential.username}: ${error.message}`);
      }

      console.log(`Updated existing auth user: ${credential.username}`);
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      ...attributes,
      email: credential.email,
    });

    if (error) {
      exitWithError(`Failed to create ${credential.username}: ${error.message}`);
    }

    console.log(`Created auth user: ${credential.username}`);
  }

  console.log("Auth provisioning complete.");
}

await upsertAuthUsers();
