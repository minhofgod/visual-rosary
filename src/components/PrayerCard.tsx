import { useState } from 'react';
import type { Step } from '../data/sequence';
import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual } from '../data/types';
import { Modal } from './Modal';

interface Props {
  step: Step;
  displayLang: DisplayLang;
  showFruits: boolean;
  showMeditations: boolean;
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

export function PrayerCard({ step, displayLang, showFruits, showMeditations }: Props) {
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  return (
    <div className="prayer-card">
      {step.mystery && (
        <div className="mystery-banner">
          <Text text={step.mystery.title} displayLang={displayLang} className="mystery-title" />

          {showFruits && (
            <>
              <div className="fruit-label">{displayLang === 'en' ? 'The Fruit of this Mystery is' : 'Hoa trái của ngắm này là'}</div>
              <Text text={step.mystery.petition} displayLang={displayLang} className="mystery-petition" />
            </>
          )}

          {showMeditations && (
            <button type="button" className="meditation-button" onClick={() => setMeditationOpen(true)}>
              {displayLang === 'en' ? 'View the Meditation' : 'Xem Bài Suy Niệm'}
            </button>
          )}
        </div>
      )}

      <div className="prayer-triggers">
        <button type="button" className="prayer-trigger" onClick={() => setPrayerOpen(true)}>
          <Text text={step.heading} displayLang={displayLang} className="prayer-trigger-label" />
          <span className="prayer-trigger-ellipsis">…</span>
        </button>

        {step.secondary && (
          <button type="button" className="prayer-trigger" onClick={() => setSecondaryOpen(true)}>
            <Text text={step.secondary.heading} displayLang={displayLang} className="prayer-trigger-label" />
            <span className="prayer-trigger-ellipsis">…</span>
          </button>
        )}
      </div>

      {prayerOpen && (
        <Modal title={displayLang === 'en' ? step.heading.en : step.heading.vi} onClose={() => setPrayerOpen(false)}>
          <Text text={step.prayer} displayLang={displayLang} className="prayer-text" />
        </Modal>
      )}

      {secondaryOpen && step.secondary && (
        <Modal
          title={displayLang === 'en' ? step.secondary.heading.en : step.secondary.heading.vi}
          onClose={() => setSecondaryOpen(false)}
        >
          <Text text={step.secondary.prayer} displayLang={displayLang} className="prayer-text" />
        </Modal>
      )}

      {meditationOpen && step.mystery && (
        <Modal title={displayLang === 'en' ? 'Meditation' : 'Suy Niệm'} onClose={() => setMeditationOpen(false)}>
          <Text text={step.mystery.meditation} displayLang={displayLang} className="meditation-text" />
        </Modal>
      )}
    </div>
  );
}
