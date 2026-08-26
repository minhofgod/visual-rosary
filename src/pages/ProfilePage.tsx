import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { MysteryBackground } from '../components/MysteryBackground';
import { SignInModal } from '../components/SignInModal';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { useAuth } from '../state/useAuth';
import { useStreak } from '../state/useStreak';
import { getMyRequests, deleteRequest, type WallItem } from '../lib/prayerWall';

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_VI = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EMPTY_DAYS: string[] = [];

// Profile: the Google avatar/name (when signed in), the streak + total, and a
// year-long "rosary heatmap". Streak data comes from useStreak, which is device-local
// when signed out and merged with the account (synced across devices) when signed in.
export function ProfilePage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const auth = useAuth();
  const stats = useStreak();
  const [signInOpen, setSignInOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<WallItem[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  const meta = auth.user?.user_metadata as
    | { avatar_url?: string; picture?: string; full_name?: string; name?: string }
    | undefined;
  const avatarUrl = meta?.avatar_url || meta?.picture;
  const displayName = meta?.full_name || meta?.name || auth.user?.email || null;

  const prayedDays = stats?.prayedDays ?? EMPTY_DAYS;

  const { cells, monthLabels } = useMemo(() => {
    const prayed = new Set(prayedDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (52 * 7 + today.getDay()));

    const out: { key: string; prayed: boolean; future: boolean }[] = [];
    const labels: { col: number; label: string }[] = [];
    const cur = new Date(start);
    let col = 0;
    let lastMonth = -1;
    while (cur <= today) {
      if (cur.getDay() === 0) {
        if (cur.getMonth() !== lastMonth) {
          labels.push({ col, label: (displayLang === 'en' ? MONTH_EN : MONTH_VI)[cur.getMonth()] });
          lastMonth = cur.getMonth();
        }
        col++;
      }
      const key = localDateKey(cur);
      out.push({ key, prayed: prayed.has(key), future: cur > today });
      cur.setDate(cur.getDate() + 1);
    }
    return { cells: out, monthLabels: labels };
  }, [prayedDays, displayLang]);

  // The signed-in user's own prayer requests. RLS scopes this to their rows only, so
  // it's private to them even though the same posts appear anonymously on the wall.
  useEffect(() => {
    if (!auth.isSignedIn) {
      setMyRequests([]);
      return;
    }
    let cancelled = false;
    setLoadingReqs(true);
    getMyRequests().then((r) => {
      if (cancelled) return;
      setMyRequests(r);
      setLoadingReqs(false);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.isSignedIn]);

  async function removeRequest(id: string) {
    if (!confirm(t('Xoá ý cầu nguyện này?', 'Delete this prayer request?'))) return;
    setBusyId(id);
    const ok = await deleteRequest(id);
    if (ok) setMyRequests((prev) => prev.filter((x) => x.id !== id));
    setBusyId(null);
  }

  return (
    <div className="reading-screen pf-screen">
      <MysteryBackground image={image?.file} gradientClass="bg-landing" />
      <div className="bg-scrim" />

      <AppHeader
        displayLang={displayLang}
        setDisplayLang={setDisplayLang}
        showProfile={false}
        left={
          <button type="button" className="icon-button icon-button-back" onClick={() => navigate('/')} aria-label={t('Trang chủ', 'Home')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
          </button>
        }
      />

      <main className="pf-main">
        <div className="pf-identity">
          {avatarUrl ? (
            <img className="pf-avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="pf-avatar pf-avatar-fallback" aria-hidden="true">🙏</div>
          )}
          <h1 className="pf-name">{displayName || t('Hồ Sơ', 'Profile')}</h1>
          {auth.isSignedIn ? (
            <button type="button" className="pf-signout" onClick={() => auth.signOut()}>
              {t('Đăng xuất', 'Sign out')}
            </button>
          ) : (
            <button type="button" className="pf-signin" onClick={() => setSignInOpen(true)}>
              {t('Đăng nhập để lưu chuỗi ngày', 'Sign in to save your streak')}
            </button>
          )}

          {auth.isSignedIn ? (
            <p className="pf-sync-note pf-synced">
              {t(
                '✓ Đã đồng bộ với tài khoản — chuỗi ngày của bạn theo bạn trên mọi thiết bị.',
                '✓ Synced to your account — your streak follows you across devices.',
              )}
            </p>
          ) : (
            <p className="pf-sync-note">
              {t(
                'Chuỗi ngày hiện chỉ được lưu trên thiết bị này và có thể bị mất nếu bạn xoá dữ liệu trình duyệt hoặc đổi máy. Hãy đăng nhập để đồng bộ trên mọi thiết bị — chuỗi ngày hiện tại của bạn vẫn được giữ nguyên.',
                'Your streak is saved only on this device right now and could be lost if you clear your browser or switch devices. Sign in to sync it across all your devices — your current streak is kept.',
              )}
            </p>
          )}
        </div>

        <div className="pf-stats">
          <div className="pf-stat">
            <span className="pf-stat-num">🔥 {stats?.currentStreak ?? 0}</span>
            <span className="pf-stat-label">{t('Ngày liên tiếp', 'Day streak')}</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat-num">{stats?.longestStreak ?? 0}</span>
            <span className="pf-stat-label">{t('Dài nhất', 'Longest')}</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat-num">{stats?.total ?? 0}</span>
            <span className="pf-stat-label">{t('Tổng số chuỗi', 'Total rosaries')}</span>
          </div>
        </div>

        <h2 className="pf-heatmap-title">{t('Một năm cầu nguyện', 'A year of prayer')}</h2>
        <div className="pf-heatmap-scroll">
          <div className="pf-heatmap-inner">
            <div className="pf-heatmap-months">
              {monthLabels.map((m) => (
                <span key={`${m.col}-${m.label}`} className="pf-month-label" style={{ gridColumn: m.col + 1 }}>
                  {m.label}
                </span>
              ))}
            </div>
            <div className="pf-heatmap">
              {cells.map((c) => (
                <div
                  key={c.key}
                  className={`pf-cell${c.prayed ? ' is-prayed' : ''}${c.future ? ' is-future' : ''}`}
                  title={c.key}
                />
              ))}
            </div>
          </div>
        </div>

        {prayedDays.length === 0 && (
          <p className="pf-empty">
            {t('Hãy lần một chuỗi Mân Côi để bắt đầu ghi lại hành trình cầu nguyện của bạn.', 'Pray a rosary to start tracking your prayer journey.')}
          </p>
        )}

        {auth.isSignedIn && (
          <section className="pf-requests">
            <h2 className="pf-heatmap-title">{t('Ý cầu nguyện của bạn', 'Your prayer requests')}</h2>
            <p className="pf-req-note">
              {t(
                'Chỉ mình bạn thấy các bài của mình ở đây. Trên tường, chúng vẫn hoàn toàn ẩn danh.',
                'Only you can see your own here. On the wall, they stay completely anonymous.',
              )}
            </p>

            {loadingReqs ? (
              <p className="pf-empty">{t('Đang tải…', 'Loading…')}</p>
            ) : myRequests.length === 0 ? (
              <p className="pf-empty">
                {t('Bạn chưa đăng ý cầu nguyện nào.', "You haven't posted any prayer requests yet.")}{' '}
                <button type="button" className="pf-req-link" onClick={() => navigate('/y-cau-nguyen')}>
                  {t('Đến bức tường cầu nguyện', 'Go to the prayer wall')}
                </button>
              </p>
            ) : (
              <ul className="pf-req-list">
                {myRequests.map((r) => (
                  <li key={r.id} className="pf-req-card">
                    <p className="pf-req-body">{r.body}</p>
                    <div className="pf-req-meta">
                      <span className="pf-req-prayed">
                        🙏 {r.prayed_count} {t('lời cầu', r.prayed_count === 1 ? 'prayer' : 'prayers')}
                      </span>
                      <span className="pf-req-date">{new Date(r.created_at).toLocaleDateString()}</span>
                      <button
                        type="button"
                        className="pf-req-del"
                        disabled={busyId === r.id}
                        onClick={() => removeRequest(r.id)}
                      >
                        {t('Xoá', 'Delete')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {signInOpen && <SignInModal displayLang={displayLang} onClose={() => setSignInOpen(false)} />}
    </div>
  );
}
