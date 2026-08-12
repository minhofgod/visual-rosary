import { useMemo, useState } from 'react';
import { buildSequence } from '../data/sequence';
import { todaysMysteryKey } from '../data/mysteries';
import type { MysteryKey } from '../data/types';

export function useRosary() {
  const [mysteryKey, setMysteryKey] = useState<MysteryKey>(() => todaysMysteryKey());
  const [stepIndex, setStepIndex] = useState<number | null>(null); // null = not started

  const steps = useMemo(() => buildSequence(mysteryKey), [mysteryKey]);
  const currentStep = stepIndex === null ? null : steps[stepIndex];

  const start = () => setStepIndex(0);
  const restart = () => setStepIndex(null);
  const next = () => setStepIndex((i) => (i === null ? 0 : Math.min(i + 1, steps.length - 1)));
  const prev = () => setStepIndex((i) => (i === null ? null : Math.max(i - 1, 0)));
  const jumpToBead = (beadIndex: number) => {
    const firstStepOnBead = steps.findIndex((s) => s.beadIndex === beadIndex);
    if (firstStepOnBead !== -1) setStepIndex(firstStepOnBead);
  };

  return {
    mysteryKey,
    setMysteryKey,
    steps,
    stepIndex,
    currentStep,
    isComplete: stepIndex !== null && stepIndex === steps.length - 1,
    start,
    restart,
    next,
    prev,
    jumpToBead,
  };
}
