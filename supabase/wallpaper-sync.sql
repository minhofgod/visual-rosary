-- ============================================================================
-- Đọc Kinh Mân Côi — per-account wallpaper collection sync
-- Run in Supabase → SQL Editor. Safe to re-run.
--
-- Mirrors the streak sync (user_prayer_days): the client merges the device's
-- localStorage wallpaper collection into these tables on sign-in, writes new
-- claims/avatar changes here while signed in, and reads them back so the
-- collection follows the user across devices. Device-local stays the source of
-- truth offline; all client calls are fail-open. Pending gift credits stay
-- device-local (transient) and are NOT synced here — only the earned set +
-- chosen avatar, which are the durable, losable parts.
-- ============================================================================

-- One row per wallpaper a user has earned (append-only set, like prayer days).
create table if not exists public.user_wallpapers (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wallpaper_id text not null,
  earned_at    timestamptz not null default now(),
  primary key (user_id, wallpaper_id)
);

alter table public.user_wallpapers enable row level security;

-- A user can read and add only their own wallpapers (append-only; no update/delete).
drop policy if exists "wallpapers: read own" on public.user_wallpapers;
create policy "wallpapers: read own" on public.user_wallpapers
  for select using (auth.uid() = user_id);

drop policy if exists "wallpapers: insert own" on public.user_wallpapers;
create policy "wallpapers: insert own" on public.user_wallpapers
  for insert with check (auth.uid() = user_id);

-- The single chosen avatar per user (mutable — one row, updated in place).
create table if not exists public.user_wallpaper_prefs (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  avatar_id  text,
  updated_at timestamptz not null default now(),
  primary key (user_id)
);

alter table public.user_wallpaper_prefs enable row level security;

drop policy if exists "wallpaper prefs: read own" on public.user_wallpaper_prefs;
create policy "wallpaper prefs: read own" on public.user_wallpaper_prefs
  for select using (auth.uid() = user_id);

drop policy if exists "wallpaper prefs: upsert own" on public.user_wallpaper_prefs;
create policy "wallpaper prefs: upsert own" on public.user_wallpaper_prefs
  for insert with check (auth.uid() = user_id);

drop policy if exists "wallpaper prefs: update own" on public.user_wallpaper_prefs;
create policy "wallpaper prefs: update own" on public.user_wallpaper_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
