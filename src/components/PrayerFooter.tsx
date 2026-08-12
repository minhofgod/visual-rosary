import type { Mystery } from '../data/types';
import type { DisplayLang } from '../state/useDisplayLang';
import type { BeadVerse } from '../data/beadVerses';

interface Props {
  mystery: Mystery;
  verse?: BeadVerse;
  displayLang: DisplayLang;
}

/**
 * Fixed bar pinned to the bottom-left of the viewport, matching visualrosary.org's
 * own "Footer" setting: mystery name, fruit, and scripture citation, each with a
 * small icon. Shown on Hail Mary / Glory Be sections only, independent of scroll
 * position or how tall the verse text above it is.
 */
export function PrayerFooter({ mystery, verse, displayLang }: Props) {
  const pick = (b: { vi: string; en: string }) => (displayLang === 'en' ? b.en : b.vi);

  return (
    <footer className="prayer-footer">
      <span className="prayer-footer-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.8 6.398c-.44 0-.8.36-.8.8v2a.4.4 0 1 1-.8 0V7.284c0-.435.118-.862.342-1.235L7.486 2.81a.794.794 0 0 0-1.332-.868c-.005.006-.015.005-.019.012L3.203 6.352a2.39 2.39 0 0 0-.403 1.33v2.006l-2.253.751a.8.8 0 0 0-.547.759v2.4c0 .27.213.8.8.8a.81.81 0 0 0 .201-.026l4.48-1.165A2.934 2.934 0 0 0 7.6 10.398v-3.2c0-.44-.36-.8-.8-.8Zm8.653 4.043L13.2 9.69V7.684a2.39 2.39 0 0 0-.403-1.33L9.866 1.956c-.005-.006-.015-.006-.02-.012a.795.795 0 0 0-1.332.868l1.944 3.24c.224.373.342.8.342 1.234V9.2a.4.4 0 1 1-.8 0v-2c0-.44-.36-.8-.8-.8-.44 0-.8.36-.8.8v3.2c0 1.297.871 2.452 2.119 2.809l4.48 1.165a.81.81 0 0 0 .201.026c.587 0 .8-.53.8-.8v-2.4a.8.8 0 0 0-.547-.759Z" />
        </svg>
        <span>{pick(mystery.title)}</span>
      </span>
      <span className="prayer-footer-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M 9.524 8.381 C 9.524 9.219 8.838 9.905 8 9.905 C 7.162 9.905 6.477 9.219 6.477 8.381 C 6.477 7.543 7.162 6.857 8 6.857 C 8.838 6.857 9.524 7.543 9.524 8.381 Z M 4.191 6.857 C 3.353 6.857 2.667 7.543 2.667 8.381 C 2.667 9.219 3.353 9.905 4.191 9.905 C 5.029 9.905 5.715 9.219 5.715 8.381 C 5.715 7.543 5.029 6.857 4.191 6.857 Z M 11.81 6.857 C 10.972 6.857 10.286 7.543 10.286 8.381 C 10.286 9.219 10.972 9.905 11.81 9.905 C 12.648 9.905 13.334 9.219 13.334 8.381 C 13.334 7.543 12.648 6.857 11.81 6.857 Z M 9.905 3.81 C 9.067 3.81 8.381 4.495 8.381 5.333 C 8.381 6.171 9.067 6.857 9.905 6.857 C 10.743 6.857 11.429 6.171 11.429 5.333 C 11.429 4.495 10.743 3.81 9.905 3.81 Z M 6.096 3.81 C 5.257 3.81 4.572 4.495 4.572 5.333 C 4.572 6.171 5.257 6.857 6.096 6.857 C 6.934 6.857 7.619 6.171 7.619 5.333 C 7.619 4.495 6.934 3.81 6.096 3.81 Z M 9.905 9.905 C 9.067 9.905 8.381 10.59 8.381 11.429 C 8.381 12.267 9.067 12.952 9.905 12.952 C 10.743 12.952 11.429 12.267 11.429 11.429 C 11.429 10.59 10.743 9.905 9.905 9.905 Z M 6.096 9.905 C 5.257 9.905 4.572 10.59 4.572 11.429 C 4.572 12.267 5.257 12.952 6.096 12.952 C 6.934 12.952 7.619 12.267 7.619 11.429 C 7.619 10.59 6.934 9.905 6.096 9.905 Z M 8 12.952 C 7.162 12.952 6.477 13.638 6.477 14.476 C 6.477 15.314 7.162 16 8 16 C 8.838 16 9.524 15.314 9.524 14.476 C 9.524 13.638 8.838 12.952 8 12.952 Z M 9.829 0.914 L 9.219 0 C 7.543 0.762 7.391 3.505 7.391 3.81 L 8.534 3.81 C 8.61 3.2 8.838 1.295 9.829 0.914 Z" />
        </svg>
        <span>{pick(mystery.fruitShort)}</span>
      </span>
      {verse && (
        <span className="prayer-footer-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M 3.333 0 C 2.236 0 1.333 0.904 1.333 2 L 1.333 14 C 1.333 15.096 2.236 16 3.333 16 L 14.666 16 L 14.666 0 L 3.333 0 Z M 3.333 1.333 L 13.333 1.333 L 13.333 12 L 3.333 12 C 3.105 12.003 2.879 12.045 2.666 12.125 L 2.666 2 C 2.666 1.623 2.956 1.333 3.333 1.333 Z M 7.333 2.667 L 7.333 4.667 L 5.333 4.667 L 5.333 6 L 7.333 6 L 7.333 10.667 L 8.666 10.667 L 8.666 6 L 10.666 6 L 10.666 4.667 L 8.666 4.667 L 8.666 2.667 L 7.333 2.667 Z M 3.333 13.333 L 13.333 13.333 L 13.333 14.667 L 3.333 14.667 C 2.956 14.667 2.666 14.377 2.666 14 C 2.666 13.623 2.956 13.333 3.333 13.333 Z" />
          </svg>
          <span>{pick(verse.ref)}</span>
        </span>
      )}
    </footer>
  );
}
