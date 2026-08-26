import { supabase } from './supabaseClient';

// Admin moderation data layer. All calls go through SECURITY DEFINER RPCs gated on
// is_admin() server-side (see supabase/admin.sql), so a non-admin gets nothing.

export type RequestStatus = 'visible' | 'hidden' | 'removed';
export type AdminFilter = 'all' | 'reported' | 'visible' | 'hidden' | 'removed';

export interface AdminRequest {
  id: string;
  user_id: string;
  body: string;
  status: RequestStatus;
  report_count: number;
  prayed_count: number;
  created_at: string;
  poster_banned: boolean;
  poster_total: number;
}

export async function amIAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function adminListRequests(filter: AdminFilter = 'all'): Promise<AdminRequest[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('admin_list_requests', { p_filter: filter, p_limit: 300, p_offset: 0 });
  if (error) {
    console.error('adminListRequests failed', error);
    return [];
  }
  return (data ?? []) as AdminRequest[];
}

export async function adminSetStatus(id: string, status: RequestStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('admin_set_status', { p_request_id: id, p_status: status });
  if (error) {
    console.error('adminSetStatus failed', error);
    return false;
  }
  return true;
}

export interface AdminMember {
  id: string;
  created_at: string;
  is_admin: boolean;
  is_banned: boolean;
  post_count: number;
  prayed_given: number;
}
export type MemberFilter = 'all' | 'banned' | 'admin';

export async function adminListMembers(filter: MemberFilter = 'all'): Promise<AdminMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('admin_list_members', { p_filter: filter, p_limit: 500, p_offset: 0 });
  if (error) {
    console.error('adminListMembers failed', error);
    return [];
  }
  return (data ?? []) as AdminMember[];
}

export async function adminSetBan(userId: string, banned: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('admin_set_ban', { p_user_id: userId, p_banned: banned });
  if (error) {
    console.error('adminSetBan failed', error);
    return false;
  }
  return true;
}
