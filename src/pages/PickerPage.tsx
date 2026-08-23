import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LangToggle } from '../components/LangToggle';
import { MysteryBackground } from '../components/MysteryBackground';
import { RosaryDiagram } from '../components/RosaryDiagram';
import { HowToGuide } from '../components/HowToGuide';
import { ShareModal } from '../components/ShareModal';
import { StreakCard } from '../components/StreakCard';
import { RosaryO } from '../components/RosaryO';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { usePrayersToday } from '../state/usePrayersToday';
import { useStreak } from '../state/useStreak';
import { useResume } from '../state/useResume';
import { buildSequence } from '../data/sequence';
import { findStepIndexBySlug } from '../data/slugs';
import { mysterySets, todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';

const ORDER: MysteryKey[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

export function PickerPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const today = todaysMysteryKey();
  const prayersToday = usePrayersToday();
  const streak = useStreak();
  const resume = useResume();
  const [shareOpen, setShareOpen] = useState(false);

  // Resolve the saved resume point into its mystery set + step heading for the label.
  const resumeInfo = useMemo(() => {
    if (!resume || !(resume.mysteryKey in mysterySets)) return null;
    const key = resume.mysteryKey as MysteryKey;
    const steps = buildSequence(key);
    const step = steps[findStepIndexBySlug(steps, resume.slug)];
    return { key, set: mysterySets[key], step };
  }, [resume]);

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
          <span className="landing-wordmark-big">
            Mân C<RosaryO />I
          </span>
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
          {resumeInfo && (
            <button
              type="button"
              className="landing-resume"
              onClick={() => navigate(`/${resumeInfo.key}/pray#${resumeInfo.step.slug}`)}
            >
              <span className="landing-resume-label">
                {displayLang === 'en' ? 'Continue where you left off' : 'Tiếp tục nơi đã dừng'}
              </span>
              <span className="landing-resume-sub">
                {displayLang === 'en' ? resumeInfo.set.name.en : resumeInfo.set.name.vi} ·{' '}
                {displayLang === 'en' ? resumeInfo.step.heading.en : resumeInfo.step.heading.vi}
              </span>
            </button>
          )}

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

        {import.meta.env.DEV && (
          <button type="button" className="landing-community-link" onClick={() => navigate('/y-cau-nguyen')}>
            🙏 {displayLang === 'en' ? 'Prayer Requests' : 'Ý Cầu Nguyện'}
          </button>
        )}

        {streak && <StreakCard stats={streak} displayLang={displayLang} />}

        {prayersToday !== null && (
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

      <HowToGuide displayLang={displayLang} />

      <footer className="site-footer">
        <a href="/privacy.html">{displayLang === 'en' ? 'Privacy Policy' : 'Chính Sách Bảo Mật'}</a>
        <span className="site-footer-sep" aria-hidden="true">·</span>
        <span>© Đọc Kinh Mân Côi</span>
      </footer>
    </div>
  );
}
