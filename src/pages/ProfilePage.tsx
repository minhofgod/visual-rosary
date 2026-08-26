import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LangToggle } from '../components/LangToggle';
import { MysteryBackground } from '../components/MysteryBackground';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { useAuth } from '../state/useAuth';
import { getStreakStats } from '../lib/prayerStreak';

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_VI = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// A "profile" view: the Google avatar/name (when signed in) plus the device-local
// prayer streak and a year-long heatmap of days a rosary was prayed. Streak data is
// device-local for now (no server sync); a future version can persist it per account.
export function ProfilePage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const auth = useAuth();

  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);
  const stats = useMemo(() => getStreakStats(), []);

  // Google identity (only present when signed in — sign-in currently lives behind the
  // dev-only wall, so in production this gracefully shows just the streak view).
  const meta = auth.user?.user_metadata as
    | { avatar_url?: string; picture?: string; full_name?: string; name?: string }
    | undefined;
  const avatarUrl = meta?.avatar_url || meta?.picture;
  const displayName = meta?.full_name || meta?.name || auth.user?.email || null;

  // Build ~53 weeks of days ending today, aligned so each column is Sun→Sat.
  const { cells, monthLabels } = useMemo(() => {
    const prayed = new Set(stats.prayedDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (52 * 7 + today.getDay()));

    const out: { key: string; prayed: boolean; future: boolean; month: number; day: number }[] = [];
    const labels: { col: number; label: string }[] = [];
    const cur = new Date(start);
    let col = 0;
    let lastMonth = -1;
    while (cur <= today) {
      // record a month label at the top of each column when the month changes
      if (cur.getDay() === 0) {
        if (cur.getMonth() !== lastMonth) {
          labels.push({ col, label: (displayLang === 'en' ? MONTH_EN : MONTH_VI)[cur.getMonth()] });
          lastMonth = cur.getMonth();
        }
        col++;
      }
      const key = localDateKey(cur);
      out.push({ key, prayed: prayed.has(key), future: cur > today, month: cur.getMonth(), day: cur.getDate() });
      cur.setDate(cur.getDate() + 1);
    }
    return { cells: out, monthLabels: labels };
  }, [stats.prayedDays, displayLang]);

  return (
    <div className="reading-screen pf-screen">
      <MysteryBackground image={image?.file} gradientClass="bg-landing" />
      <div className="bg-scrim" />

      <header className="reading-header">
        <button type="button" className="icon-button icon-button-back" onClick={() => navigate('/')} aria-label={t('Trang chủ', 'Home')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
          </svg>
        </button>
        <div className="reading-header-right">
          <LangToggle value={displayLang} onChange={setDisplayLang} />
        </div>
      </header>

      <main className="pf-main">
        <div className="pf-identity">
          {avatarUrl ? (
            <img className="pf-avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="pf-avatar pf-avatar-fallback" aria-hidden="true">🙏</div>
          )}
          <h1 className="pf-name">{displayName || t('Hồ Sơ', 'Profile')}</h1>
          {auth.isSignedIn && (
            <button type="button" className="pf-signout" onClick={() => auth.signOut()}>
              {t('Đăng xuất', 'Sign out')}
            </button>
          )}
        </div>

        <div className="pf-stats">
          <div className="pf-stat">
            <span className="pf-stat-num">🔥 {stats.currentStreak}</span>
            <span className="pf-stat-label">{t('Ngày liên tiếp', 'Day streak')}</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat-num">{stats.longestStreak}</span>
            <span className="pf-stat-label">{t('Dài nhất', 'Longest')}</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat-num">{stats.total}</span>
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

        {stats.total === 0 && (
          <p className="pf-empty">
            {t('Hãy lần một chuỗi Mân Côi để bắt đầu ghi lại hành trình cầu nguyện của bạn.', 'Pray a rosary to start tracking your prayer journey.')}
          </p>
        )}
      </main>
    </div>
  );
}
