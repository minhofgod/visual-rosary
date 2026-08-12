import { useEffect, useState } from 'react';
import { mysteryImages, type MysteryImage } from '../data/mysteryImages';
import { beadImages, type BeadImage } from '../data/beadImages';

const POOL: (MysteryImage | BeadImage)[] = [...mysteryImages, ...beadImages];
const INTERVAL_MS = 5500;

function randomImage(exclude?: MysteryImage | BeadImage) {
  if (POOL.length === 0) return undefined;
  let pick: MysteryImage | BeadImage;
  do {
    pick = POOL[Math.floor(Math.random() * POOL.length)];
  } while (POOL.length > 1 && pick === exclude);
  return pick;
}

/** Cycles a random background image from the full art library every ~5.5s, matching visualrosary.org's landing-page slideshow. */
export function useSlideshow() {
  const [image, setImage] = useState(() => randomImage());

  useEffect(() => {
    const id = setInterval(() => setImage((prev) => randomImage(prev)), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return image;
}
