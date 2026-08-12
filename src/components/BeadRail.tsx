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
  if (position === 'hidden') return null;

  return (
    <div className={`bead-rail bead-rail-${position}`}>
      <div className="bead-rail-label">{displayLang === 'en' ? rail.label.en : rail.label.vi}</div>
      <div className="bead-rail-track">
        {rail.items.map((item, i) => (
          <button
            key={i}
            type="button"
            className={`rail-dot rail-dot-${item.kind} is-${item.state}`}
            title={displayLang === 'en' ? item.tooltip.en : item.tooltip.vi}
            aria-label={displayLang === 'en' ? item.tooltip.en : item.tooltip.vi}
            onClick={() => onBeadClick(item.beadIndex)}
          />
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
