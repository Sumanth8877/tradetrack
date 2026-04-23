# TradeTrack

TradeTrack is a full-stack trading journal built with Next.js, Supabase, Tailwind CSS, and optional DeepSeek-powered analytics. It focuses on low-friction journaling, simple daily planning, and lightweight workspace insights.

## Stack

- Next.js App Router
- Supabase Auth, Postgres, and Storage
- Tailwind CSS v4
- Optional DeepSeek analytics
- Vercel-ready deployment

## Features

- Email/password authentication with Supabase
- Daily checklist for trading routines
- Attendance tracker for session discipline
- Trade journal with screenshot uploads
- Mistake tracker with severity scoring
- Shared workspace analytics with optional server-side DeepSeek analysis
- Local pattern detection for overtrading, loss streaks, and strongest trade types

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project.
3. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).
4. Enable email/password auth in Supabase. The app maps usernames to internal auth emails for Supabase.
5. Add the values below to `.env.local`.
6. Start the app with `npm run dev`.

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Needed for auth:create-users and username password reset
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

DeepSeek settings are optional and only needed for the analytics page. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Provision The Two Login Accounts

TradeTrack is sign-in only and accepts usernames in the UI. The configured users are stored in [`config/auth-users.json`](./config/auth-users.json):

- `Leonsumanth8877`
- `chandankumar46`

Create or reset both users to the same temporary password with:

```bash
npm run auth:create-users -- admin@123
```

For different passwords per user:

```bash
npm run auth:create-users -- Leonsumanth8877 password123 chandankumar46 password456
```

The script will:

- create missing users in Supabase Auth
- update passwords for existing users
- mark both accounts as email-confirmed
- store the username in auth user metadata

Instead of command-line arguments, you can also set `AUTH_DEFAULT_PASSWORD` before running the same script.

The login page also has a password reset popup. It requires only the username, a new password, and password confirmation.

## Database Notes

- Trades, mistakes, tasks, and attendance records are protected by RLS.
- Screenshot uploads go to the `trade-screenshots` bucket.
- The app uses per-user folder paths in storage: `<user-id>/<uuid>.<ext>`.

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env.local` in the Vercel project.
4. Deploy.

Supabase keys are the required runtime secrets. Add the service role key if you want to use username password reset in the deployed app. Add DeepSeek variables only if you want the analytics assistant.
