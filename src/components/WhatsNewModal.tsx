import { createPortal } from 'react-dom';
import { UPDATES } from '../data/updates';
import type { DisplayLang } from '../state/useDisplayLang';

/** "Có gì mới / What's new" — a simple list of recent updates, opened from Settings. */
export function WhatsNewModal({ displayLang, onClose }: { displayLang: DisplayLang; onClose: () => void }) {
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : displayLang === 'both' ? `${vi} / ${en}` : vi);

  return createPortal(
    <div className="modal-backdrop modal-elevated" onClick={onClose}>
      <div className="settings-panel whatsnew" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✨ {t('Có gì mới', "What's new")}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {UPDATES.map((u) => (
          <div key={u.id} className="whatsnew-update">
            <div className="whatsnew-date">{u.date}</div>
            <h3 className="whatsnew-title">{t(u.title.vi, u.title.en)}</h3>
            <ul className="whatsnew-list">
              {u.items.map((it, i) => (
                <li key={i}>{t(it.vi, it.en)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
