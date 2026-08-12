import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Bilingual } from '../data/types';
import type { DisplayLang } from '../state/useDisplayLang';
import { mysterySets, todaysMysteryKey } from '../data/mysteries';

interface Props {
  displayLang: DisplayLang;
}

const GOLD = '#c9a227';
const CREAM = '#e6dcc3';

// ---- Bead-loop geometry, ported from the Claude Design mockup's own math
// (verified against a real physical rosary's bead order: 54 loop positions
// with a large bead every 11th — 4 decade-transition beads plus the joining
// bead below — matching the traditional 5-decade + centerpiece structure). ----
const CX = 350;
const CY = 300;
const R = 195;
const STEP_DEG = 348 / 53;

function pointAt(i: number) {
  const a = ((96 + STEP_DEG * i) * Math.PI) / 180;
  return { x: +(CX + R * Math.cos(a)).toFixed(2), y: +(CY + R * Math.sin(a)).toFixed(2) };
}

const loopBeads = Array.from({ length: 54 }, (_, i) => {
  const large = i % 11 === 10;
  return { ...pointAt(i), r: large ? 9 : 5.5, fill: large ? GOLD : CREAM };
});

const tailBeads = [
  { y: 545, r: 9 },
  { y: 585, r: 5.5 },
  { y: 610, r: 5.5 },
  { y: 635, r: 5.5 },
  { y: 672, r: 9 },
].map((b) => ({ ...b, fill: b.r > 6 ? GOLD : CREAM }));

interface Callout {
  step: number;
  lx: number;
  ly: number;
  tx: number;
  ty: number;
}

const L = 66;
const R_X = 634;
const rawCallouts: { step: number; lx: number; ly: number; t: [number, number] }[] = [
  { step: 1, lx: L, ly: 745, t: [340, 745] },
  { step: 2, lx: L, ly: 672, t: [341, 672] },
  { step: 3, lx: L, ly: 610, t: [291, 610] },
  { step: 4, lx: L, ly: 545, t: [341, 545] },
  { step: 6, lx: L, ly: 470, t: [pointAt(3).x, pointAt(3).y] },
  { step: 7, lx: L, ly: 372, t: [pointAt(10).x, pointAt(10).y] },
  { step: 8, lx: L, ly: 160, t: [pointAt(21).x, pointAt(21).y] },
  { step: 5, lx: R_X, ly: 470, t: [361, 488] },
  { step: 9, lx: R_X, ly: 545, t: [361, 503] },
  { step: 10, lx: R_X, ly: 700, t: [360, 706] },
];

const callouts: Callout[] = rawCallouts.map((c) => ({ step: c.step, lx: c.lx, ly: c.ly, tx: c.t[0], ty: c.t[1] }));

interface LegendItem {
  step: number;
  title: Bilingual;
  desc: Bilingual;
  gloss: Bilingual;
}

const legend: LegendItem[] = [
  {
    step: 1,
    title: { vi: 'Tượng Chuộc Tội', en: 'Crucifix' },
    desc: { vi: 'Làm Dấu Thánh Giá, đọc Kinh Tin Kính.', en: '' },
    gloss: { vi: '', en: 'Sign of the Cross, Apostles’ Creed' },
  },
  {
    step: 2,
    title: { vi: 'Hạt lớn đầu tiên', en: 'First large bead' },
    desc: { vi: 'Đọc một Kinh Lạy Cha.', en: '' },
    gloss: { vi: '', en: 'Our Father' },
  },
  {
    step: 3,
    title: { vi: 'Ba hạt nhỏ', en: 'Three small beads' },
    desc: { vi: 'Đọc ba Kinh Kính Mừng: tin, cậy, mến.', en: '' },
    gloss: { vi: '', en: 'Three Hail Marys — faith, hope, charity' },
  },
  {
    step: 4,
    title: { vi: 'Hạt lớn kế tiếp', en: 'Next large bead' },
    desc: { vi: 'Đọc một Kinh Sáng Danh.', en: '' },
    gloss: { vi: '', en: 'Glory Be' },
  },
  {
    step: 5,
    title: { vi: 'Hạt nối', en: 'Joining bead' },
    desc: { vi: 'Ngắm mầu nhiệm thứ nhất, đọc Kinh Lạy Cha.', en: '' },
    gloss: { vi: '', en: 'Announce the first Mystery, Our Father' },
  },
  {
    step: 6,
    title: { vi: 'Mười hạt nhỏ', en: 'Ten small beads' },
    desc: { vi: 'Đọc mười Kinh Kính Mừng, suy niệm mầu nhiệm.', en: '' },
    gloss: { vi: '', en: 'Ten Hail Marys, meditating on the Mystery' },
  },
  {
    step: 7,
    title: { vi: 'Giữa mỗi chục', en: 'Between decades' },
    desc: { vi: 'Đọc Kinh Sáng Danh và Kinh Fatima.', en: '' },
    gloss: { vi: '', en: 'Glory Be and the Fatima Prayer' },
  },
  {
    step: 8,
    title: { vi: 'Hạt lớn kế', en: 'Next large bead' },
    desc: { vi: 'Ngắm mầu nhiệm tiếp theo, đọc Kinh Lạy Cha. Lặp lại bước 6-8 cho năm chục.', en: '' },
    gloss: { vi: '', en: 'Repeat steps 6-8 for all five decades' },
  },
  {
    step: 9,
    title: { vi: 'Trở lại hạt nối', en: 'Back at the joining bead' },
    desc: { vi: 'Đọc Kinh Lạy Nữ Vương.', en: '' },
    gloss: { vi: '', en: 'Hail, Holy Queen' },
  },
  {
    step: 10,
    title: { vi: 'Tượng Chuộc Tội', en: 'Crucifix' },
    desc: { vi: 'Lời nguyện kết và Dấu Thánh Giá.', en: '' },
    gloss: { vi: '', en: 'Closing prayer and Sign of the Cross' },
  },
];

