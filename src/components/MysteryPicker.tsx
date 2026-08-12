import { mysterySets, todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';
import type { DisplayLang } from '../state/useDisplayLang';

interface Props {
  mysteryKey: MysteryKey;
  onSelect: (key: MysteryKey) => void;
  onStart: () => void;
  displayLang: DisplayLang;
}

const ORDER: MysteryKey[] = ['joyful', 'sorrowful', 'glorious', 'luminous'];

export function MysteryPicker({ mysteryKey, onSelect, onStart, displayLang }: Props) {
  const today = todaysMysteryKey();

  return (
    <div className="mystery-picker">
      <h1>{displayLang === 'en' ? 'Visual Rosary' : 'Lần Hạt Mân Côi'}</h1>
      <p className="subtitle">
        {displayLang === 'en' ? 'Choose which mysteries to pray today.' : 'Chọn ngắm nào để lần hạt hôm nay.'}
      </p>

      <div className="mystery-options">
        {ORDER.map((key) => {
          const set = mysterySets[key];
          const isToday = key === today;
          return (
            <button
              key={key}
              type="button"
              className={`mystery-option ${key === mysteryKey ? 'is-selected' : ''}`}
              onClick={() => onSelect(key)}
            >
              <span className="mystery-option-name">
                {displayLang === 'en' ? set.name.en : displayLang === 'both' ? `${set.name.vi} — ${set.name.en}` : set.name.vi}
              </span>
              {isToday && <span className="today-badge">{displayLang === 'en' ? 'Today' : 'Hôm nay'}</span>}
            </button>
          );
        })}
      </div>

      <button type="button" className="start-button" onClick={onStart}>
        {displayLang === 'en' ? 'Begin' : 'Bắt đầu'}
      </button>
    </div>
  );
}
