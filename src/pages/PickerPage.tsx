import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
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
  const location = useLocation();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const today = todaysMysteryKey();
  const prayersToday = usePrayersToday();
  const streak = useStreak();
  const resume = useResume();
  const [shareOpen, setShareOpen] = useState(false);

  // Just finished a rosary (arrived home via the closing swipe)? Gently invite them to
  // pray for someone on the wall. Read once, then clear the history state so a refresh
  // or back/forward doesn't re-trigger it.
  const [finishNudgeOpen, setFinishNudgeOpen] = useState(
    () => Boolean((location.state as { justFinished?: boolean } | null)?.justFinished),
  );
  useEffect(() => {
    if ((location.state as { justFinished?: boolean } | null)?.justFinished) {
      window.history.replaceState({ ...window.history.state, usr: null }, '');
    }
  }, [location.state]);

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

      <AppHeader
        displayLang={displayLang}
        setDisplayLang={setDisplayLang}
        left={
          <div className="landing-wordmark">
            <span className="landing-wordmark-small">Đọc Kinh</span>
            <span className="landing-wordmark-big">
              Mân C<RosaryO />I
            </span>
            <span className="landing-wordmark-tagline">by MinhofGod</span>
          </div>
        }
      />

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

        <button type="button" className="landing-community-link" onClick={() => navigate('/y-cau-nguyen')}>
          🙏 {displayLang === 'en' ? 'Prayer Requests' : 'Ý Cầu Nguyện'}
        </button>

        {streak && <StreakCard stats={streak} displayLang={displayLang} onViewProfile={() => navigate('/ho-so')} />}

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

      {finishNudgeOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setFinishNudgeOpen(false)}>
            <div className="finish-nudge" onClick={(e) => e.stopPropagation()}>
              <div className="finish-nudge-emoji" aria-hidden="true">🙏</div>
              <h2 className="finish-nudge-title">
                {displayLang === 'en' ? 'Pray for someone?' : 'Cầu nguyện cho một người?'}
              </h2>
              <p className="finish-nudge-text">
                {displayLang === 'en'
                  ? 'Others have shared their intentions. Take a moment to pray for someone in the community.'
                  : 'Có anh chị em đang xin lời cầu nguyện. Hãy dành một phút cầu nguyện cho một người trong cộng đoàn.'}
              </p>
              <button type="button" className="finish-nudge-cta" onClick={() => navigate('/y-cau-nguyen')}>
                {displayLang === 'en' ? 'See Prayer Requests' : 'Xem Ý Cầu Nguyện'}
              </button>
              <button type="button" className="finish-nudge-later" onClick={() => setFinishNudgeOpen(false)}>
                {displayLang === 'en' ? 'Maybe later' : 'Để sau'}
              </button>
            </div>
          </div>,
          document.body,
        )}

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
