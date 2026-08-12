import { useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';

const SWIPE_THRESHOLD = 50; // px

function atBottom(el: HTMLElement) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
}

function atTop(el: HTMLElement) {
  return el.scrollTop <= 2;
}

/**
 * Vertical swipe/drag navigation, matching visualrosary.org (swipe/scroll up = next,
 * down = back) rather than left/right. Since the same container also scrolls long
 * prayers (e.g. the Creed), a swipe only advances once the text is already scrolled
 * to the bottom, and only goes back once it's scrolled to the top — short prayers
 * that don't overflow navigate immediately either way.
 */
export function useSwipeNav(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const resolve = (dx: number, dy: number, el: HTMLElement) => {
    if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx)) return;
    if (dy < 0) {
      if (atBottom(el)) onNext();
    } else {
      if (atTop(el)) onPrev();
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    resolve(dx, dy, e.currentTarget);
  };

  // Mouse-drag equivalent, for desktop/trackpad users without a touchscreen.
  const onMouseDown = (e: MouseEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e: MouseEvent<HTMLElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    resolve(dx, dy, e.currentTarget);
  };

  // Keyboard fallback for accessibility, since the Next/Back buttons are gone.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') onPrev();
      else if (e.key === 'ArrowDown') onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onNext, onPrev]);

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
}
