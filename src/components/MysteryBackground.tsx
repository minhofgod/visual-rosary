import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  image?: string; // background-image url, or undefined for the gradient-only fallback
  gradientClass: string;
  /** 1 = new image rises up from the bottom (old slides up and away); -1 = reversed. */
  direction?: 1 | -1;
}

const slideVariants = {
  enter: (direction: 1 | -1) => ({ y: direction > 0 ? '100%' : '-100%' }),
  center: { y: 0 },
  exit: (direction: 1 | -1) => ({ y: direction > 0 ? '-100%' : '100%' }),
};

/**
 * The background photo slides up/away and the new one rises into frame, matching
 * the section-transition on visualrosary.org, with a slow "Ken Burns" zoom-out
 * (112% -> 100%) on the photo once it's in place. The slide (outer, framer-motion,
 * animates `transform: translateY`) and the zoom (inner, plain CSS `animation`,
 * animates `transform: scale`) are on separate nested elements on purpose — both
 * animate `transform`, and stacking them on one element would have one clobber
 * the other.
 */
export function MysteryBackground({ image, gradientClass, direction = 1 }: Props) {
  return (
    <div className="bg-viewport">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={image ?? 'gradient'}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.3, 0, 0.3, 1] }}
          className="bg-slide"
        >
          <div
            className={`bg-photo ${image ? '' : gradientClass}`}
            style={image ? { backgroundImage: `url(${image})` } : undefined}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
