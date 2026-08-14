import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRosary } from '../state/useRosary';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSwipeNav } from '../state/useSwipeNav';
import { useSettings } from '../state/useSettings';
import { BeadRail } from '../components/BeadRail';
import { PrayerCard } from '../components/PrayerCard';
import { PrayerFooter } from '../components/PrayerFooter';
import { getBeadVerse } from '../data/beadVerses';
import { LangToggle } from '../components/LangToggle';
import { SettingsPanel } from '../components/SettingsPanel';
import { MysteryBackground } from '../components/MysteryBackground';
import { mysterySets } from '../data/mysteries';
import { getRailView } from '../data/railView';
import { getMysteryImage } from '../data/mysteryImages';
import { getBeadImage } from '../data/beadImages';
import { buildSequence } from '../data/sequence';
import { findStepIndexBySlug } from '../data/slugs';
import { logPrayerCompletion } from '../lib/prayerStats';
import { recordCompletionLocal } from '../lib/prayerStreak';
import { saveResume, clearResume } from '../lib/resumeState';
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

  // Log one completion (anonymous, session-guarded) when the rosary is prayed through
  // to its final step — powers the public "Rosaries Prayed Today" counter.
  useEffect(() => {
    if (rosary.isComplete) {
      logPrayerCompletion(mysteryKey);
      recordCompletionLocal(mysteryKey);
    }
  }, [rosary.isComplete, mysteryKey]);

  // Remember (or clear) where the user is, so the landing page can offer to
  // resume. Skip saving the final step — a finished rosary has nothing to resume.
  useEffect(() => {
    if (rosary.isComplete) {
      clearResume();
    } else {
      saveResume(mysteryKey, rosary.currentStep.slug);
    }
  }, [rosary.currentStep.slug, rosary.isComplete, mysteryKey]);

  const set = mysterySets[mysteryKey];
  const step = rosary.currentStep;
  const rail = getRailView(step, rosary.steps);
  // Decade steps use their own mystery's image. The opening prayers (before any
  // mystery has been announced) don't have one of their own, so they cycle through
  // this set's 5 mystery images instead — a themed preview of the decades ahead,
  // rather than a blank gradient. The closing prayer stays a plain gradient.
  // The closing prayer reuses the set's first mystery image, matching
  // visualrosary.org's own closing screen (which shows the same image its
  // introductory prayers opened with).
  const currentMystery = step.decadeNumber
    ? set.list[step.decadeNumber - 1]
    : step.kind === 'closing'
      ? set.list[0]
      : set.list[step.index % 5];
  // Prefer a bead-specific image (e.g. a unique painting per Hail Mary); fall back
  // to the one shared image for the whole mystery until that slug has been sourced.
  const image = getBeadImage(step.slug) ?? (currentMystery ? getMysteryImage(currentMystery.imageKey) : undefined);
  // The footer bar (mystery/fruit/reference) matches visualrosary.org's own "Footer"
  // setting: shown on Hail Mary and Glory Be sections within a decade only — not the
  // decade-intro banner (which already shows the mystery name and fruit on its own),
  // and not the opening tail's own Hail Marys/Glory Be, which happen before any
  // mystery has actually been announced yet.
  const isDecadeStep = step.decadeNumber !== undefined;
  const showFooterBar =
    settings.showFooter && isDecadeStep && (step.kind === 'hailMary' || step.kind === 'gloryBe');
  const footerVerse = step.kind === 'hailMary' && isDecadeStep ? getBeadVerse(step.slug) : undefined;

  return (
    <div className="reading-screen">
      <MysteryBackground image={image?.file} gradientClass={`bg-${mysteryKey}`} direction={rosary.direction} />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <header className="reading-header">
        <button type="button" className="icon-button icon-button-back" onClick={() => navigate('/')} aria-label="restart">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"
            />
          </svg>
        </button>
        <span className="reading-mystery-name">{displayLang === 'en' ? set.name.en : set.name.vi}</span>
        <div className="reading-header-right">
          <LangToggle value={displayLang} onChange={setDisplayLang} />
          <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="settings">
            ☰
          </button>
        </div>
      </header>

      <div className="reading-body">
        {settings.beadPosition === 'left' && (
          <BeadRail
            rail={rail}
            position="left"
            displayLang={displayLang}
            onBeadClick={rosary.jumpToBead}
            onNext={rosary.next}
          />
        )}

        <main
          className={`reading-main${step.kind === 'hailMary' && isDecadeStep ? ' reading-main-bead' : ''}`}
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
                showScriptures={settings.showScriptures}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        {settings.beadPosition === 'right' && (
          <BeadRail
            rail={rail}
            position="right"
            displayLang={displayLang}
            onBeadClick={rosary.jumpToBead}
            onNext={rosary.next}
          />
        )}
      </div>

      {showFooterBar && currentMystery && (
        <PrayerFooter mystery={currentMystery} verse={footerVerse} displayLang={displayLang} />
      )}

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
