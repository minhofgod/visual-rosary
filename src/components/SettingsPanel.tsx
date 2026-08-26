import { useNavigate } from 'react-router-dom';
import { LangToggle } from './LangToggle';
import type { Settings, BeadPosition } from '../state/useSettings';
import type { DisplayLang } from '../state/useDisplayLang';

interface Props {
  onClose: () => void;
  displayLang: DisplayLang;
  setDisplayLang: (lang: DisplayLang) => void;
  // Reading-only display options. Omitted on pages (landing, profile) where they
  // don't apply — the panel then shows just the language control.
  settings?: Settings;
  onChange?: (patch: Partial<Settings>) => void;
}

const t = (lang: DisplayLang, vi: string, en: string) => (lang === 'en' ? en : lang === 'both' ? `${vi} / ${en}` : vi);

export function SettingsPanel({ onClose, displayLang, setDisplayLang, settings, onChange }: Props) {
  // Language lives here now; reading display options appear only when passed.
  const navigate = useNavigate();
  const showReadingOptions = !!settings && !!onChange;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t(displayLang, 'Cài Đặt', 'Settings')}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="settings-group">
          <h3>{t(displayLang, 'Ngôn ngữ', 'Language')}</h3>
          <LangToggle value={displayLang} onChange={setDisplayLang} />
        </div>

        {showReadingOptions && (
          <button type="button" className="return-home-button" onClick={() => navigate('/')}>
            {t(displayLang, 'Về Trang Chủ', 'Return Home')}
          </button>
        )}

        {settings && onChange && (
          <>
            <div className="settings-group">
          <h3>{t(displayLang, 'Vị trí chuỗi hạt', 'Beads')}</h3>
          <div className="settings-radios">
            {(['left', 'right', 'hidden'] as BeadPosition[]).map((pos) => (
              <label key={pos} className="settings-radio">
                <input
                  type="radio"
                  name="beadPosition"
                  checked={settings.beadPosition === pos}
                  onChange={() => onChange({ beadPosition: pos })}
                />
                {pos === 'left' && t(displayLang, 'Trái', 'Left')}
                {pos === 'right' && t(displayLang, 'Phải', 'Right')}
                {pos === 'hidden' && t(displayLang, 'Ẩn', 'Hidden')}
              </label>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h3>{t(displayLang, 'Hiển thị', 'Display')}</h3>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.showFruits}
              onChange={(e) => onChange({ showFruits: e.target.checked })}
            />
            <div>
              <div className="settings-checkbox-title">{t(displayLang, 'Hoa trái', 'Fruits')}</div>
              <div className="settings-checkbox-desc">
                {t(displayLang, 'Hoa trái thiêng liêng của mỗi ngắm.', 'The intention of each mystery.')}
              </div>
            </div>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.showMeditations}
              onChange={(e) => onChange({ showMeditations: e.target.checked })}
            />
            <div>
              <div className="settings-checkbox-title">{t(displayLang, 'Suy niệm', 'Meditations')}</div>
              <div className="settings-checkbox-desc">
                {t(displayLang, 'Bài suy niệm ở phần Kinh Lạy Cha của mỗi ngắm.', 'The meditation in the Our Father sections.')}
              </div>
            </div>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.showScriptures}
              onChange={(e) => onChange({ showScriptures: e.target.checked })}
            />
            <div>
              <div className="settings-checkbox-title">{t(displayLang, 'Lời Kinh Thánh', 'Scriptures')}</div>
              <div className="settings-checkbox-desc">
                {t(displayLang, 'Câu Kinh Thánh ở mỗi Kinh Kính Mừng của một chục.', 'A scripture verse on each Hail Mary bead of a decade.')}
              </div>
            </div>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.showFooter}
              onChange={(e) => onChange({ showFooter: e.target.checked })}
            />
            <div>
              <div className="settings-checkbox-title">{t(displayLang, 'Chú thích cuối trang', 'Footer')}</div>
              <div className="settings-checkbox-desc">
                {t(
                  displayLang,
                  'Thông tin thêm ở cuối các phần Kinh Kính Mừng và Kinh Sáng Danh.',
                  'Additional information at the bottom of Hail Mary and Glory Be sections.'
                )}
              </div>
            </div>
          </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