const DAY_NAMES: Record<number, Bilingual> = {
  0: { vi: 'Chúa Nhật', en: 'Sun' },
  1: { vi: 'Thứ Hai', en: 'Mon' },
  2: { vi: 'Thứ Ba', en: 'Tue' },
  3: { vi: 'Thứ Tư', en: 'Wed' },
  4: { vi: 'Thứ Năm', en: 'Thu' },
  5: { vi: 'Thứ Sáu', en: 'Fri' },
  6: { vi: 'Thứ Bảy', en: 'Sat' },
};

const MYSTERY_ORDER: (keyof typeof mysterySets)[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

function pick(text: Bilingual, lang: DisplayLang) {
  return lang === 'en' ? text.en : text.vi;
}

export function RosaryDiagram({ displayLang }: Props) {
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const today = todaysMysteryKey();

  return (
    <section className="rosary-diagram">
      <div className="rosary-diagram-eyebrow">SƠ ĐỒ LẦN CHUỖI</div>
      <h2 className="rosary-diagram-title">Cách Lần Chuỗi Mân Côi</h2>
      <p className="rosary-diagram-subtitle">How to pray the Rosary</p>

      <div className="rosary-diagram-body">
        <svg viewBox="0 0 700 800" className="rosary-diagram-svg" role="img" aria-label="Sơ đồ chuỗi Mân Côi năm mươi chín hạt, đánh số mười bước">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#5b4c33" strokeWidth="1.5" />
          <line x1={CX} y1={CY + R} x2={CX} y2="694" stroke="#5b4c33" strokeWidth="1.5" />

          <text x={CX} y={CY - 8} textAnchor="middle" className="rosary-diagram-loop-title">
            Năm Chục Kinh
          </text>
          <text x={CX} y={CY + 20} textAnchor="middle" className="rosary-diagram-loop-subtitle">
            five decades
          </text>

          {loopBeads.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.fill} />
          ))}
          {tailBeads.map((b, i) => (
            <circle key={i} cx={CX} cy={b.y} r={b.r} fill={b.fill} />
          ))}
          <circle cx={CX} cy="495" r="11" fill={GOLD} />

          {/* crucifix */}
          <path d="M344 690 h12 v80 h-12 z" fill="none" stroke={GOLD} strokeWidth="2" />
          <path d="M318 712 h64 v14 h-64 z" fill="none" stroke={GOLD} strokeWidth="2" />

          {callouts.map((c) => {
            const dx = c.tx - c.lx;
            const dy = c.ty - c.ly;
            const d = Math.hypot(dx, dy) || 1;
            const ux = dx / d;
            const uy = dy / d;
            const isActive = active === c.step;
            return (
              <g
                key={c.step}
                className="rosary-diagram-callout"
                onMouseEnter={() => setActive(c.step)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(isActive ? null : c.step)}
              >
                <line
                  x1={c.lx + ux * 17}
                  y1={c.ly + uy * 17}
                  x2={c.tx - ux * 9}
                  y2={c.ty - uy * 9}
                  stroke={isActive ? GOLD : '#5b4c33'}
                  strokeWidth={isActive ? 1.5 : 1}
                />
                <circle cx={c.lx} cy={c.ly} r={isActive ? 17 : 15} fill={GOLD} style={{ transition: 'r 0.15s ease' }} />
                <text x={c.lx} y={c.ly} dy="0.36em" textAnchor="middle" className="rosary-diagram-badge-num">
                  {c.step}
                </text>
              </g>
            );
          })}
        </svg>

        <ol className="rosary-diagram-legend">
          {legend.map((item) => (
            <li
              key={item.step}
              className={`rosary-diagram-legend-item${active === item.step ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(item.step)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === item.step ? null : item.step)}
            >
              <span className="rosary-diagram-legend-num">{item.step}</span>
              <div>
                <div className="rosary-diagram-legend-title">{pick(item.title, displayLang)}</div>
                {item.desc.vi && displayLang !== 'en' && (
                  <div className="rosary-diagram-legend-desc">{item.desc.vi}</div>
                )}
                <div className="rosary-diagram-legend-gloss">{item.gloss.en}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rosary-diagram-days-eyebrow">CÁC MẦU NHIỆM THEO NGÀY</div>
      <div className="rosary-diagram-days">
        {MYSTERY_ORDER.map((key) => {
          const set = mysterySets[key];
          return (
            <div key={key} className="rosary-diagram-day">
              <div className="rosary-diagram-day-title">{set.name.vi}</div>
              <div className="rosary-diagram-day-sub">
                {set.days.map((d) => DAY_NAMES[d].vi).join(' · ')} — {set.name.en.replace('The ', '').replace(' Mysteries', '')}
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="rosary-diagram-cta" onClick={() => navigate(`/${today}/pray`)}>
        {displayLang === 'en' ? 'Ready to pray? →' : 'Sẵn sàng cầu nguyện? →'}
      </button>
    </section>
  );
}
