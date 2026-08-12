import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LangToggle } from '../components/LangToggle';
import { MysteryBackground } from '../components/MysteryBackground';
import { RosaryDiagram } from '../components/RosaryDiagram';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { mysterySets, todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';

const ORDER: MysteryKey[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

export function PickerPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const today = todaysMysteryKey();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Đọc Kinh Mân Côi', url });
      } catch {
        // user cancelled the share sheet — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — nothing more we can do here
    }
  };

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
      </main>

      <button type="button" className="landing-share" onClick={handleShare}>
        {copied ? (displayLang === 'en' ? 'Copied!' : 'Đã sao chép!') : displayLang === 'en' ? 'Share' : 'Chia sẻ'}
      </button>

      <RosaryDiagram displayLang={displayLang} />
    </div>
  );
}
