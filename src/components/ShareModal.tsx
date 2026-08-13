import { useState } from 'react';
import type { DisplayLang } from '../state/useDisplayLang';

const t = (lang: DisplayLang, vi: string, en: string) => (lang === 'en' ? en : lang === 'both' ? `${vi} / ${en}` : vi);

const SITE_URL = 'https://dockinhmancoi.com';
const POSTER_SRC = '/images/poster/rosary-poster.jpg';

export function ShareModal({ displayLang, onClose }: { displayLang: DisplayLang; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — nothing more we can do here
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t(displayLang, 'Chia Sẻ', 'Share')}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="share-link-row">
          <span className="share-link-text">dockinhmancoi.com</span>
          <button type="button" className="share-copy-btn" onClick={handleCopy}>
            {copied ? t(displayLang, 'Đã sao chép', 'Copied') : t(displayLang, 'Sao chép', 'Copy')}
          </button>
        </div>

        <div className="share-qr-block">
          <h3 className="share-qr-heading">{t(displayLang, 'Mã QR Đọc Kinh Mân Côi', 'Đọc Kinh Mân Côi QR Code')}</h3>
          <div className="share-qr-caption">
            <p>
              {displayLang === 'en'
                ? 'Print and post this QR code so your parish can pray along.'
                : 'In và dán mã QR này để giáo xứ dễ dàng cùng lần hạt.'}
            </p>
            {displayLang === 'both' && (
              <p className="secondary">Print and post this QR code so your parish can pray along.</p>
            )}
          </div>
          <img src={POSTER_SRC} alt="Đọc Kinh Mân Côi QR poster" className="share-qr-image" />
          <a href={POSTER_SRC} download="doc-kinh-man-coi-qr.jpg" className="share-download-btn">
            {t(displayLang, 'Tải Xuống', 'Download')}
          </a>
        </div>
      </div>
    </div>
  );
}
