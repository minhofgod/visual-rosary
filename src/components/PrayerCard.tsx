import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Step } from '../data/sequence';
import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual } from '../data/types';
import { getBeadVerse } from '../data/beadVerses';
import { Modal } from './Modal';

interface Props {
  step: Step;
  displayLang: DisplayLang;
  showFruits: boolean;
  showMeditations: boolean;
  showScriptures: boolean;
}

// Long prayers (the Creed, above all) would otherwise force the modal to scroll —
// and a scroll gesture starting inside the modal gets picked up by the page's own
// swipe-navigation, advancing to the next step instead of scrolling the text. Scale
// the font down instead so the whole prayer fits without scrolling in the first place.
function prayerTextClass(text: Bilingual, displayLang: DisplayLang): string {
  const length = displayLang === 'both' ? text.vi.length + text.en.length : Math.max(text.vi.length, text.en.length);
  if (length > 550) return 'prayer-text prayer-text-sm';
  if (length > 350) return 'prayer-text prayer-text-md';
  return 'prayer-text';
}

function Text({ text, displayLang, className }: { text: Bilingual; displayLang: DisplayLang; className?: string }) {
  if (displayLang === 'both') {
    return (
      <div className={className}>
        <p lang="vi">{text.vi}</p>
        <p lang="en" className="secondary">
          {text.en}
        </p>
      </div>
    );
  }
  return (
    <p className={className} lang={displayLang}>
      {text[displayLang]}
    </p>
  );
}

// Matches visualrosary.org's own pacing: lines fade up one after another rather
// than the whole card appearing as a single block (measured ~0.2s between lines).
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const;

export function PrayerCard({ step, displayLang, showFruits, showMeditations, showScriptures }: Props) {
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [secondaryOpenIndex, setSecondaryOpenIndex] = useState<number | null>(null);

  // The 3 opening Hail Marys (before the decades begin) share kind:'hailMary' with the
  // decade beads but have no scripture verse and aren't part of a decade — they should
  // stay centered like the rest of the opening prayers, not use the bead-verse layout.
  const isDecadeBead = step.kind === 'hailMary' && step.decadeNumber !== undefined;
  const verse = isDecadeBead ? getBeadVerse(step.slug) : undefined;

  return (
    <motion.div
      className={`prayer-card${isDecadeBead ? ' prayer-card-bead' : ''}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {step.mystery && (
        <div className="mystery-banner">
          {step.mysteryEyebrow && (
            <motion.div variants={item}>
              <Text text={step.mysteryEyebrow} displayLang={displayLang} className="mystery-eyebrow" />
            </motion.div>
          )}
          <motion.div variants={item}>
            <Text text={step.mystery.title} displayLang={displayLang} className="mystery-title" />
          </motion.div>

          {showFruits && (
            <>
              <motion.div variants={item} className="fruit-label">
                {displayLang === 'en' ? 'The Fruit of this Mystery is' : 'Hoa trái của ngắm này là'}
              </motion.div>
              <motion.div variants={item}>
                <Text text={step.mystery.petition} displayLang={displayLang} className="mystery-petition" />
              </motion.div>
            </>
          )}

          {showMeditations && (
            <motion.div variants={item}>
              <button type="button" className="meditation-button" onClick={() => setMeditationOpen(true)}>
                {displayLang === 'en' ? 'View the Meditation' : 'Xem Bài Suy Niệm'}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {showScriptures && verse && (
        <motion.div variants={item} className="scripture-block">
          <Text
            text={{ vi: verse.vi, en: verse.en }}
            displayLang={displayLang}
            className="scripture-text"
          />
        </motion.div>
      )}

      {step.intention && (
        <motion.div variants={item}>
          <Text text={step.intention} displayLang={displayLang} className="prayer-intention" />
        </motion.div>
      )}

      <motion.div variants={item} className="prayer-triggers">
        <button type="button" className="prayer-trigger" onClick={() => setPrayerOpen(true)}>
          <Text text={step.heading} displayLang={displayLang} className="prayer-trigger-label" />
          <span className="prayer-trigger-ellipsis">…</span>
        </button>

        {step.secondary?.map((extra, i) => (
          <button
            key={i}
            type="button"
            className="prayer-trigger prayer-trigger-secondary"
            onClick={() => setSecondaryOpenIndex(i)}
          >
            <Text text={extra.heading} displayLang={displayLang} className="prayer-trigger-label" />
            <span className="prayer-trigger-ellipsis">…</span>
          </button>
        ))}
      </motion.div>

      {prayerOpen && (
        <Modal title={displayLang === 'en' ? step.heading.en : step.heading.vi} onClose={() => setPrayerOpen(false)}>
          <Text text={step.prayer} displayLang={displayLang} className={prayerTextClass(step.prayer, displayLang)} />
        </Modal>
      )}

      {secondaryOpenIndex !== null && step.secondary?.[secondaryOpenIndex] && (
        <Modal
          title={
            displayLang === 'en'
              ? step.secondary[secondaryOpenIndex].heading.en
              : step.secondary[secondaryOpenIndex].heading.vi
          }
          onClose={() => setSecondaryOpenIndex(null)}
        >
          <Text
            text={step.secondary[secondaryOpenIndex].prayer}
            displayLang={displayLang}
            className={prayerTextClass(step.secondary[secondaryOpenIndex].prayer, displayLang)}
          />
        </Modal>
      )}

      {meditationOpen && step.mystery && (
        <Modal title={displayLang === 'en' ? 'Meditation' : 'Suy Niệm'} onClose={() => setMeditationOpen(false)}>
          <Text text={step.mystery.meditation} displayLang={displayLang} className="meditation-text" />
        </Modal>
      )}
    </motion.div>
  );
}
