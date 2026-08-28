import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
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
import { AppHeader } from '../components/AppHeader';
import { MysteryBackground } from '../components/MysteryBackground';
import { mysterySets } from '../data/mysteries';
import { getRailView } from '../data/railView';
import { getMysteryImage } from '../data/mysteryImages';
import { getBeadImage } from '../data/beadImages';
import { buildSequence } from '../data/sequence';
import { findStepIndexBySlug } from '../data/slugs';
import { logPrayerCompletion } from '../lib/prayerStats';
import { recordCompletionLocal } from '../lib/prayerStreak';
import { recordDayServer } from '../lib/streakSync';
import { grantGift } from '../lib/wallpaperCollection';
import { saveResume, clearResume } from '../lib/resumeState';
import { useAuth } from '../state/useAuth';
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
  // On the final step (Hail, Holy Queen) a forward swipe means "I'm done" — send the
  // user home instead of clamping at the end. It takes a deliberate swipe/scroll
  // (≥50px drag or a wheel gesture), so a tap won't trigger it.
  const handleNext = () => {
    if (rosary.isComplete) navigate('/', { state: { justFinished: true } });
    else rosary.next();
  };
  const swipe = useSwipeNav(handleNext, rosary.prev);
  const auth = useAuth();

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
  // to its final step — powers the public "Rosaries Prayed Today" counter. Also bank one
  // Scripture-wallpaper gift credit (ref-guarded to once per prayed rosary) so it's earned
  // at completion, not when the reward is opened — quitting before picking never loses it.
  const giftedRef = useRef(false);
  useEffect(() => {
    if (rosary.isComplete) {
      logPrayerCompletion(mysteryKey);
      recordCompletionLocal(mysteryKey);
      if (auth.isSignedIn) recordDayServer(); // also record to the account when signed in
      if (!giftedRef.current) {
        giftedRef.current = true;
        grantGift();
      }
    }
  }, [rosary.isComplete, mysteryKey, auth.isSignedIn]);

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
    <div className="reading-screen" style={{ '--font-scale': settings.fontScale } as CSSProperties}>
      <MysteryBackground image={image?.file} gradientClass={`bg-${mysteryKey}`} direction={rosary.direction} />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <AppHeader
        displayLang={displayLang}
        setDisplayLang={setDisplayLang}
        settings={settings}
        onSettingsChange={setSettings}
        showReturnHome
        showFontSize
        showReadingLayout
        left={
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              if (confirm(displayLang === 'en' ? 'Leave the rosary?' : 'Rời khỏi chuỗi Mân Côi?')) navigate('/');
            }}
            aria-label={displayLang === 'en' ? 'Home' : 'Trang chủ'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
            </svg>
          </button>
        }
        center={<span className="reading-mystery-name">{displayLang === 'en' ? set.name.en : set.name.vi}</span>}
      />

      <div className="reading-body">
        {settings.beadPosition === 'left' && (
          <BeadRail
            rail={rail}
            position="left"
            displayLang={displayLang}
            onBeadClick={rosary.jumpToBead}
            onNext={handleNext}
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
            onNext={handleNext}
          />
        )}
      </div>

      {showFooterBar && currentMystery && (
        <PrayerFooter mystery={currentMystery} verse={footerVerse} displayLang={displayLang} />
      )}

      {rosary.isComplete && (
        <div className="closing-hint">{displayLang === 'en' ? 'Swipe up to finish ↑' : 'Vuốt lên để hoàn tất ↑'}</div>
      )}
    </div>
  );
}
