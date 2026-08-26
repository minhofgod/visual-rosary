import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsPanel } from './SettingsPanel';
import { useAuth } from '../state/useAuth';
import type { DisplayLang } from '../state/useDisplayLang';
import type { Settings } from '../state/useSettings';

interface Props {
  /** Left slot — the wordmark (landing) or a back/restart button. */
  left?: ReactNode;
  /** Optional centered slot (e.g. the mystery name while praying). */
  center?: ReactNode;
  displayLang: DisplayLang;
  setDisplayLang: (lang: DisplayLang) => void;
  /** Hide the profile button (e.g. on the profile page itself). */
  showProfile?: boolean;
  /** Device settings (font size, and — with showReadingLayout — bead/display options). */
  settings?: Settings;
  onSettingsChange?: (patch: Partial<Settings>) => void;
  /** Menu sections to show (Language + sign-out are automatic). */
  showReturnHome?: boolean;
  showFontSize?: boolean;
  showReadingLayout?: boolean;
}

// Shared header used on every page: a left slot, an optional centered slot, and a
// consistent [profile] + [menu] pair on the right. The language control now lives
// inside the menu (SettingsPanel) rather than as a standalone toggle.
export function AppHeader({
  left,
  center,
  displayLang,
  setDisplayLang,
  showProfile = true,
  settings,
  onSettingsChange,
  showReturnHome,
  showFontSize,
  showReadingLayout,
}: Props) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const meta = auth.user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
  const avatarUrl = meta?.avatar_url || meta?.picture;

  return (
    <header className="reading-header">
      {left}
      {center}
      <div className="reading-header-right">
        {showProfile && (
          <button
            type="button"
            className="landing-profile-btn"
            onClick={() => navigate('/ho-so')}
            aria-label={displayLang === 'en' ? 'Profile' : 'Hồ sơ'}
          >
            {avatarUrl ? (
              <img className="landing-profile-avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
              </svg>
            )}
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={() => setMenuOpen(true)}
          aria-label={displayLang === 'en' ? 'Menu' : 'Cài đặt'}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <SettingsPanel
          displayLang={displayLang}
          setDisplayLang={setDisplayLang}
          settings={settings}
          onChange={onSettingsChange}
          showReturnHome={showReturnHome}
          showFontSize={showFontSize}
          showReadingLayout={showReadingLayout}
          isSignedIn={auth.isSignedIn}
          onSignOut={auth.enabled ? () => auth.signOut() : undefined}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
