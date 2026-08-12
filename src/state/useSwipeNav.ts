import { useEffect, useRef, type MouseEvent, type TouchEvent, type WheelEvent } from 'react';

const SWIPE_THRESHOLD = 50; // px, total drag distance for touch/mouse
const WHEEL_THRESHOLD = 12; // px, a single wheel event's delta — a different scale than drag distance
const COOLDOWN_MS = 450; // roughly matches the entrance animation, so input can't skip steps mid-transition

function atBottom(el: HTMLElement) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
}

function atTop(el: HTMLElement) {
  return el.scrollTop <= 2;
}

/**
 * Vertical swipe/drag/wheel navigation, matching visualrosary.org (swipe/scroll up =
 * next, down = back) rather than left/right. Since the same container also scrolls
 * long prayers (e.g. the Creed), a swipe only advances once the text is already
 * scrolled to the bottom, and only goes back once it's scrolled to the top — short
 * prayers that don't overflow navigate immediately either way.
 */
export function useSwipeNav(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastFired = useRef(0);

  const fire = (dy: number, el: HTMLElement) => {
    const now = Date.now();
    if (now - lastFired.current < COOLDOWN_MS) return;

    if (dy < 0) {
      if (atBottom(el)) {
        lastFired.current = now;
        onNext();
      }
    } else {
      if (atTop(el)) {
        lastFired.current = now;
        onPrev();
      }
    }
  };

  const resolveDrag = (dx: number, dy: number, el: HTMLElement) => {
    if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx)) return;
    fire(dy, el);
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
    resolveDrag(dx, dy, e.currentTarget);
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
    resolveDrag(dx, dy, e.currentTarget);
  };

  // Mouse wheel / trackpad scroll, for desktop users who won't think to click-drag.
  // A single gesture fires many wheel events in a burst; the shared cooldown in
  // fire() collapses that burst into one step instead of racing through several.
  const onWheel = (e: WheelEvent<HTMLElement>) => {
    if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
    // wheel deltaY > 0 means "scrolled down/forward" (next), the opposite sign
    // convention from touch/mouse dy, where a negative (upward) drag means next.
    fire(-e.deltaY, e.currentTarget);
  };

  // Keyboard fallback for accessibility, since the Next/Back buttons are gone.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastFired.current < COOLDOWN_MS) return;
      if (e.key === 'ArrowUp') {
        lastFired.current = now;
        onPrev();
      } else if (e.key === 'ArrowDown') {
        lastFired.current = now;
        onNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onNext, onPrev]);

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp, onWheel };
}
