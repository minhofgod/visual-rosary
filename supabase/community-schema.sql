-- ============================================================================
-- Đọc Kinh Mân Côi — Community (prayer-request wall) + accounts schema
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query → paste all → Run.
-- Safe to re-run (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
--
-- Design notes:
--  • Posters stay ANONYMOUS to other users: the wall is read only through the
--    get_prayer_wall() function, which never returns user_id. Direct table reads
--    are blocked by RLS except for a user's OWN posts.
--  • Actions (pray / report / block) go through SECURITY DEFINER functions that
--    take only a request_id, so the client never needs a poster's identity.
--  • Moderation (report → auto-hide, block, ban) is built in — required by the
--    Google Play & Apple app stores for user-generated content.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user (for ban/admin flags)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  is_banned  boolean not null default false,
  is_admin   boolean not null default false
);

alter table public.profiles enable row level security;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A user may read only their own profile. There is deliberately NO update policy,
-- so users cannot set is_admin/is_banned on themselves — you set those from the
-- dashboard (service role bypasses RLS).
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- blocks: a user hides another user's posts from their own feed
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id      uuid not null references auth.users (id) on delete cascade,
  blocked_user_id uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id)
);

alter table public.blocks enable row level security;
-- Blocks are created via block_poster() (so the client never sees user ids), but
-- a user may read/delete their own blocks directly.
drop policy if exists "blocks read own" on public.blocks;
create policy "blocks read own" on public.blocks for select using (auth.uid() = blocker_id);
drop policy if exists "blocks delete own" on public.blocks;
create policy "blocks delete own" on public.blocks for delete using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- prayer_requests: the posted intentions
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body         text not null check (char_length(btrim(body)) between 1 and 500),
  status       text not null default 'visible' check (status in ('visible', 'hidden', 'removed')),
  prayed_count integer not null default 0,
  report_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists prayer_requests_created_idx on public.prayer_requests (created_at desc);
create index if not exists prayer_requests_status_idx on public.prayer_requests (status);

alter table public.prayer_requests enable row level security;

-- NO public "read visible" policy on purpose — the wall is read via
-- get_prayer_wall() so user_id is never exposed. A user may read/insert/delete
-- only their OWN rows directly (to post and manage their own requests).
drop policy if exists "requests read own" on public.prayer_requests;
create policy "requests read own" on public.prayer_requests
  for select using (auth.uid() = user_id);

drop policy if exists "requests insert own" on public.prayer_requests;
create policy "requests insert own" on public.prayer_requests
  for insert with check (
    auth.uid() = user_id
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_banned)
  );

drop policy if exists "requests delete own" on public.prayer_requests;
create policy "requests delete own" on public.prayer_requests
  for delete using (auth.uid() = user_id);

-- Rate limit: at most 5 new requests per user per hour.
create or replace function public.enforce_request_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent integer;
begin
  select count(*) into recent from public.prayer_requests
   where user_id = new.user_id and created_at > now() - interval '1 hour';
  if recent >= 5 then
    raise exception 'Bạn đăng quá nhanh, xin thử lại sau ít phút. / Posting too quickly, please try again shortly.';
  end if;
  return new;
end; $$;

drop trigger if exists prayer_requests_rate_limit on public.prayer_requests;
create trigger prayer_requests_rate_limit
  before insert on public.prayer_requests
  for each row execute function public.enforce_request_rate_limit();

