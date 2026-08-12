import { useState } from 'react';
import type { RailView } from '../data/railView';
import type { DisplayLang } from '../state/useDisplayLang';
import type { BeadPosition } from '../state/useSettings';

interface Props {
  rail: RailView;
  position: BeadPosition;
  displayLang: DisplayLang;
  onBeadClick: (beadIndex: number) => void;
  onNext: () => void;
}

export function BeadRail({ rail, position, displayLang, onBeadClick, onNext }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (position === 'hidden') return null;

  return (
    <div className={`bead-rail bead-rail-${position}`}>
      <div className="bead-rail-label">{displayLang === 'en' ? rail.label.en : rail.label.vi}</div>
      <div className="bead-rail-track">
        {rail.items.map((item, i) => (
          <div key={i} className="rail-dot-wrap">
            <button
              type="button"
              className={`rail-dot rail-dot-${item.kind} is-${item.state}`}
              aria-label={displayLang === 'en' ? item.tooltip.en : item.tooltip.vi}
              onClick={() => onBeadClick(item.beadIndex)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            />
            {hovered === i && (
              <div className="rail-tooltip" role="tooltip">
                {displayLang === 'en' ? item.tooltip.en : item.tooltip.vi}
              </div>
            )}
          </div>
        ))}
      </div>
      {rail.isSegmentEnd && (
        <button
          type="button"
          className="bead-rail-more"
          onClick={onNext}
          aria-label={displayLang === 'en' ? 'Continue' : 'Tiếp tục'}
        >
          ⌄
        </button>
      )}
    </div>
  );
}
