-- Random chat: core schema (no payments yet).
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- ENUMS
create type room_status as enum ('active', 'closed');
create type queue_status as enum ('waiting', 'matched', 'cancelled');
create type report_reason as enum ('spam', 'abuse', 'sexual_content', 'underage', 'scam', 'other');
create type report_status as enum ('open', 'reviewed_valid', 'reviewed_invalid');

-- PROFILES (1-1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_color text,
  language text default 'any',
  gender text check (gender in ('male', 'female', 'other')),
  interests text[] default '{}',
  age_confirmed_at timestamptz,
  consent_version text,
  country text default 'IN',
  is_guest boolean default true,
  pro_until timestamptz,                 -- set by the payment webhook later
  daily_chat_count int default 0,
  daily_chat_reset date default current_date,
  device_hash text,
  created_at timestamptz default now()
);

-- MATCH QUEUE
create table public.match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  status queue_status not null default 'waiting',
  language text default 'any',
  interests text[] default '{}',
  priority_score int default 0,
  joined_at timestamptz default now(),
  last_heartbeat timestamptz default now()
);
create index match_queue_pick on public.match_queue (status, priority_score desc, joined_at);

-- ROOMS
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status room_status default 'active',
  created_at timestamptz default now(),
  closed_at timestamptz,
  closed_by uuid references public.profiles(id) on delete set null,
  close_reason text,
  check (user_a <> user_b)
);
create index rooms_user_a on public.rooms (user_a, status);
create index rooms_user_b on public.rooms (user_b, status);

-- RECENT MATCHES (no instant rematch)
create table public.recent_matches (
  user_a uuid not null,
  user_b uuid not null,
  matched_at timestamptz default now(),
  primary key (user_a, user_b, matched_at),
  check (user_a < user_b)
);
create index recent_matches_pair on public.recent_matches (user_a, user_b, matched_at desc);

-- BLOCKS
create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  reason report_reason not null,
  details text,
  snapshot jsonb,
  status report_status default 'open',
  reviewed_by uuid,
  created_at timestamptz default now()
);
create index reports_reported on public.reports (reported_id, status);

-- BANS
create table public.bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  device_hash text,
  reason text,
  expires_at timestamptz,               -- null = permanent
  created_at timestamptz default now()
);
create index bans_user on public.bans (user_id);
create index bans_device on public.bans (device_hash);

-- Create a profile whenever an auth user (including anonymous guests) is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, is_guest, display_color)
  values (new.id, coalesce(new.is_anonymous, true), '#' || substr(md5(random()::text), 1, 6));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.match_queue enable row level security;
alter table public.rooms enable row level security;
alter table public.recent_matches enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.bans enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "room members read" on public.rooms for select using (auth.uid() in (user_a, user_b));
create policy "own blocks" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
-- match_queue, recent_matches, reports, bans: no client policies.
-- They are written only through the security definer functions in 0002.
