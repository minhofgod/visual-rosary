import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LangToggle } from './LangToggle';
import type { Settings, BeadPosition } from '../state/useSettings';
import type { DisplayLang } from '../state/useDisplayLang';

interface Props {
  onClose: () => void;
  displayLang: DisplayLang;
  setDisplayLang: (lang: DisplayLang) => void;
  settings?: Settings;
  onChange?: (patch: Partial<Settings>) => void;
  /** Show the "Return Home" button. */
  showReturnHome?: boolean;
  /** Show the font-size control (needs settings + onChange). */
  showFontSize?: boolean;
  /** Show the reading-only bead-position + display toggles (needs settings + onChange). */
  showReadingLayout?: boolean;
  /** Show a "Sign out" button (passed from AppHeader when the user is signed in). */
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

const t = (lang: DisplayLang, vi: string, en: string) => (lang === 'en' ? en : lang === 'both' ? `${vi} / ${en}` : vi);

const FONT_SIZES = [
  { scale: 0.85, vi: 'Nhỏ', en: 'Small' },
  { scale: 1, vi: 'Vừa', en: 'Normal' },
  { scale: 1.15, vi: 'Lớn', en: 'Large' },
];

// The settings menu (portaled to <body> so it's never trapped in a header's
// stacking context). Each section is opt-in so different pages show only the
// options that apply to them; Language is always present.
export function SettingsPanel({
  onClose,
  displayLang,
  setDisplayLang,
  settings,
  onChange,
  showReturnHome,
  showFontSize,
  showReadingLayout,
  isSignedIn,
  onSignOut,
}: Props) {
  const navigate = useNavigate();

  return createPortal(
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

        {showFontSize && settings && onChange && (
          <div className="settings-group">
            <h3>{t(displayLang, 'Cỡ chữ', 'Font size')}</h3>
            <div className="font-size-toggle" role="group" aria-label={t(displayLang, 'Cỡ chữ', 'Font size')}>
              {FONT_SIZES.map((opt) => (
                <button
                  key={opt.scale}
                  type="button"
                  className={settings.fontScale === opt.scale ? 'is-active' : ''}
                  onClick={() => onChange({ fontScale: opt.scale })}
                >
                  <span className="font-size-a">A</span>
                  <span className="font-size-label">{t(displayLang, opt.vi, opt.en)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showReadingLayout && settings && onChange && (
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
                      'Additional information at the bottom of Hail Mary and Glory Be sections.',
                    )}
                  </div>
                </div>
              </label>
            </div>
          </>
        )}

        {showReturnHome && (
          <button type="button" className="return-home-button" onClick={() => navigate('/')}>
            {t(displayLang, 'Về Trang Chủ', 'Return Home')}
          </button>
        )}

        {isSignedIn && onSignOut && (
          <button type="button" className="settings-signout" onClick={onSignOut}>
            {t(displayLang, 'Đăng xuất', 'Sign out')}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
