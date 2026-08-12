import type { BeadLayoutItem } from './sequence';

export interface BeadPoint {
  beadIndex: number;
  kind: BeadLayoutItem['kind'];
  x: number;
  y: number;
  r: number;
}

export const VIEWBOX = { width: 300, height: 460 };

const CX = 150;
const CY_LOOP = 160;
const RADIUS = 128;
const GAP_DEG = 30; // opening at the bottom of the loop where the tail attaches
const TAIL_STEP = 27;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** theta: 0 = top of circle, increases clockwise */
function pointOnCircle(theta: number) {
  const rad = toRad(theta);
  return {
    x: CX + RADIUS * Math.sin(rad),
    y: CY_LOOP - RADIUS * Math.cos(rad),
  };
}

export function computeBeadPositions(layout: BeadLayoutItem[]): BeadPoint[] {
  // Bead layout order is: [cross, tailLarge, tailSmall x3, centerpiece, ...55 loop beads]
  const cross = layout[0];
  const tailLarge = layout[1];
  const tailSmalls = layout.slice(2, 5);
  const centerpiece = layout[5];
  const decadeBeads = layout.slice(6); // the 55 beads that form the loop

  const points: BeadPoint[] = [];

  // Loop: start just past the bottom gap, sweep clockwise almost all the way around
  const span = 360 - GAP_DEG;
  const startTheta = 180 + GAP_DEG / 2;
  decadeBeads.forEach((bead, i) => {
    const theta = startTheta + (span * i) / (decadeBeads.length - 1);
    const { x, y } = pointOnCircle(theta);
    points.push({ beadIndex: bead.beadIndex, kind: bead.kind, x, y, r: bead.kind === 'large' ? 7 : 4 });
  });

  // Tail hangs straight down from the bottom of the loop
  const centerpieceY = CY_LOOP + RADIUS;
  points.push({ beadIndex: centerpiece.beadIndex, kind: 'centerpiece', x: CX, y: centerpieceY, r: 10 });
  points.push({ beadIndex: tailLarge.beadIndex, kind: 'large', x: CX, y: centerpieceY + TAIL_STEP, r: 7 });
  tailSmalls.forEach((bead, i) => {
    points.push({ beadIndex: bead.beadIndex, kind: 'small', x: CX, y: centerpieceY + TAIL_STEP * (2 + i), r: 4 });
  });
  points.push({
    beadIndex: cross.beadIndex,
    kind: 'cross',
    x: CX,
    y: centerpieceY + TAIL_STEP * (2 + tailSmalls.length) + 20,
    r: 10,
  });

  return points.sort((a, b) => a.beadIndex - b.beadIndex);
}
