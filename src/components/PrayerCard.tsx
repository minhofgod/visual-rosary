import { useState } from 'react';
import type { Step } from '../data/sequence';
import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual } from '../data/types';
import { Modal } from './Modal';

interface Props {
  step: Step;
  displayLang: DisplayLang;
  stepNumber: number;
  totalSteps: number;
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

export function PrayerCard({ step, displayLang, stepNumber, totalSteps, showFruits, showMeditations }: Props) {
  const [meditationOpen, setMeditationOpen] = useState(false);

  return (
    <div className="prayer-card">
      <div className="prayer-progress">
        {stepNumber} / {totalSteps}
      </div>

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

      <Text text={step.heading} displayLang={displayLang} className="prayer-heading" />
      <Text text={step.prayer} displayLang={displayLang} className="prayer-text" />

      {meditationOpen && step.mystery && (
        <Modal title={displayLang === 'en' ? 'Meditation' : 'Suy Niệm'} onClose={() => setMeditationOpen(false)}>
          <Text text={step.mystery.meditation} displayLang={displayLang} className="meditation-text" />
        </Modal>
      )}
    </div>
  );
}
