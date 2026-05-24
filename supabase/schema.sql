create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.teams (
  id text primary key,
  name text not null,
  code text,
  flag_url text,
  group_code text,
  meta jsonb default '{}'::jsonb
);

create table if not exists public.venues (
  id text primary key,
  name text not null,
  city text,
  country text,
  capacity int,
  lat double precision,
  lng double precision,
  photo_url text,
  meta jsonb default '{}'::jsonb
);

create type match_phase as enum ('group','r32','r16','qf','sf','3p','final');

create table if not exists public.matches (
  id text primary key,
  match_number int,
  phase match_phase not null,
  group_code text,
  kickoff_utc timestamptz not null,
  venue_id text references public.venues(id),
  home_team_id text references public.teams(id),
  away_team_id text references public.teams(id),
  status text default 'scheduled',
  real_home int,
  real_away int,
  meta jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create index if not exists idx_matches_kickoff on public.matches(kickoff_utc);
create index if not exists idx_matches_group on public.matches(group_code);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  pred_home int,
  pred_away int,
  updated_at timestamptz default now(),
  unique(user_id, match_id)
);

create table if not exists public.private_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_public boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.private_group_members (
  group_id uuid references public.private_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_predictions (
  group_id uuid references public.private_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  match_id text references public.matches(id) on delete cascade,
  pred_home int,
  pred_away int,
  updated_at timestamptz default now(),
  primary key (group_id, user_id, match_id)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

create table if not exists public.bracket_slots (
  slot text primary key,
  round match_phase not null,
  order_index int not null,
  home_source text,
  away_source text,
  winner_to_slot text,
  winner_to_side text check (winner_to_side in ('home','away')),
  loser_to_slot text,
  loser_to_side text check (loser_to_side in ('home','away')),
  kickoff_utc_override timestamptz,
  venue_id_override text references public.venues(id),
  meta jsonb default '{}'::jsonb
);

create index if not exists idx_bracket_round on public.bracket_slots(round, order_index);

alter table public.profiles enable row level security;
alter table public.app_admins enable row level security;
alter table public.predictions enable row level security;
alter table public.private_groups enable row level security;
alter table public.private_group_members enable row level security;
alter table public.group_predictions enable row level security;
alter table public.audit_log enable row level security;
alter table public.teams enable row level security;
alter table public.venues enable row level security;
alter table public.matches enable row level security;
alter table public.bracket_slots enable row level security;

create policy "public read teams" on public.teams for select using (true);
create policy "public read venues" on public.venues for select using (true);
create policy "public read matches" on public.matches for select using (true);
create policy "public read bracket slots" on public.bracket_slots for select using (true);

create policy "profiles select own" on public.profiles for select
using (auth.uid() = id);

create policy "profiles upsert own" on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles update own" on public.profiles for update
using (auth.uid() = id);

create policy "admins select own" on public.app_admins for select
using (auth.uid() = user_id);

create policy "pred select own" on public.predictions for select
using (auth.uid() = user_id);

create policy "pred insert own" on public.predictions for insert
with check (auth.uid() = user_id);

create policy "pred update own" on public.predictions for update
using (auth.uid() = user_id);

create policy "pred delete own" on public.predictions for delete
using (auth.uid() = user_id);

create policy "groups read public or member" on public.private_groups for select
using (
  is_public = true
  OR owner_id = auth.uid()
  OR exists (
    select 1 from public.private_group_members m
    where m.group_id = id and m.user_id = auth.uid()
  )
);

create policy "groups insert own" on public.private_groups for insert
with check (auth.uid() = owner_id);

create policy "groups update owner" on public.private_groups for update
using (auth.uid() = owner_id);

create policy "members read if member" on public.private_group_members for select
using (
  exists (
    select 1 from public.private_group_members m
    where m.group_id = group_id and m.user_id = auth.uid()
  )
);

create policy "members insert owner" on public.private_group_members for insert
with check (
  exists (
    select 1 from public.private_groups g
    where g.id = group_id and g.owner_id = auth.uid()
  )
);

create policy "members delete owner" on public.private_group_members for delete
using (
  exists (
    select 1 from public.private_groups g
    where g.id = group_id and g.owner_id = auth.uid()
  )
);

create policy "group pred read if member" on public.group_predictions for select
using (
  exists (select 1 from public.private_group_members m
          where m.group_id = group_id and m.user_id = auth.uid())
);

create policy "group pred upsert self" on public.group_predictions for insert
with check (
  auth.uid() = user_id AND
  exists (select 1 from public.private_group_members m
          where m.group_id = group_id and m.user_id = auth.uid())
);

create policy "group pred update self" on public.group_predictions for update
using (
  auth.uid() = user_id AND
  exists (select 1 from public.private_group_members m
          where m.group_id = group_id and m.user_id = auth.uid())
);

create policy "audit select own" on public.audit_log for select
using (auth.uid() = user_id);

create policy "admins insert bracket slots" on public.bracket_slots for insert
with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

create policy "admins update bracket slots" on public.bracket_slots for update
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

create policy "admins delete bracket slots" on public.bracket_slots for delete
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));
