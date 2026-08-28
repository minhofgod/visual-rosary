-- Site-wide all-time total of completed rosaries — companion to get_prayers_today().
-- Anonymous public counter. SECURITY DEFINER so the anon role can read the aggregate count
-- without needing direct SELECT on prayer_completions (same pattern as get_prayers_today()).
-- Run once in the Supabase SQL editor.

create or replace function public.get_prayers_total()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.prayer_completions;
$$;

grant execute on function public.get_prayers_total() to anon, authenticated;
