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
4. Enable email/password auth in Supabase.
5. Add the values below to `.env.local`.
6. Start the app with `npm run dev`.

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Optional: only needed for auth:create-users
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
```

`OPENAI_MODEL` is optional. The default is `gpt-5-nano` to keep costs low for short summaries. `SUPABASE_SERVICE_ROLE_KEY` is only needed for the admin provisioning script below.

## Provision The Two Login Accounts

TradeTrack is now sign-in only. Create or reset the two allowed users with:

```bash
npm run auth:create-users -- user1@example.com password123 user2@example.com password456
```

The script will:

- create missing users in Supabase Auth
- update passwords for existing users
- mark both accounts as email-confirmed

Instead of command-line arguments, you can also set `AUTH_USER_1_EMAIL`, `AUTH_USER_1_PASSWORD`, `AUTH_USER_2_EMAIL`, and `AUTH_USER_2_PASSWORD` before running the same script.

## Database Notes

- Trades, mistakes, tasks, attendance records, and AI insights are protected by RLS.
- Screenshot uploads go to the `trade-screenshots` bucket.
- The app uses per-user folder paths in storage: `<user-id>/<uuid>.<ext>`.

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env.local` in the Vercel project.
4. Deploy.

Supabase and OpenAI keys are the only required runtime secrets. The service role key is only needed if you want to run the auth provisioning script.
