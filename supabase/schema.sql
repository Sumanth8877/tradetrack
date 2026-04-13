create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type public.workspace_role as enum ('owner', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('pending', 'in_progress', 'completed', 'overdue', 'skipped');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'medium', 'high', 'critical');
  end if;

  if not exists (select 1 from pg_type where typname = 'journal_visibility') then
    create type public.journal_visibility as enum ('shared', 'personal');
  end if;

  if not exists (select 1 from pg_type where typname = 'resource_status') then
    create type public.resource_status as enum ('not_started', 'in_progress', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'resource_source_type') then
    create type public.resource_source_type as enum ('youtube', 'article', 'pdf', 'course', 'mentor_video', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'trade_mode') then
    create type public.trade_mode as enum ('demo', 'live');
  end if;

  if not exists (select 1 from pg_type where typname = 'trade_result') then
    create type public.trade_result as enum ('win', 'loss', 'breakeven');
  end if;

  if not exists (select 1 from pg_type where typname = 'reminder_channel') then
    create type public.reminder_channel as enum ('dashboard', 'email', 'push');
  end if;

  if not exists (select 1 from pg_type where typname = 'reminder_status') then
    create type public.reminder_status as enum ('due', 'done', 'missed');
  end if;

  if not exists (select 1 from pg_type where typname = 'calendar_event_type') then
    create type public.calendar_event_type as enum ('planner', 'learning', 'review', 'trade', 'journal', 'deadline');
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

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and is_active = true
      and role = 'owner'
  );
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  handle text not null unique check (char_length(handle) between 2 and 40),
  role_label text,
  avatar_color text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assigned_to uuid not null references auth.users(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 140),
  description text,
  task_date date not null,
  start_time time,
  end_time time,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 1440),
  category text not null default 'learning',
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  notes text,
  proof_of_completion text,
  recurring_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  label text,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  event_type public.calendar_event_type not null,
  event_date date not null,
  start_time time,
  end_time time,
  notes text,
  recurring_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  entry_date date not null,
  title text not null check (char_length(title) between 1 and 160),
  free_text text not null,
  summary text,
  lesson_learned text,
  mistakes text,
  action_plan_tomorrow text,
  market_observations text,
  strategy_practiced text,
  setup_observed text,
  mood text,
  confidence_rating integer check (confidence_rating between 1 and 10),
  tags text[] not null default '{}',
  visibility public.journal_visibility not null default 'shared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 180),
  url text not null,
  source_type public.resource_source_type not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 1 and 1440),
  status public.resource_status not null default 'not_started',
  watched_date date,
  summary text,
  notes text,
  key_takeaways text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  trade_date date not null,
  trade_time time,
  instrument text not null check (char_length(instrument) between 1 and 30),
  side text not null check (side in ('buy', 'sell')),
  mode public.trade_mode not null,
  entry_price numeric(14, 4) not null,
  stop_loss numeric(14, 4),
  target_price numeric(14, 4),
  exit_price numeric(14, 4),
  risk_reward numeric(10, 2),
  position_size numeric(14, 4),
  result public.trade_result not null,
  pnl numeric(14, 2) not null default 0,
  setup_type text,
  confluence_checklist text[] not null default '{}',
  reason_for_entry text,
  reason_for_exit text,
  mistakes text,
  psychology text,
  lesson_learned text,
  followed_plan boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_trade_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  unique (journal_entry_id, trade_id)
);

create table if not exists public.journal_resource_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  unique (journal_entry_id, resource_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 180),
  folder text not null default 'Inbox',
  category text not null default 'General',
  body_html text not null,
  tags text[] not null default '{}',
  pinned boolean not null default false,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  body_html text not null,
  change_summary text,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  entity_type text not null check (entity_type in ('task', 'trade', 'note', 'journal', 'resource', 'calendar')),
  entity_id uuid not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  attendance_date date not null,
  checked_in boolean not null default false,
  completed_learning_tasks boolean not null default false,
  journal_submitted boolean not null default false,
  review_logged boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, attendance_date)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null,
  message text not null,
  reminder_date date not null,
  reminder_time time,
  channel public.reminder_channel not null default 'dashboard',
  status public.reminder_status not null default 'due',
  target_type text,
  target_id uuid,
  recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx on public.workspace_members (user_id, workspace_id);
