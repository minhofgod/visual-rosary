-- ============================================================================
-- Admin moderation RPCs for the prayer wall.
-- All are SECURITY DEFINER and gated on public.is_admin(), so even though they're
-- granted to `authenticated`, only a profile with is_admin = true can use them.
-- Set yourself admin once (Supabase → Authentication → Users for your UUID):
--   update public.profiles set is_admin = true where id = 'YOUR-USER-UUID';
-- ============================================================================

-- Is the current caller an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- List requests for moderation (unlike get_prayer_wall this DOES return user_id and
-- hidden/removed posts). Returns nothing for non-admins, so it can't leak data.
--   p_filter: 'all' | 'visible' | 'hidden' | 'removed' | 'reported'
create or replace function public.admin_list_requests(
  p_filter text default 'all', p_limit int default 200, p_offset int default 0
)
returns table (
  id uuid, user_id uuid, body text, status text, report_count int, prayed_count int,
  created_at timestamptz, poster_banned boolean, poster_total int
)
language sql security definer set search_path = public as $$
  select r.id, r.user_id, r.body, r.status, r.report_count, r.prayed_count, r.created_at,
         coalesce(p.is_banned, false) as poster_banned,
         (select count(*) from public.prayer_requests r2 where r2.user_id = r.user_id)::int as poster_total
    from public.prayer_requests r
    left join public.profiles p on p.id = r.user_id
   where public.is_admin()
     and (
       p_filter = 'all'
       or (p_filter = 'reported' and r.report_count > 0)
       or r.status = p_filter
     )
   order by
     case when p_filter = 'reported' then r.report_count end desc nulls last,
     r.created_at desc
   limit least(greatest(p_limit, 1), 500) offset greatest(p_offset, 0);
$$;

-- Set a request's status: 'visible' (restore), 'hidden', or 'removed'.
create or replace function public.admin_set_status(p_request_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_status not in ('visible', 'hidden', 'removed') then raise exception 'invalid status'; end if;
  update public.prayer_requests set status = p_status where id = p_request_id;
end; $$;

-- Ban / unban a poster (banned users' posts vanish from the wall).
create or replace function public.admin_set_ban(p_user_id uuid, p_banned boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set is_banned = p_banned where id = p_user_id;
end; $$;

-- List members (accounts) for moderation. NO email / personal data — profiles only
-- hold an anonymous id + flags. p_filter: 'all' | 'banned' | 'admin'.
create or replace function public.admin_list_members(
  p_filter text default 'all', p_limit int default 500, p_offset int default 0
)
returns table (
  id uuid, created_at timestamptz, is_admin boolean, is_banned boolean,
  post_count int, prayed_given int
)
language sql security definer set search_path = public as $$
  select p.id, p.created_at, p.is_admin, p.is_banned,
         (select count(*) from public.prayer_requests r where r.user_id = p.id)::int as post_count,
         (select count(*) from public.prayer_prayed pp where pp.user_id = p.id)::int as prayed_given
    from public.profiles p
   where public.is_admin()
     and (
       p_filter = 'all'
       or (p_filter = 'banned' and p.is_banned)
       or (p_filter = 'admin' and p.is_admin)
     )
   order by p.is_banned desc, p.created_at desc
   limit least(greatest(p_limit, 1), 1000) offset greatest(p_offset, 0);
$$;

grant execute on function public.is_admin()                          to authenticated;
grant execute on function public.admin_list_requests(text, int, int) to authenticated;
grant execute on function public.admin_set_status(uuid, text)        to authenticated;
grant execute on function public.admin_set_ban(uuid, boolean)        to authenticated;
grant execute on function public.admin_list_members(text, int, int)  to authenticated;
