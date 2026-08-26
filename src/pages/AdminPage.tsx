import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { MysteryBackground } from '../components/MysteryBackground';
import { SignInModal } from '../components/SignInModal';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { useAuth } from '../state/useAuth';
import {
  amIAdmin,
  adminListRequests,
  adminListMembers,
  adminSetStatus,
  adminSetBan,
  type AdminRequest,
  type AdminMember,
  type AdminFilter,
  type MemberFilter,
  type RequestStatus,
} from '../lib/admin';

type Mode = 'requests' | 'members';

const REQUEST_FILTERS: { key: AdminFilter; vi: string; en: string }[] = [
  { key: 'reported', vi: 'Bị báo cáo', en: 'Reported' },
  { key: 'all', vi: 'Tất cả', en: 'All' },
  { key: 'visible', vi: 'Đang hiển thị', en: 'Visible' },
  { key: 'hidden', vi: 'Đã ẩn', en: 'Hidden' },
  { key: 'removed', vi: 'Đã xóa', en: 'Removed' },
];

const MEMBER_FILTERS: { key: MemberFilter; vi: string; en: string }[] = [
  { key: 'all', vi: 'Tất cả', en: 'All' },
  { key: 'banned', vi: 'Bị cấm', en: 'Banned' },
  { key: 'admin', vi: 'Quản trị', en: 'Admins' },
];

