import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

type Transform = { scale: number; x: number; y: number };
const RESET: Transform = { scale: 1, x: 0, y: 0 };

/**
 * Full-screen image viewer with pinch-to-zoom (mobile), drag-to-pan when zoomed,
 * double-tap / double-click to toggle zoom, and wheel-zoom on desktop. Rendered in a
 * portal above everything. `touch-action: none` on the image lets us own the gestures so
 * the browser doesn't fight us with its native page pinch. Tapping the dark backdrop (at
 * 1×) or the × closes.
 */
export function ImageZoomViewer({
  src,
  alt,
  onClose,
  closeLabel = 'Close',
  protect = false,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
  closeLabel?: string;
  /** Deter long-press / right-click "Save image" — for previewing un-earned art (not foolproof). */
  protect?: boolean;
}) {
  const [t, setT] = useState<Transform>(RESET);
  const gesture = useRef<
    | null
    | {
        mode: 'pinch' | 'pan';
        startDist: number;
        startScale: number;
        startX: number;
        startY: number;
        originX: number; // pointer/midpoint at gesture start
        originY: number;
      }
  >(null);
  const lastTap = useRef(0);

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(1, s));
  const dist = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      gesture.current = {
        mode: 'pinch',
        startDist: dist(a, b),
        startScale: t.scale,
        startX: t.x,
        startY: t.y,
        originX: (a.clientX + b.clientX) / 2,
        originY: (a.clientY + b.clientY) / 2,
      };
      return;
    }
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        // Double-tap → toggle between fit and zoomed.
        setT((p) => (p.scale > 1 ? RESET : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }));
        lastTap.current = 0;
        gesture.current = null;
        return;
      }
      lastTap.current = now;
      if (t.scale > 1) {
        gesture.current = {
          mode: 'pan',
          startDist: 0,
          startScale: t.scale,
          startX: t.x,
          startY: t.y,
          originX: e.touches[0].clientX,
          originY: e.touches[0].clientY,
        };
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (g.mode === 'pinch' && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const scale = clamp((g.startScale * dist(a, b)) / g.startDist);
      const mx = (a.clientX + b.clientX) / 2;
      const my = (a.clientY + b.clientY) / 2;
      setT({ scale, x: g.startX + (mx - g.originX), y: g.startY + (my - g.originY) });
    } else if (g.mode === 'pan' && e.touches.length === 1) {
      setT((p) => ({ ...p, x: g.startX + (e.touches[0].clientX - g.originX), y: g.startY + (e.touches[0].clientY - g.originY) }));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      gesture.current = null;
      setT((p) => (p.scale <= 1 ? RESET : p)); // snap back to centre once released at fit
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    setT((p) => {
      const scale = clamp(p.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
      return scale <= 1 ? RESET : { ...p, scale };
    });
  };

  const toggle = () => setT((p) => (p.scale > 1 ? RESET : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }));

  return createPortal(
    <div className="izoom" onClick={() => t.scale <= 1 && onClose()} onWheel={onWheel} role="dialog" aria-modal="true">
      <button
        type="button"
        className="izoom-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={closeLabel}
      >
        ×
      </button>
      <img
        className={`izoom-img${protect ? ' no-save' : ''}`}
        src={src}
        alt={alt}
        draggable={false}
        onContextMenu={protect ? (e) => e.preventDefault() : undefined}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={toggle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})` }}
      />
    </div>,
    document.body,
  );
}
