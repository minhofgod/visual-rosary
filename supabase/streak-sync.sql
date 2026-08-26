-- ============================================================================
-- Đọc Kinh Mân Côi — per-account prayer-day sync (for the streak + year heatmap)
-- Run in Supabase → SQL Editor. Safe to re-run.
--
-- Stores one row per (user, local calendar day a rosary was prayed). The client
-- merges the device's localStorage streak into this table on sign-in, records new
-- completions here while signed in, and reads it back so the streak follows the
-- user across devices. Days only (unique) — the "total" stat stays device-local.
-- ============================================================================

create table if not exists public.user_prayer_days (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.user_prayer_days enable row level security;

-- A user can read and add only their own days (append-only; no update/delete needed).
drop policy if exists "prayer days: read own" on public.user_prayer_days;
create policy "prayer days: read own" on public.user_prayer_days
  for select using (auth.uid() = user_id);

drop policy if exists "prayer days: insert own" on public.user_prayer_days;
create policy "prayer days: insert own" on public.user_prayer_days
  for insert with check (auth.uid() = user_id);
