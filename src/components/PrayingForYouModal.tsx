import { useState } from 'react';
import { Modal } from './Modal';
import { INTERCESSIONS } from '../data/intercessions';
import type { DisplayLang } from '../state/useDisplayLang';

// Opened when someone taps "Pray for this" on a request. Shows a short intercession
// (one of a rotating set), a refresh to cycle to another, and an Amen that records
// the prayer for the requester.
interface Props {
  displayLang: DisplayLang;
  onAmen: () => void;
  onClose: () => void;
}

export function PrayingForYouModal({ displayLang, onAmen, onClose }: Props) {
  const [i, setI] = useState(() => Math.floor(Math.random() * INTERCESSIONS.length));

  const refresh = () =>
    setI((cur) => {
      if (INTERCESSIONS.length < 2) return cur;
      let n = cur;
      while (n === cur) n = Math.floor(Math.random() * INTERCESSIONS.length);
      return n;
    });

  const p = INTERCESSIONS[i];
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  return (
    <Modal title={t('Lời nguyện cầu', 'A prayer to say')} onClose={onClose}>
      <div className="pray-card">
        {displayLang === 'both' ? (
          <>
            <p className="pray-text" lang="vi">
              {p.vi}
            </p>
            <p className="pray-text pray-text-secondary" lang="en">
              {p.en}
            </p>
          </>
        ) : (
          <p className="pray-text" lang={displayLang}>
            {p[displayLang]}
          </p>
        )}

        <div className="pray-actions">
          <button type="button" className="pray-refresh" onClick={refresh}>
            ↻ {t('Lời khác', 'Another')}
          </button>
          <button
            type="button"
            className="pray-amen"
            onClick={() => {
              onAmen();
              onClose();
            }}
          >
            Amen
          </button>
        </div>
      </div>
    </Modal>
  );
}
