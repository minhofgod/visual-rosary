import { BEAD_LAYOUT, type BeadKind, type Step } from './sequence';
import type { Bilingual } from './types';

export interface RailItem {
  beadIndex: number;
  kind: BeadKind;
  state: 'done' | 'current' | 'pending';
}

export interface RailView {
  label: Bilingual;
  items: RailItem[];
}

const ORDINALS_EN = ['1st', '2nd', '3rd', '4th', '5th'];
const ORDINALS_VI = ['Thứ Nhất', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm'];

function stateFor(beadIndex: number, currentBeadIndex: number): RailItem['state'] {
  if (beadIndex < currentBeadIndex) return 'done';
  if (beadIndex === currentBeadIndex) return 'current';
  return 'pending';
}

export function getRailView(step: Step): RailView {
  if (step.kind === 'closing') {
    return {
      label: { vi: 'Kinh Kết', en: 'Closing Prayers' },
      items: [{ beadIndex: 0, kind: 'cross', state: 'current' }],
    };
  }

  if (step.decadeNumber === undefined) {
    // Opening: crucifix + tail (1 large + 3 small) + centerpiece
    const opening = BEAD_LAYOUT.slice(0, 6);
    return {
      label: { vi: 'Kinh Mở Đầu', en: 'Introductory Prayers' },
      items: opening.map((b) => ({ beadIndex: b.beadIndex, kind: b.kind, state: stateFor(b.beadIndex, step.beadIndex) })),
    };
  }

  const decadeBeads = BEAD_LAYOUT.filter((b) => b.decadeNumber === step.decadeNumber);
  return {
    label: { vi: ORDINALS_VI[step.decadeNumber - 1], en: ORDINALS_EN[step.decadeNumber - 1] },
    items: decadeBeads.map((b) => ({ beadIndex: b.beadIndex, kind: b.kind, state: stateFor(b.beadIndex, step.beadIndex) })),
  };
}
