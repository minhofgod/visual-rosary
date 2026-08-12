import { useEffect, useRef, useState } from 'react';

interface Props {
  image?: string; // background-image url, or undefined for the gradient-only fallback
  gradientClass: string;
}

interface Layer {
  key: number;
  image?: string;
}

/**
 * Two stacked background layers cross-fade whenever `image` changes, instead of
 * the image cutting instantly. Each layer also gets a slow, continuous "Ken Burns"
 * zoom (matching visualrosary.org) so the screen never feels static.
 */
export function MysteryBackground({ image, gradientClass }: Props) {
  const [layers, setLayers] = useState<[Layer, Layer]>([{ key: 0, image }, { key: 1, image: undefined }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const nextKey = useRef(2);
  const prevImage = useRef(image);

  useEffect(() => {
    if (image === prevImage.current) return;
    prevImage.current = image;
    const inactiveIndex = activeIndex === 0 ? 1 : 0;
    setLayers((prev) => {
      const next: [Layer, Layer] = [...prev] as [Layer, Layer];
      next[inactiveIndex] = { key: nextKey.current++, image };
      return next;
    });
    setActiveIndex(inactiveIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  return (
    <>
      {layers.map((layer, i) => (
        <div
          key={layer.key}
          className={`bg-layer ${layer.image ? '' : gradientClass} ${i === activeIndex ? 'is-active' : ''}`}
          style={layer.image ? { backgroundImage: `url(${layer.image})` } : undefined}
        />
      ))}
    </>
  );
}