create index if not exists tasks_workspace_date_idx on public.tasks (workspace_id, task_date desc);
create index if not exists calendar_events_workspace_date_idx on public.calendar_events (workspace_id, event_date desc);
create index if not exists journal_entries_workspace_date_idx on public.journal_entries (workspace_id, entry_date desc);
create index if not exists resources_workspace_status_idx on public.resources (workspace_id, status, assigned_to);
create index if not exists trades_workspace_date_idx on public.trades (workspace_id, trade_date desc, user_id);
create index if not exists notes_workspace_updated_idx on public.notes (workspace_id, updated_at desc);
create index if not exists attendance_workspace_date_idx on public.attendance_records (workspace_id, attendance_date desc, user_id);
create index if not exists reminders_workspace_date_idx on public.reminders (workspace_id, reminder_date desc, assigned_to);
create index if not exists attachments_workspace_entity_idx on public.attachments (workspace_id, entity_type, entity_id);

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();
drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at before update on public.resources for each row execute function public.set_updated_at();
drop trigger if exists trades_set_updated_at on public.trades;
create trigger trades_set_updated_at before update on public.trades for each row execute function public.set_updated_at();
drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes for each row execute function public.set_updated_at();
drop trigger if exists attendance_records_set_updated_at on public.attendance_records;
create trigger attendance_records_set_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at before update on public.reminders for each row execute function public.set_updated_at();

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_members enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tasks',
    'task_links',
    'calendar_events',
    'journal_entries',
    'resources',
    'trades',
    'journal_trade_links',
    'journal_resource_links',
    'notes',
    'note_versions',
    'attachments',
    'attendance_records',
    'reminders'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "workspace members manage %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "workspace members manage %1$s" on public.%1$I for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))',
      table_name
    );
  end loop;
end $$;

drop policy if exists "workspace members view workspaces" on public.workspaces;
create policy "workspace members view workspaces"
on public.workspaces
for select
to authenticated
using (public.is_workspace_member(id));

drop policy if exists "workspace owners manage workspaces" on public.workspaces;
create policy "workspace owners manage workspaces"
on public.workspaces
for all
to authenticated
using (public.is_workspace_owner(id) or created_by = auth.uid())
with check (public.is_workspace_owner(id) or created_by = auth.uid());

drop policy if exists "workspace members view membership" on public.workspace_members;
create policy "workspace members view membership"
on public.workspace_members
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace owners manage membership" on public.workspace_members;
create policy "workspace owners manage membership"
on public.workspace_members
for all
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

drop policy if exists "profiles readable by shared workspace" on public.profiles;
create policy "profiles readable by shared workspace"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs
      on mine.workspace_id = theirs.workspace_id
    where mine.user_id = auth.uid()
      and mine.is_active = true
      and theirs.user_id = profiles.user_id
      and theirs.is_active = true
  )
);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
on public.profiles
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('workspace-uploads', 'workspace-uploads', false)
on conflict (id) do nothing;

drop policy if exists "workspace members view uploads" on storage.objects;
create policy "workspace members view uploads"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workspace-uploads'
  and exists (
    select 1
    from public.workspace_members
    where user_id = auth.uid()
      and workspace_id::text = (storage.foldername(name))[1]
      and is_active = true
  )
);

drop policy if exists "workspace members upload files" on storage.objects;
create policy "workspace members upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workspace-uploads'
  and exists (
    select 1
    from public.workspace_members
    where user_id = auth.uid()
      and workspace_id::text = (storage.foldername(name))[1]
      and is_active = true
  )
);

drop policy if exists "workspace members update files" on storage.objects;
create policy "workspace members update files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workspace-uploads'
  and exists (
    select 1
    from public.workspace_members
    where user_id = auth.uid()
      and workspace_id::text = (storage.foldername(name))[1]
      and is_active = true
  )
)
with check (
  bucket_id = 'workspace-uploads'
  and exists (
    select 1
    from public.workspace_members
    where user_id = auth.uid()
      and workspace_id::text = (storage.foldername(name))[1]
      and is_active = true
  )
);

drop policy if exists "workspace members delete files" on storage.objects;
create policy "workspace members delete files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workspace-uploads'
  and exists (
    select 1
    from public.workspace_members
    where user_id = auth.uid()
      and workspace_id::text = (storage.foldername(name))[1]
      and is_active = true
  )
);
