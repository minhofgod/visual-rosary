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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
