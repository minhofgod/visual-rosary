import { useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';

const SWIPE_THRESHOLD = 50; // px

export function useSwipeNav(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const resolve = (dx: number, dy: number) => {
    // Ignore mostly-vertical gestures so scrolling long prayers still works.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    resolve(dx, dy);
  };

  // Mouse-drag equivalent, for desktop/trackpad users without a touchscreen.
  const onMouseDown = (e: MouseEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    resolve(dx, dy);
  };

  // Keyboard fallback for accessibility, since the Next/Back buttons are gone.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onSwipeRight();
      else if (e.key === 'ArrowRight') onSwipeLeft();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
}
