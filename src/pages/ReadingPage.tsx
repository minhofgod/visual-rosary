import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRosary } from '../state/useRosary';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSwipeNav } from '../state/useSwipeNav';
import { useSettings } from '../state/useSettings';
import { BeadRail } from '../components/BeadRail';
import { PrayerCard } from '../components/PrayerCard';
import { LangToggle } from '../components/LangToggle';
import { SettingsPanel } from '../components/SettingsPanel';
import { MysteryBackground } from '../components/MysteryBackground';
import { mysterySets } from '../data/mysteries';
import { getRailView } from '../data/railView';
import { getMysteryImage } from '../data/mysteryImages';
import { getBeadImage } from '../data/beadImages';
import { buildSequence } from '../data/sequence';
import { findStepIndexBySlug } from '../data/slugs';
import type { MysteryKey } from '../data/types';

const slideVariants = {
  enter: (direction: 1 | -1) => ({ y: direction > 0 ? 36 : -36, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: 1 | -1) => ({ y: direction > 0 ? -36 : 36, opacity: 0 }),
};

function isMysteryKey(value: string | undefined): value is MysteryKey {
  return !!value && value in mysterySets;
}

export function ReadingPage() {
  const { mysteryKey } = useParams();
  const location = useLocation();

  if (!isMysteryKey(mysteryKey)) {
    return <Navigate to="/" replace />;
  }

  return <ReadingPageInner mysteryKey={mysteryKey} initialHash={location.hash.replace(/^#/, '')} />;
}

function ReadingPageInner({ mysteryKey, initialHash }: { mysteryKey: MysteryKey; initialHash: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialStepIndex] = useState(() => findStepIndexBySlug(buildSequence(mysteryKey), initialHash));

  const rosary = useRosary(mysteryKey, initialStepIndex);
  const { displayLang, setDisplayLang } = useDisplayLang();
  const { settings, setSettings } = useSettings();
  const swipe = useSwipeNav(rosary.next, rosary.prev);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keep the URL's hash in sync with the current step, so it's always shareable/bookmarkable.
  useEffect(() => {
    navigate({ hash: `#${rosary.currentStep.slug}` }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosary.currentStep.slug]);

  // A hash-only URL change (e.g. pasting a different deep link while this mystery is
  // already open) doesn't reload the page, so it won't re-run the initial-step lookup
  // above — react to it here instead. Ignore hash changes that are just our own sync.
  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (hash && hash !== rosary.currentStep.slug) {
      rosary.jumpToIndex(findStepIndexBySlug(rosary.steps, hash));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const set = mysterySets[mysteryKey];
  const rail = getRailView(rosary.currentStep);
  const step = rosary.currentStep;
  // Decade steps use their own mystery's image. The opening prayers (before any
  // mystery has been announced) don't have one of their own, so they cycle through
  // this set's 5 mystery images instead — a themed preview of the decades ahead,
  // rather than a blank gradient. The closing prayer stays a plain gradient.
  const currentMystery = step.decadeNumber
    ? set.list[step.decadeNumber - 1]
    : step.kind !== 'closing'
      ? set.list[step.index % 5]
      : undefined;
  // Prefer a bead-specific image (e.g. a unique painting per Hail Mary); fall back
  // to the one shared image for the whole mystery until that slug has been sourced.
  const image = getBeadImage(step.slug) ?? (currentMystery ? getMysteryImage(currentMystery.imageKey) : undefined);

  return (
    <div className="reading-screen">
      <MysteryBackground image={image?.file} gradientClass={`bg-${mysteryKey}`} />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <header className="reading-header">
        <button type="button" className="icon-button" onClick={() => navigate('/')} aria-label="restart">
          ←
        </button>
        <span className="reading-mystery-name">{displayLang === 'en' ? set.name.en : set.name.vi}</span>
        <div className="reading-header-right">
          <LangToggle value={displayLang} onChange={setDisplayLang} />
          <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="settings">
            ⚙
          </button>
        </div>
      </header>

      <div className="reading-body">
        {settings.beadPosition === 'left' && (
          <BeadRail rail={rail} position="left" displayLang={displayLang} onBeadClick={rosary.jumpToBead} />
        )}

        <main
          className="reading-main"
          onTouchStart={swipe.onTouchStart}
          onTouchEnd={swipe.onTouchEnd}
          onMouseDown={swipe.onMouseDown}
          onMouseUp={swipe.onMouseUp}
          onWheel={swipe.onWheel}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={rosary.direction}>
            <motion.div
              key={rosary.currentStep.index}
              custom={rosary.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.3, 0, 0.3, 1] }}
            >
              <PrayerCard
                step={rosary.currentStep}
                displayLang={displayLang}
                showFruits={settings.showFruits}
                showMeditations={settings.showMeditations}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        {settings.beadPosition === 'right' && (
          <BeadRail rail={rail} position="right" displayLang={displayLang} onBeadClick={rosary.jumpToBead} />
        )}
      </div>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
          displayLang={displayLang}
        />
      )}
    </div>
  );
}
