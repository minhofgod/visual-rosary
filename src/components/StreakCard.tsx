import { useState } from 'react';
import type { DisplayLang } from '../state/useDisplayLang';
import type { StreakStats } from '../lib/prayerStreak';

const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DOW_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Short labels: "vi / en" on one line in both-mode, matching the app's convention.
function pick(vi: string, en: string, lang: DisplayLang) {
  if (lang === 'en') return en;
  if (lang === 'both') return `${vi} / ${en}`;
  return vi;
}

function dowLabel(dateKey: string, lang: DisplayLang) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const idx = new Date(y, m - 1, d).getDay();
  // One letter/abbrev per day; VI-first (both-mode uses the VI abbreviations to stay compact).
  return lang === 'en' ? DOW_EN[idx] : DOW_VI[idx];
}

const pad = (n: number) => String(n).padStart(2, '0');

interface Props {
  stats: StreakStats;
  displayLang: DisplayLang;
  onViewProfile?: () => void;
}

export function StreakCard({ stats, displayLang, onViewProfile }: Props) {
  const [showMonth, setShowMonth] = useState(false);

  // Nothing to show until a rosary has been prayed on this device.
  if (stats.total === 0) return null;

  // "Keep it going" nudge — encourages praying today, or confirms it's done.
  const nudge = stats.prayedToday
    ? { text: pick('Đã lần hạt hôm nay', 'Prayed today', displayLang), done: true }
    : stats.currentStreak > 0
      ? { text: pick('Hãy lần hạt hôm nay để giữ chuỗi ngày!', 'Pray today to keep your streak going!', displayLang), done: false }
      : { text: pick('Hãy bắt đầu lại hôm nay.', 'Start a new streak today.', displayLang), done: false };

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

      <div className={`streak-nudge${nudge.done ? ' is-done' : ''}`}>
        {nudge.done ? '✓ ' : ''}
        {nudge.text}
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

      <button
        type="button"
        className="streak-month-toggle"
        aria-expanded={showMonth}
        onClick={() => setShowMonth((v) => !v)}
      >
        {pick('Lịch tháng này', 'This month', displayLang)} {showMonth ? '▲' : '▼'}
      </button>

      {showMonth && <MonthCalendar prayedDays={stats.prayedDays} displayLang={displayLang} />}

      {onViewProfile && (
        <button type="button" className="streak-view-more" onClick={onViewProfile}>
          {pick('Xem cả năm', 'View full year', displayLang)} →
        </button>
      )}
    </div>
  );
}

function MonthCalendar({ prayedDays, displayLang }: { prayedDays: string[]; displayLang: DisplayLang }) {
  const prayedSet = new Set(prayedDays);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const todayDate = today.getDate();

  const startWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dow = displayLang === 'en' ? DOW_EN : DOW_VI;
  const title = pick(`Tháng ${month + 1}, ${year}`, `${MONTHS_EN[month]} ${year}`, displayLang);

  return (
    <div className="streak-month">
      <div className="streak-month-title">{title}</div>
      <div className="streak-month-grid">
        {dow.map((d, i) => (
          <div key={`h${i}`} className="streak-month-dow">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="streak-month-cell is-empty" />;
          const key = `${year}-${pad(month + 1)}-${pad(d)}`;
          const prayed = prayedSet.has(key);
          const isToday = d === todayDate;
          const isFuture = d > todayDate;
          return (
            <div
              key={key}
              className={`streak-month-cell${prayed ? ' is-prayed' : ''}${isToday ? ' is-today' : ''}${isFuture ? ' is-future' : ''}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
