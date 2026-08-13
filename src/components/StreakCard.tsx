import type { DisplayLang } from '../state/useDisplayLang';
import type { StreakStats } from '../lib/prayerStreak';

const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DOW_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Short labels: "vi / en" on one line in both-mode, matching the app's convention.
function pick(vi: string, en: string, lang: DisplayLang) {
  if (lang === 'en') return en;
  if (lang === 'both') return `${vi} / ${en}`;
  return vi;
}

function dowLabel(dateKey: string, lang: DisplayLang) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const idx = new Date(y, m - 1, d).getDay();
  // One letter per day; VI-first (both-mode uses the VI abbreviations to stay compact).
  return lang === 'en' ? DOW_EN[idx] : DOW_VI[idx];
}

interface Props {
  stats: StreakStats;
  displayLang: DisplayLang;
}

export function StreakCard({ stats, displayLang }: Props) {
  // Nothing to show until a rosary has been prayed on this device.
  if (stats.total === 0) return null;

  return (
    <div className="streak-card">
      <div className="streak-caption">{pick('Chuỗi ngày lần hạt của bạn', 'Your rosary streak', displayLang)}</div>

      <div className="streak-main">
        <span className="streak-flame" aria-hidden="true">
          🔥
        </span>
        <span className="streak-number">{stats.currentStreak}</span>
        <span className="streak-unit">
          {pick('ngày liên tiếp', stats.currentStreak === 1 ? 'day in a row' : 'days in a row', displayLang)}
        </span>
      </div>

      <div className="streak-week" role="group" aria-label={pick('Bảy ngày gần đây', 'Last seven days', displayLang)}>
        {stats.recentDays.map((d) => (
          <div key={d.date} className={`streak-day${d.prayed ? ' is-prayed' : ''}`}>
            <span className="streak-dot" />
            <span className="streak-dow">{dowLabel(d.date, displayLang)}</span>
          </div>
        ))}
      </div>

      <div className="streak-meta">
        <span>
          {pick('Dài nhất', 'Longest', displayLang)}: <b>{stats.longestStreak}</b>
        </span>
        <span className="streak-meta-sep" aria-hidden="true">
          ·
        </span>
        <span>
          {pick('Tổng số', 'Total', displayLang)}: <b>{stats.total}</b>
        </span>
      </div>
    </div>
  );
}
