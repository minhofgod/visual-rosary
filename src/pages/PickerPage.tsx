import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LangToggle } from '../components/LangToggle';
import { MysteryBackground } from '../components/MysteryBackground';
import { RosaryDiagram } from '../components/RosaryDiagram';
import { ShareModal } from '../components/ShareModal';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { usePrayersToday } from '../state/usePrayersToday';
import { mysterySets, todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';

const ORDER: MysteryKey[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

export function PickerPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const today = todaysMysteryKey();
  const prayersToday = usePrayersToday();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="reading-screen landing-screen">
      <MysteryBackground image={image?.file} gradientClass="bg-landing" />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <header className="reading-header">
        <div className="landing-wordmark">
          <span className="landing-wordmark-small">Đọc Kinh</span>
          <span className="landing-wordmark-big">Mân Côi</span>
          <span className="landing-wordmark-tagline">by MinhofGod</span>
        </div>
        <div className="reading-header-right">
          <LangToggle value={displayLang} onChange={setDisplayLang} />
        </div>
      </header>

      <main className="landing-main">
        <h1 className="landing-headline">
          {displayLang === 'en' ? 'Meditate on the Mysteries' : 'Suy Niệm Các Mầu Nhiệm'}
        </h1>

        <div className="landing-links">
          <div className="landing-links-label">{displayLang === 'en' ? 'Begin' : 'Bắt Đầu'}</div>
          {ORDER.map((key) => {
            const set = mysterySets[key];
            return (
              <button key={key} type="button" className="landing-link" onClick={() => navigate(`/${key}/pray`)}>
                {displayLang === 'en' ? set.name.en : set.name.vi}
                {key === today && <span className="today-badge">{displayLang === 'en' ? 'Today' : 'Hôm nay'}</span>}
              </button>
            );
          })}
        </div>

        {prayersToday !== null && prayersToday > 10 && (
          <div className="landing-prayer-count">
            <span className="landing-prayer-count-number">{prayersToday}</span>
            <span className="landing-prayer-count-label">
              {displayLang === 'en' ? 'Rosaries Prayed Today' : 'Người Đã Lần Hạt Hôm Nay'}
            </span>
          </div>
        )}
      </main>

      <button type="button" className="landing-share" onClick={() => setShareOpen(true)}>
        {displayLang === 'en' ? 'Share' : 'Chia sẻ'}
      </button>

      {shareOpen && <ShareModal displayLang={displayLang} onClose={() => setShareOpen(false)} />}

      <RosaryDiagram displayLang={displayLang} />
    </div>
  );
}
