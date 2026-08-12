import type { Step } from './sequence';

export function findStepIndexBySlug(steps: Step[], slug: string): number {
  if (!slug) return 0;
  const i = steps.findIndex((s) => s.slug === slug);
  return i === -1 ? 0 : i;
}
