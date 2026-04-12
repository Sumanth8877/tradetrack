create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'attendance_status'
  ) then
    create type public.attendance_status as enum ('present', 'partial', 'missed');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'trade_direction'
  ) then
    create type public.trade_direction as enum ('long', 'short');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'insight_kind'
  ) then
    create type public.insight_kind as enum ('daily', 'weekly');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  task_date date not null default current_date,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  status public.attendance_status not null default 'present',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session_date)
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (char_length(symbol) between 1 and 12),
  trade_type text not null check (char_length(trade_type) between 1 and 60),
  direction public.trade_direction not null,
  entry_price numeric(14, 4) not null check (entry_price > 0),
  exit_price numeric(14, 4) not null check (exit_price > 0),
  profit_loss numeric(14, 2) not null,
  screenshot_path text,
  notes text,
  traded_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id uuid references public.trades(id) on delete set null,
  mistake_type text not null check (char_length(mistake_type) between 1 and 60),
  severity smallint not null check (severity between 1 and 5),
  notes text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.insight_kind not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  model text,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  unique (user_id, kind, period_start, period_end)
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date);
create index if not exists attendance_user_date_idx on public.attendance_records (user_id, session_date desc);
create index if not exists trades_user_date_idx on public.trades (user_id, traded_on desc);
create index if not exists mistakes_user_date_idx on public.mistakes (user_id, occurred_on desc);
create index if not exists ai_insights_user_created_idx on public.ai_insights (user_id, created_at desc);

drop trigger if exists attendance_records_set_updated_at on public.attendance_records;
create trigger attendance_records_set_updated_at
before update on public.attendance_records
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.attendance_records enable row level security;
alter table public.trades enable row level security;
alter table public.mistakes enable row level security;
alter table public.ai_insights enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
on public.tasks
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own attendance" on public.attendance_records;
create policy "Users manage own attendance"
on public.attendance_records
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own trades" on public.trades;
create policy "Users manage own trades"
on public.trades
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own mistakes" on public.mistakes;
create policy "Users manage own mistakes"
on public.mistakes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own ai insights" on public.ai_insights;
create policy "Users manage own ai insights"
on public.ai_insights
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false)
on conflict (id) do nothing;

drop policy if exists "Users view own screenshots" on storage.objects;
create policy "Users view own screenshots"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users upload own screenshots" on storage.objects;
create policy "Users upload own screenshots"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own screenshots" on storage.objects;
create policy "Users update own screenshots"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'trade-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own screenshots" on storage.objects;
create policy "Users delete own screenshots"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);
