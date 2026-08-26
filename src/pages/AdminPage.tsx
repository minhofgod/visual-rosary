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
  adminSetStatus,
  adminSetBan,
  type AdminRequest,
  type AdminFilter,
  type RequestStatus,
} from '../lib/admin';

const FILTERS: { key: AdminFilter; vi: string; en: string }[] = [
  { key: 'reported', vi: 'Bị báo cáo', en: 'Reported' },
  { key: 'all', vi: 'Tất cả', en: 'All' },
  { key: 'visible', vi: 'Đang hiển thị', en: 'Visible' },
  { key: 'hidden', vi: 'Đã ẩn', en: 'Hidden' },
  { key: 'removed', vi: 'Đã xóa', en: 'Removed' },
];

// Admin-only moderation panel (/quan-tri). Self-gating: the page checks is_admin via an
// RPC and the actions are all server-gated too, so a non-admin sees nothing actionable.
export function AdminPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const auth = useAuth();
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<AdminFilter>('reported');
  const [items, setItems] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const load = useCallback(async (f: AdminFilter) => {
    setLoading(true);
    setItems(await adminListRequests(f));
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
      if (ok) load(filter);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isSignedIn]);

  useEffect(() => {
    if (isAdmin) load(filter);
  }, [filter, isAdmin, load]);

  async function setStatus(id: string, status: RequestStatus) {
    setBusyId(id);
    await adminSetStatus(id, status);
    await load(filter);
    setBusyId(null);
  }

  async function toggleBan(userId: string, banned: boolean) {
    if (!confirm(banned ? t('Bỏ cấm người này?', 'Unban this person?') : t('Cấm người này? Tất cả bài của họ sẽ bị ẩn.', "Ban this person? All their posts will be hidden."))) return;
    setBusyId(userId);
    await adminSetBan(userId, !banned);
    await load(filter);
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
            <div className="pw-sort adm-filters">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" className={filter === f.key ? 'is-active' : ''} onClick={() => setFilter(f.key)}>
                  {t(f.vi, f.en)}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="pw-empty">{t('Đang tải…', 'Loading…')}</p>
            ) : items.length === 0 ? (
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
            )}
          </>
        )}
      </main>

      {signInOpen && <SignInModal displayLang={displayLang} onClose={() => setSignInOpen(false)} />}
    </div>
  );
}
