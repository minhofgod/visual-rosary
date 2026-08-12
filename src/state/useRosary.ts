import { useMemo, useState } from 'react';
import { buildSequence } from '../data/sequence';
import type { MysteryKey } from '../data/types';

export function useRosary(mysteryKey: MysteryKey, initialStepIndex = 0) {
  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [direction, setDirection] = useState<1 | -1>(1);

  const steps = useMemo(() => buildSequence(mysteryKey), [mysteryKey]);
  const currentStep = steps[stepIndex];

  const next = () => {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const prev = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };
  const jumpToBead = (beadIndex: number) => {
    const firstStepOnBead = steps.findIndex((s) => s.beadIndex === beadIndex);
    if (firstStepOnBead === -1) return;
    setStepIndex((i) => {
      setDirection(firstStepOnBead < i ? -1 : 1);
      return firstStepOnBead;
    });
  };

  const jumpToIndex = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setStepIndex((i) => {
      setDirection(index < i ? -1 : 1);
      return index;
    });
  };

  return {
    steps,
    stepIndex,
    currentStep,
    direction,
    isComplete: stepIndex === steps.length - 1,
    next,
    prev,
    jumpToBead,
    jumpToIndex,
  };
}
