import { useState } from 'react';
import type { WallItem } from '../lib/prayerWall';
import type { DisplayLang } from '../state/useDisplayLang';

interface Props {
  item: WallItem;
  displayLang: DisplayLang;
  onPray: () => void;
  onReport: () => void;
  onBlock: () => void;
  onDelete?: () => void;
}

export function PrayerRequestCard({ item, displayLang, onPray, onReport, onBlock, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);
  const count = item.prayed_count;

  return (
    <li className="pw-card">
      <p className="pw-body">{item.body}</p>

      <div className="pw-footer">
        {item.prayed_by_me ? (
          <span className="pw-prayed">🙏 {t('Bạn đã cầu nguyện', 'You prayed')}</span>
        ) : (
          <button type="button" className="pw-pray-btn" onClick={onPray}>
            🙏 {t('Cầu nguyện cho', 'Pray for this')}
          </button>
        )}

        <span className="pw-count">
          {count > 0 ? t(`${count} người đang cầu nguyện`, `${count} praying`) : ''}
        </span>

        <div className="pw-menu">
          <button
            type="button"
            className="pw-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t('Tùy chọn', 'Options')}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="pw-menu-list" onMouseLeave={() => setMenuOpen(false)}>
              {onDelete ? (
                <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }}>
                  {t('Xóa', 'Delete')}
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => { setMenuOpen(false); onReport(); }}>
                    {t('Báo cáo', 'Report')}
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); onBlock(); }}>
                    {t('Chặn người đăng', 'Block poster')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