// Admin-only moderation panel (/quan-tri). Self-gating: checks is_admin via an RPC and
// every action is server-gated too, so a non-admin sees nothing actionable.
export function AdminPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const auth = useAuth();
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<Mode>('requests');
  const [filter, setFilter] = useState<AdminFilter>('reported');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [items, setItems] = useState<AdminRequest[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const loadRequests = useCallback(async (f: AdminFilter) => {
    setLoading(true);
    setItems(await adminListRequests(f));
    setLoading(false);
  }, []);

  const loadMembers = useCallback(async (f: MemberFilter) => {
    setLoading(true);
    setMembers(await adminListMembers(f));
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChecking(true);
      const ok = auth.isSignedIn ? await amIAdmin() : false;
      if (cancelled) return;
      setIsAdmin(ok);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.isSignedIn]);

  useEffect(() => {
    if (!isAdmin) return;
    if (mode === 'requests') loadRequests(filter);
    else loadMembers(memberFilter);
  }, [isAdmin, mode, filter, memberFilter, loadRequests, loadMembers]);

  const reload = () => (mode === 'requests' ? loadRequests(filter) : loadMembers(memberFilter));

  async function setStatus(id: string, status: RequestStatus) {
    setBusyId(id);
    await adminSetStatus(id, status);
    await reload();
    setBusyId(null);
  }

  async function toggleBan(userId: string, banned: boolean) {
    if (
      !confirm(
        banned
          ? t('Bỏ cấm người này?', 'Unban this person?')
          : t('Cấm người này? Tất cả bài của họ sẽ bị ẩn.', 'Ban this person? All their posts will be hidden.'),
      )
    )
      return;
    setBusyId(userId);
    await adminSetBan(userId, !banned);
    await reload();
    setBusyId(null);
  }

  return (
    <div className="reading-screen pw-screen">
      <MysteryBackground image={image?.file} gradientClass="bg-landing" />
      <div className="bg-scrim" />

      <AppHeader
        displayLang={displayLang}
        setDisplayLang={setDisplayLang}
        left={
          <button type="button" className="icon-button icon-button-back" onClick={() => navigate('/')} aria-label={t('Trang chủ', 'Home')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
          </button>
        }
      />

      <main className="pw-main">
        <div className="pw-hero">
          <div className="pw-eyebrow">{t('QUẢN TRỊ', 'ADMIN')}</div>
          <h1 className="pw-title">{t('Kiểm Duyệt', 'Moderation')}</h1>
        </div>

        {checking ? (
          <p className="pw-empty">{t('Đang kiểm tra quyền…', 'Checking access…')}</p>
        ) : !auth.isSignedIn ? (
          <div className="pw-signin-prompt">
            <span>{t('Đăng nhập bằng tài khoản quản trị.', 'Sign in with your admin account.')}</span>
            <button type="button" className="pw-post-btn" onClick={() => setSignInOpen(true)}>
              {t('Đăng nhập', 'Sign in')}
            </button>
          </div>
        ) : !isAdmin ? (
          <p className="pw-empty">{t('Bạn không có quyền truy cập trang này.', 'You do not have access to this page.')}</p>
        ) : (
          <>
            <div className="adm-modes">
              <button type="button" className={mode === 'requests' ? 'is-active' : ''} onClick={() => setMode('requests')}>
                {t('Ý cầu nguyện', 'Requests')}
              </button>
              <button type="button" className={mode === 'members' ? 'is-active' : ''} onClick={() => setMode('members')}>
                {t('Thành viên', 'Members')}
              </button>
            </div>

            {mode === 'requests' ? (
              <div className="pw-sort adm-filters">
                {REQUEST_FILTERS.map((f) => (
                  <button key={f.key} type="button" className={filter === f.key ? 'is-active' : ''} onClick={() => setFilter(f.key)}>
                    {t(f.vi, f.en)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="pw-sort adm-filters">
                {MEMBER_FILTERS.map((f) => (
                  <button key={f.key} type="button" className={memberFilter === f.key ? 'is-active' : ''} onClick={() => setMemberFilter(f.key)}>
                    {t(f.vi, f.en)}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="pw-empty">{t('Đang tải…', 'Loading…')}</p>
            ) : mode === 'requests' ? (
              items.length === 0 ? (
                <p className="pw-empty">{t('Không có ý cầu nguyện nào.', 'No requests here.')}</p>
              ) : (
                <ul className="pw-list">
                  {items.map((it) => (
                    <li key={it.id} className="pw-card adm-card">
                      <div className="adm-meta">
                        <span className={`adm-badge adm-status-${it.status}`}>
                          {it.status === 'visible' && t('Hiển thị', 'Visible')}
                          {it.status === 'hidden' && t('Đã ẩn', 'Hidden')}
                          {it.status === 'removed' && t('Đã xóa', 'Removed')}
                        </span>
                        {it.report_count > 0 && <span className="adm-badge adm-reported">⚑ {it.report_count}</span>}
                        {it.poster_banned && <span className="adm-badge adm-banned">{t('Bị cấm', 'Banned')}</span>}
                        <span className="adm-dim">🙏 {it.prayed_count}</span>
                        <span className="adm-dim">{new Date(it.created_at).toLocaleString()}</span>
                      </div>

                      <p className="pw-body adm-body">{it.body}</p>

                      <div className="adm-poster">
                        {t('Người đăng', 'Poster')}: <code>{it.user_id.slice(0, 8)}</code> · {t('tổng bài', 'posts')}: {it.poster_total}
                      </div>

                      <div className="adm-actions">
                        {it.status !== 'visible' && (
                          <button type="button" disabled={busyId === it.id} onClick={() => setStatus(it.id, 'visible')}>
                            {t('Khôi phục', 'Restore')}
                          </button>
                        )}
                        {it.status === 'visible' && (
                          <button type="button" disabled={busyId === it.id} onClick={() => setStatus(it.id, 'hidden')}>
                            {t('Ẩn', 'Hide')}
                          </button>
                        )}
                        {it.status !== 'removed' && (
                          <button type="button" className="adm-danger" disabled={busyId === it.id} onClick={() => setStatus(it.id, 'removed')}>
                            {t('Xóa', 'Remove')}
                          </button>
                        )}
                        <button
                          type="button"
                          className={it.poster_banned ? '' : 'adm-danger'}
                          disabled={busyId === it.id || busyId === it.user_id}
                          onClick={() => toggleBan(it.user_id, it.poster_banned)}
                        >
                          {it.poster_banned ? t('Bỏ cấm', 'Unban') : t('Cấm người này', 'Ban poster')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : members.length === 0 ? (
              <p className="pw-empty">{t('Không có thành viên nào.', 'No members here.')}</p>
            ) : (
              <>
                <p className="adm-count">{t('Tổng thành viên hiển thị', 'Members shown')}: {members.length}</p>
                <ul className="pw-list">
                  {members.map((m) => (
                    <li key={m.id} className="pw-card adm-card">
                      <div className="adm-meta">
                        <code>{m.id.slice(0, 8)}</code>
                        {m.is_admin && <span className="adm-badge adm-reported">{t('Quản trị', 'Admin')}</span>}
                        {m.is_banned && <span className="adm-badge adm-banned">{t('Bị cấm', 'Banned')}</span>}
                        <span className="adm-dim">{t('tham gia', 'joined')} {new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="adm-poster">
                        {t('Bài đăng', 'Posts')}: {m.post_count} · {t('đã cầu nguyện', 'prayed')}: 🙏 {m.prayed_given}
                      </div>
                      {!m.is_admin && (
                        <div className="adm-actions">
                          <button
                            type="button"
                            className={m.is_banned ? '' : 'adm-danger'}
                            disabled={busyId === m.id}
                            onClick={() => toggleBan(m.id, m.is_banned)}
                          >
                            {m.is_banned ? t('Bỏ cấm', 'Unban') : t('Cấm', 'Ban')}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>

      {signInOpen && <SignInModal displayLang={displayLang} onClose={() => setSignInOpen(false)} />}
    </div>
  );
}
