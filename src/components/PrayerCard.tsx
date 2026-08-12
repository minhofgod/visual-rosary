import type { Step } from '../data/sequence';
import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual } from '../data/types';

interface Props {
  step: Step;
  displayLang: DisplayLang;
  stepNumber: number;
  totalSteps: number;
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

export function PrayerCard({ step, displayLang, stepNumber, totalSteps }: Props) {
  return (
    <div className="prayer-card">
      <div className="prayer-progress">
        {stepNumber} / {totalSteps}
      </div>

      {step.mystery && (
        <div className="mystery-banner">
          <Text text={step.mystery.title} displayLang={displayLang} className="mystery-title" />
          <Text text={step.mystery.petition} displayLang={displayLang} className="mystery-petition" />
        </div>
      )}

      <Text text={step.heading} displayLang={displayLang} className="prayer-heading" />
      <Text text={step.prayer} displayLang={displayLang} className="prayer-text" />
    </div>
  );
}
