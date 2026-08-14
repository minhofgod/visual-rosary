// Đọc Kinh Mân Côi wordmark. The Ô is a rosary — the symmetric mark rotated 22° about the
// ring centre, so the crucifix swings clear of the letter and never reads as the dot of "ộ".
const RING = [[26.5,8.74],[31.26,13.5],[31.26,26.5],[26.5,31.26],[13.5,31.26],[8.74,26.5],[8.74,13.5],[13.5,8.74]];
const GOLD_Q = [[20,7],[33,20],[7,20]];

export function RosaryO({ stringColor = '#ffffff', beadColor = '#ffffff', gold = '#c9a227' }) {
  return (
    <svg viewBox="0 -14 40 48" width="0.86em" height="1.04em" aria-hidden="true"
         style={{ overflow: 'visible', verticalAlign: 'baseline', margin: '0 .04em' }}>
      <path d="M11 1 L20 -7 L29 1" fill="none" stroke="currentColor" strokeWidth="3.4" />
      <g transform="rotate(22 20 20)">
        <circle cx="20" cy="20" r="13" fill="none" stroke={stringColor} strokeWidth="1.2" />
        <path d="M20 33 V44" stroke={stringColor} strokeWidth="1.2" fill="none" />
        <g fill={beadColor}>{RING.map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="2.1" />)}</g>
        <g fill={gold}>
          {GOLD_Q.map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="2.9" />)}
          <circle cx="20" cy="33" r="3.5" />
        </g>
        <path d="M18.2 44 h3.6 v11.5 h-3.6 z M13.9 47.6 h12.2 v3.6 h-12.2 z" fill={gold} />
      </g>
    </svg>
  );
}

export function Wordmark({ variant = 'full', tagline = true }) {
  if (variant === 'compact') {
    return (
      <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, letterSpacing: '.02em', whiteSpace: 'nowrap', paddingBottom: '.5em' }}>
        MÂN C<RosaryO />I
      </span>
    );
  }
  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.12em' }}>ĐỌC KINH</div>
      <div style={{ fontSize: 'clamp(28px, 8vw, 38px)', fontWeight: 700, letterSpacing: '.02em', lineHeight: 1.1, whiteSpace: 'nowrap', paddingBottom: '.5em' }}>
        MÂN C<RosaryO />I
      </div>
      {tagline && <div style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.5 }}>by MinhofGod</div>}
    </div>
  );
}
