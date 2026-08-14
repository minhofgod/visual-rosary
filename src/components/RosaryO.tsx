// The Ô of "MÂN CÔI" rendered as a rosary (Claude Design logo kit): a beaded ring
// for the decade, a gold centerpiece where the pendant leaves the loop, and a gold
// crucifix on the pendant. The whole mark is rotated 22° about the ring centre so
// the crucifix swings clear of the letter and never reads as the dot-below of "ộ".
// The circumflex (^) stays upright and inherits currentColor from the surrounding
// text. Scales with font-size (em units); the crucifix hangs past the baseline, so
// keep some padding-bottom on the title line (overflow is visible).
const RING: [number, number][] = [
  [26.5, 8.74], [31.26, 13.5], [31.26, 26.5], [26.5, 31.26],
  [13.5, 31.26], [8.74, 26.5], [8.74, 13.5], [13.5, 8.74],
];
const GOLD_Q: [number, number][] = [[20, 7], [33, 20], [7, 20]];

interface Props {
  stringColor?: string;
  beadColor?: string;
  gold?: string;
}

export function RosaryO({ stringColor = '#ffffff', beadColor = '#ffffff', gold = '#c9a227' }: Props) {
  return (
    <svg
      viewBox="0 -14 40 48"
      width="0.86em"
      height="1.04em"
      aria-hidden="true"
      style={{ overflow: 'visible', verticalAlign: 'baseline', margin: '0 .04em' }}
    >
      {/* circumflex */}
      <path d="M11 1 L20 -7 L29 1" fill="none" stroke="currentColor" strokeWidth="3.4" />
      <g transform="rotate(22 20 20)">
        <circle cx="20" cy="20" r="13" fill="none" stroke={stringColor} strokeWidth="1.2" />
        <path d="M20 33 V44" stroke={stringColor} strokeWidth="1.2" fill="none" />
        <g fill={beadColor}>
          {RING.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" />
          ))}
        </g>
        <g fill={gold}>
          {GOLD_Q.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.9" />
          ))}
          <circle cx="20" cy="33" r="3.5" />
        </g>
        <path d="M18.2 44 h3.6 v11.5 h-3.6 z M13.9 47.6 h12.2 v3.6 h-12.2 z" fill={gold} />
      </g>
    </svg>
  );
}
