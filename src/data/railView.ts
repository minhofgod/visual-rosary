import { BEAD_LAYOUT, type BeadKind, type Step } from './sequence';
import type { Bilingual } from './types';

export interface RailItem {
  beadIndex: number;
  kind: BeadKind;
  state: 'done' | 'current' | 'pending';
  tooltip: Bilingual;
}

export interface RailView {
  label: Bilingual;
  items: RailItem[];
  /** true when `step` is the last one in its segment (opening/decade/closing) and
   * there's more beyond it — shows a "keep going" hint, matching visualrosary.org
   * (they only show their down-arrow at the end of a segment, not throughout). */
  isSegmentEnd: boolean;
}

const ORDINALS_EN = ['1st', '2nd', '3rd', '4th', '5th'];
const ORDINALS_VI = ['Thứ Nhất', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm'];

function stateFor(beadIndex: number, currentBeadIndex: number): RailItem['state'] {
  if (beadIndex < currentBeadIndex) return 'done';
  if (beadIndex === currentBeadIndex) return 'current';
  return 'pending';
}

function segmentKey(s: Step): string {
  if (s.kind === 'closing') return 'closing';
  if (s.decadeNumber !== undefined) return `decade-${s.decadeNumber}`;
  return 'opening';
}

function tooltipFor(beadIndex: number, steps: Step[]): Bilingual {
  const match = steps.find((s) => s.beadIndex === beadIndex && s.kind !== 'closing');
  return match ? match.heading : { vi: '', en: '' };
}

export function getRailView(step: Step, steps: Step[]): RailView {
  const nextStep = steps[step.index + 1];
  const isSegmentEnd = nextStep !== undefined && segmentKey(nextStep) !== segmentKey(step);

  if (step.kind === 'closing') {
    return {
      label: { vi: 'Kinh Kết', en: 'Closing Prayers' },
      items: [{ beadIndex: 0, kind: 'cross', state: 'current', tooltip: step.heading }],
      isSegmentEnd,
    };
  }

  if (step.decadeNumber === undefined) {
    // Opening: crucifix + tail (1 large + 3 small) + centerpiece
    const opening = BEAD_LAYOUT.slice(0, 6);
    return {
      label: { vi: 'Kinh Mở Đầu', en: 'Introductory Prayers' },
      items: opening.map((b) => ({
        beadIndex: b.beadIndex,
        kind: b.kind,
        state: stateFor(b.beadIndex, step.beadIndex),
        tooltip: tooltipFor(b.beadIndex, steps),
      })),
      isSegmentEnd,
    };
  }

  const decadeBeads = BEAD_LAYOUT.filter((b) => b.decadeNumber === step.decadeNumber);
  return {
    label: { vi: ORDINALS_VI[step.decadeNumber - 1], en: ORDINALS_EN[step.decadeNumber - 1] },
    items: decadeBeads.map((b) => ({
      beadIndex: b.beadIndex,
      kind: b.kind,
      state: stateFor(b.beadIndex, step.beadIndex),
      tooltip: tooltipFor(b.beadIndex, steps),
    })),
    isSegmentEnd,
  };
}