-- ---------------------------------------------------------------------------
-- prayer_prayed: one row per (request, signed-in user) — dedupes the count
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_prayed (
  request_id uuid not null references public.prayer_requests (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);
alter table public.prayer_prayed enable row level security;
-- No client policies: all access is through pray_for_request().

-- ---------------------------------------------------------------------------
-- reports: moderation reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.prayer_requests (id) on delete cascade,
  reporter_id uuid references auth.users (id) on delete set null,
  reason      text,
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
-- No client policies: reports are filed via report_request(); you review them in
-- the dashboard (Table editor → reports).

-- ===========================================================================
-- RPCs (SECURITY DEFINER — the app calls these; they enforce anonymity + rules)
-- ===========================================================================

-- Read the wall. Never returns user_id. Excludes hidden/removed posts, banned
-- posters, and anyone the caller has blocked. Sort:
--   'new'    → newest first
--   'prayed' → most prayed first
--   'needs'  → fewest prayed first (surface requests that need prayers), newest as tiebreak
create or replace function public.get_prayer_wall(p_sort text default 'new', p_limit int default 30, p_offset int default 0)
returns table (id uuid, body text, prayed_count int, created_at timestamptz, is_mine boolean, prayed_by_me boolean)
language sql security definer set search_path = public as $$
  select r.id, r.body, r.prayed_count, r.created_at,
         (r.user_id = auth.uid()) as is_mine,
         exists (select 1 from public.prayer_prayed pp where pp.request_id = r.id and pp.user_id = auth.uid()) as prayed_by_me
    from public.prayer_requests r
   where r.status = 'visible'
     and not exists (select 1 from public.profiles p where p.id = r.user_id and p.is_banned)
     and not exists (select 1 from public.blocks b where b.blocker_id = auth.uid() and b.blocked_user_id = r.user_id)
   order by
     case when p_sort = 'prayed' then r.prayed_count end desc nulls last,
     case when p_sort = 'needs'  then r.prayed_count end asc  nulls last,
     r.created_at desc
   limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0);
$$;

-- Record a prayer for a request → returns the new count. Signed-in users are
-- deduped (one per request); anonymous taps just increment (client-guarded).
create or replace function public.pray_for_request(p_request_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_new integer;
begin
  if not exists (select 1 from public.prayer_requests where id = p_request_id and status = 'visible') then
    raise exception 'not_found';
  end if;

  if v_uid is not null then
    insert into public.prayer_prayed (request_id, user_id)
      values (p_request_id, v_uid)
      on conflict (request_id, user_id) do nothing;
    if not found then
      select prayed_count into v_new from public.prayer_requests where id = p_request_id;
      return v_new; -- already prayed; count unchanged
    end if;
  end if;

  update public.prayer_requests set prayed_count = prayed_count + 1
   where id = p_request_id returning prayed_count into v_new;
  return v_new;
end; $$;

-- File a report → increments report_count, auto-hides at a threshold.
create or replace function public.report_request(p_request_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_reports integer;
begin
  insert into public.reports (request_id, reporter_id, reason)
    values (p_request_id, auth.uid(), left(coalesce(p_reason, ''), 300));
  update public.prayer_requests set report_count = report_count + 1
   where id = p_request_id returning report_count into v_reports;
  if v_reports >= 3 then
    update public.prayer_requests set status = 'hidden'
     where id = p_request_id and status = 'visible';
  end if;
end; $$;

-- Block the poster of a request (hides all their posts from the caller).
create or replace function public.block_poster(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_poster uuid;
begin
  if v_uid is null then raise exception 'sign_in_required'; end if;
  select user_id into v_poster from public.prayer_requests where id = p_request_id;
  if v_poster is null or v_poster = v_uid then return; end if;
  insert into public.blocks (blocker_id, blocked_user_id)
    values (v_uid, v_poster) on conflict do nothing;
end; $$;

grant execute on function public.get_prayer_wall(text, int, int) to anon, authenticated;
grant execute on function public.pray_for_request(uuid)            to anon, authenticated;
grant execute on function public.report_request(uuid, text)        to anon, authenticated;
grant execute on function public.block_poster(uuid)                to authenticated;

-- ===========================================================================
-- After you sign in once, make yourself an admin (find your id in Auth → Users):
--   update public.profiles set is_admin = true where id = 'YOUR-USER-UUID';
-- To hide/remove a post:      update public.prayer_requests set status='removed' where id='...';
-- To ban a user:              update public.profiles set is_banned=true where id='...';
-- ===========================================================================
