import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
      "  npm run auth:create-users -- <email-1> <password-1> <email-2> <password-2>",
      "",
      "Or set these environment variables before running the command:",
      "  AUTH_USER_1_EMAIL",
      "  AUTH_USER_1_PASSWORD",
      "  AUTH_USER_2_EMAIL",
      "  AUTH_USER_2_PASSWORD",
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

function parseCredentials() {
  const args = process.argv.slice(2);

  if (args.length === 4) {
    return [
      { email: args[0], password: args[1] },
      { email: args[2], password: args[3] },
    ];
  }

  const envCredentials = [
    {
      email: process.env.AUTH_USER_1_EMAIL,
      password: process.env.AUTH_USER_1_PASSWORD,
    },
    {
      email: process.env.AUTH_USER_2_EMAIL,
      password: process.env.AUTH_USER_2_PASSWORD,
    },
  ];

  if (envCredentials.every((credential) => credential.email && credential.password)) {
    return envCredentials;
  }

  printUsage();
  process.exit(1);
}

function validateCredentials(credentials) {
  for (const [index, credential] of credentials.entries()) {
    const label = `user ${index + 1}`;

    if (!EMAIL_REGEX.test(credential.email)) {
      exitWithError(`Invalid email for ${label}.`);
    }

    if (credential.password.length < 8) {
      exitWithError(`Password for ${label} must be at least 8 characters.`);
    }
  }

  const uniqueEmails = new Set(
    credentials.map((credential) => credential.email.toLowerCase()),
  );

  if (uniqueEmails.size !== credentials.length) {
    exitWithError("The two auth users must have different email addresses.");
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

    if (existingUser) {
      const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
        password: credential.password,
      });

      if (error) {
        exitWithError(`Failed to update ${credential.email}: ${error.message}`);
      }

      console.log(`Updated existing auth user: ${credential.email}`);
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      email: credential.email,
      email_confirm: true,
      password: credential.password,
    });

    if (error) {
      exitWithError(`Failed to create ${credential.email}: ${error.message}`);
    }

    console.log(`Created auth user: ${credential.email}`);
  }

  console.log("Auth provisioning complete.");
}

await upsertAuthUsers();
