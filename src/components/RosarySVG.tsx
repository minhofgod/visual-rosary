import { useMemo } from 'react';
import { BEAD_LAYOUT } from '../data/sequence';
import { computeBeadPositions, VIEWBOX } from '../data/beadPositions';

interface Props {
  currentBeadIndex: number | null;
  onBeadClick: (beadIndex: number) => void;
}

export function RosarySVG({ currentBeadIndex, onBeadClick }: Props) {
  const points = useMemo(() => computeBeadPositions(BEAD_LAYOUT), []);
  const centerpiece = points.find((p) => p.kind === 'centerpiece')!;

  const stringPath = useMemo(() => {
    const parts = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    parts.push(`L ${centerpiece.x.toFixed(1)} ${centerpiece.y.toFixed(1)}`); // close the loop
    return parts.join(' ');
  }, [points, centerpiece]);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="rosary-svg"
      role="img"
      aria-label="Visual rosary"
    >
      <path d={stringPath} className="rosary-string" fill="none" />

      {points.map((p) => {
        const isCurrent = p.beadIndex === currentBeadIndex;
        const isDone = currentBeadIndex !== null && p.beadIndex < currentBeadIndex;

        if (p.kind === 'cross') {
          return (
            <g
              key={p.beadIndex}
              transform={`translate(${p.x}, ${p.y})`}
              className={`bead bead-cross ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
              onClick={() => onBeadClick(p.beadIndex)}
            >
              <rect x={-3} y={-14} width={6} height={28} rx={2} />
              <rect x={-10} y={-6} width={20} height={6} rx={2} />
              <circle r={16} className="hit-area" fill="transparent" />
            </g>
          );
        }

        return (
          <circle
            key={p.beadIndex}
            cx={p.x}
            cy={p.y}
            r={p.r}
            className={`bead bead-${p.kind} ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
            onClick={() => onBeadClick(p.beadIndex)}
          />
        );
      })}
    </svg>
  );
}
