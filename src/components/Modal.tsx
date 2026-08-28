import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Extra class on the backdrop — e.g. 'modal-elevated' to stack above a full-screen overlay. */
  className?: string;
}

// Portaled to <body> so its position:fixed backdrop always covers the viewport, even when
// rendered from deep inside a transformed/filtered layout (and so it can stack above the
// full-screen wallpaper overlays with the 'modal-elevated' class).
export function Modal({ title, onClose, children, className }: Props) {
  return createPortal(
    <div className={`modal-backdrop${className ? ` ${className}` : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
