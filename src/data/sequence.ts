import { prayers } from './prayers';
import { mysterySets } from './mysteries';
import type { Bilingual, Mystery, MysteryKey } from './types';

export type BeadKind = 'cross' | 'centerpiece' | 'large' | 'small';

export interface BeadLayoutItem {
  beadIndex: number;
  kind: BeadKind;
  /** 1-5 while inside a decade loop, undefined for the crucifix/tail/centerpiece */
  decadeNumber?: number;
  /** position of this small bead within its decade (1-10) */
  beadInDecade?: number;
}

/**
 * The physical bead layout is identical every time — 1 crucifix, 1 large + 3 small
 * on the tail, 1 centerpiece, then 5 decades of (1 large + 10 small). Only which
 * prayers land on which bead changes with the chosen mystery set, so this is
 * computed once and reused for every rosary.
 */
export function buildBeadLayout(): BeadLayoutItem[] {
  const beads: BeadLayoutItem[] = [];
  let i = 0;

  beads.push({ beadIndex: i++, kind: 'cross' });
  beads.push({ beadIndex: i++, kind: 'large' });
  for (let s = 0; s < 3; s++) beads.push({ beadIndex: i++, kind: 'small' });
  beads.push({ beadIndex: i++, kind: 'centerpiece' });

  for (let d = 1; d <= 5; d++) {
    beads.push({ beadIndex: i++, kind: 'large', decadeNumber: d });
    for (let b = 1; b <= 10; b++) {
      beads.push({ beadIndex: i++, kind: 'small', decadeNumber: d, beadInDecade: b });
    }
  }

  return beads;
}

export const BEAD_LAYOUT = buildBeadLayout();

export type StepKind =
  | 'sign'
  | 'creed'
  | 'ourFather'
  | 'hailMary'
  | 'gloryBe'
  | 'fatima'
  | 'decadeIntro'
  | 'closing';

export interface Step {
  index: number;
  beadIndex: number;
  kind: StepKind;
  prayer: Bilingual;
  heading: Bilingual;
  /** URL-safe id for deep-linking, e.g. "annunciation-hail-mary-9" (matches visualrosary.org's scheme) */
  slug: string;
  mystery?: Mystery;
  decadeNumber?: number;
  beadInDecade?: number;
}

const heading = (vi: string, en: string): Bilingual => ({ vi, en });

export function buildSequence(mysteryKey: MysteryKey): Step[] {
  const mysterySet = mysterySets[mysteryKey];
  const steps: Step[] = [];
  const push = (s: Omit<Step, 'index'>) => steps.push({ ...s, index: steps.length });

  // Crucifix: Sign of the Cross, then the Creed
  push({
    beadIndex: 0,
    kind: 'sign',
    prayer: prayers.signOfTheCross,
    heading: heading('Dấu Thánh Giá', 'Sign of the Cross'),
    slug: 'sign-of-the-cross',
  });
  push({
    beadIndex: 0,
    kind: 'creed',
    prayer: prayers.apostlesCreed,
    heading: heading('Kinh Tin Kính', "Apostles' Creed"),
    slug: 'apostles-creed',
  });

  // Tail: 1 large (Our Father) + 3 small (Hail Mary x3)
  push({
    beadIndex: 1,
    kind: 'ourFather',
    prayer: prayers.ourFather,
    heading: heading('Kinh Lạy Cha', 'Our Father'),
    slug: 'our-father',
  });
  for (let n = 1; n <= 3; n++) {
    push({
      beadIndex: 1 + n,
      kind: 'hailMary',
      prayer: prayers.hailMary,
      heading: heading(`Kính Mừng ${n}/3`, `Hail Mary ${n} of 3`),
      slug: `hail-mary-${n}`,
    });
  }

  // Centerpiece: Glory Be
  push({
    beadIndex: 5,
    kind: 'gloryBe',
    prayer: prayers.gloryBe,
    heading: heading('Kinh Sáng Danh', 'Glory Be'),
    slug: 'glory-be',
  });

  // 5 decades
  let beadCursor = 6;
  for (let d = 1; d <= 5; d++) {
    const mystery = mysterySet.list[d - 1];
    const base = mystery.imageKey;
    const decadeLargeBead = beadCursor;

    push({
      beadIndex: decadeLargeBead,
      kind: 'decadeIntro',
      prayer: prayers.ourFather,
      heading: heading(`Ngắm thứ ${d}`, `Decade ${d}`),
      slug: `${base}-our-father`,
      mystery,
      decadeNumber: d,
    });
    beadCursor += 1;

    for (let b = 1; b <= 10; b++) {
      push({
        beadIndex: beadCursor,
        kind: 'hailMary',
        prayer: prayers.hailMary,
        heading: heading(`Kính Mừng ${b}/10`, `Hail Mary ${b} of 10`),
        slug: `${base}-hail-mary-${b}`,
        decadeNumber: d,
        beadInDecade: b,
      });
      beadCursor += 1;
    }

    const lastSmallBead = beadCursor - 1;
    push({
      beadIndex: lastSmallBead,
      kind: 'gloryBe',
      prayer: prayers.gloryBe,
      heading: heading('Kinh Sáng Danh', 'Glory Be'),
      slug: `${base}-glory-be`,
      decadeNumber: d,
    });
    push({
      beadIndex: lastSmallBead,
      kind: 'fatima',
      prayer: prayers.fatimaPrayer,
      heading: heading('Kinh Fatima', 'Fatima Prayer'),
      slug: `${base}-fatima`,
      decadeNumber: d,
    });
  }

  // Closing, back at the crucifix
  push({
    beadIndex: 0,
    kind: 'closing',
    prayer: prayers.hailHolyQueen,
    heading: heading('Lạy Nữ Vương', 'Hail, Holy Queen'),
    slug: 'hail-holy-queen',
  });

  return steps;
}
