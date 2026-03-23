create extension if not exists pgcrypto;

create table if not exists public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  identity jsonb not null default '{}'::jsonb,
  last_route text,
  last_resume_href text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learner_sync_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_learner_profiles_updated_at on public.learner_profiles;
create trigger set_learner_profiles_updated_at
before update on public.learner_profiles
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_learner_sync_state_updated_at on public.learner_sync_state;
create trigger set_learner_sync_state_updated_at
before update on public.learner_sync_state
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.learner_profiles enable row level security;
alter table public.learner_sync_state enable row level security;

grant select, insert, update on public.learner_profiles to authenticated;
grant select, insert, update on public.learner_sync_state to authenticated;

drop policy if exists "Users can read own learner profile" on public.learner_profiles;
create policy "Users can read own learner profile"
on public.learner_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own learner profile" on public.learner_profiles;
create policy "Users can insert own learner profile"
on public.learner_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own learner profile" on public.learner_profiles;
create policy "Users can update own learner profile"
on public.learner_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own learner sync state" on public.learner_sync_state;
create policy "Users can read own learner sync state"
on public.learner_sync_state
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own learner sync state" on public.learner_sync_state;
create policy "Users can insert own learner sync state"
on public.learner_sync_state
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own learner sync state" on public.learner_sync_state;
create policy "Users can update own learner sync state"
on public.learner_sync_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
