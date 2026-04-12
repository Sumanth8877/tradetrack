# TradeTrack

TradeTrack is a full-stack trading journal built with Next.js, Supabase, Tailwind CSS, and the OpenAI API. It focuses on low-friction journaling, simple daily planning, and cached AI feedback that stays within a small token budget.

## Stack

- Next.js App Router
- Supabase Auth, Postgres, and Storage
- Tailwind CSS v4
- OpenAI Responses API
- Vercel-ready deployment

## Features

- Email/password authentication with Supabase
- Daily checklist for trading routines
- Attendance tracker for session discipline
- Trade journal with screenshot uploads
- Mistake tracker with severity scoring
- Cached daily insight after trade logging
- Cached weekly summary with win rate and common mistakes
- Local pattern detection for overtrading, loss streaks, and strongest trade types

## AI Budget Controls

- TradeTrack stores AI results in `ai_insights` to avoid repeated calls.
- Daily generation is capped at `2` AI runs per user per day.
- The daily insight is only generated after a trade is logged.
- Weekly summaries reuse the cached result for the same 7-day window.
- Pattern detection is calculated locally so the model only writes concise advice.

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
PASSWORD_RESET_ADMIN_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
```

`OPENAI_MODEL` is optional. The default is `gpt-5-nano` to keep costs low for short summaries. Keep `SUPABASE_SERVICE_ROLE_KEY` and `PASSWORD_RESET_ADMIN_KEY` server-side only.

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

The login page also has a password reset form. It requires the username, a new password, and `PASSWORD_RESET_ADMIN_KEY`; username-only reset is intentionally blocked because anyone who knows a username could otherwise take over that account.

## Database Notes

- Trades, mistakes, tasks, attendance records, and AI insights are protected by RLS.
- Screenshot uploads go to the `trade-screenshots` bucket.
- The app uses per-user folder paths in storage: `<user-id>/<uuid>.<ext>`.

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env.local` in the Vercel project.
4. Deploy.

Supabase and OpenAI keys are the required runtime secrets. Add the service role key and password reset key if you want to use username password reset in the deployed app.
