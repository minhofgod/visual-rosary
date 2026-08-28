import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOODS, WALLPAPERS, type Wallpaper } from '../data/wallpapers';
import { useWallpaperCollection } from '../state/useWallpaperCollection';
import { useBackupFailed } from '../state/useBackupFailed';
import { earnedWallpapers, TOTAL_WALLPAPERS } from '../lib/wallpaperCollection';
import { WallpaperReward } from './WallpaperReward';
import { ImageZoomViewer } from './ImageZoomViewer';
import { SignInModal } from './SignInModal';
import { useAuth } from '../state/useAuth';
import { consumeWallpaperSyncNote } from '../lib/syncNotice';
import type { DisplayLang } from '../state/useDisplayLang';

function download(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Profile section: the user's collected wallpapers, re-downloadable + set-as-avatar. */
export function WallpaperGallery({ displayLang }: { displayLang: DisplayLang }) {
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);
  const auth = useAuth();
  const { earned, avatar, pending, setAvatar } = useWallpaperCollection();
  const wallpapers = earnedWallpapers(earned).slice().reverse(); // newest first
  const hasCollection = earned.length > 0 || pending > 0;
  const [viewing, setViewing] = useState<Wallpaper | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  // Tile size — 3 options (large / medium / small = 2 / 3 / 4 columns), remembered per device.
  const [gridSize, setGridSize] = useState<'lg' | 'md' | 'sm'>(() => {
    try {
      const v = localStorage.getItem('rosary.wpGrid');
      if (v === 'lg' || v === 'md' || v === 'sm') return v;
    } catch { /* storage disabled */ }
    return 'md';
  });
  const changeSize = (s: 'lg' | 'md' | 'sm') => {
    setGridSize(s);
    try { localStorage.setItem('rosary.wpGrid', s); } catch { /* storage disabled */ }
  };

  // The "✓ collection synced" confirmation shows ONCE, and only after a real local→account
  // merge (never for a fresh account with nothing to merge). The merge commits a moment after
  // sign-in, so this re-checks when `earned` updates.
  const backupFailed = useBackupFailed();
  const [showWpSyncNote, setShowWpSyncNote] = useState(false);
  useEffect(() => {
    if (auth.isSignedIn && consumeWallpaperSyncNote()) setShowWpSyncNote(true);
  }, [auth.isSignedIn, earned]);

  // Setting an avatar is gated to signed-in users; signed-out users get a sign-in nudge.
  const setAsAvatar = (id: string) => {
    if (!auth.isSignedIn) {
      setSignInOpen(true);
      return;
    }
    setAvatar(id);
    setNote(t('Đã đặt làm ảnh đại diện.', 'Set as your avatar.'));
  };

  const pct = Math.round((earned.length / TOTAL_WALLPAPERS) * 100);

  // Collection grouped by mood — a "collect them all" scoreboard: each mood shows how many of
  // its cards you've collected (X / N + a bar). Only earned art is shown; the count conveys the
  // rest (no locked slots — Option 1, the gentle version).
  const earnedList = earnedWallpapers(earned);
  const moodGroups = MOODS.map((m) => ({
    slug: m.slug,
    label: t(m.vi, m.en),
    emoji: m.emoji,
    total: WALLPAPERS.filter((w) => w.mood === m.slug).length,
    tiles: earnedList.filter((w) => w.mood === m.slug).reverse(),
  }))
    .filter((g) => g.total > 0)
    // Moods you've started first (happy→sad within each block); un-started (0/N) sink to the bottom.
    .sort((a, b) => (b.tiles.length > 0 ? 1 : 0) - (a.tiles.length > 0 ? 1 : 0));

  const renderTile = (w: Wallpaper) => (
    <button key={w.id} type="button" className="pf-wp-tile" onClick={() => { setViewing(w); setNote(null); }}>
      <img src={w.card} alt={w.ref} loading="lazy" />
      {avatar === w.id && <span className="pf-wp-badge">{t('Ảnh đại diện', 'Avatar')}</span>}
      <span className="pf-wp-ref">{w.ref}</span>
    </button>
  );

  return (
    <section className="pf-wp">
      <h2 className="pf-heatmap-title">{t('Ảnh nền của bạn', 'Your wallpapers')}</h2>

      {pending > 0 && (
        <button type="button" className="pf-wp-gift" onClick={() => setRedeemOpen(true)}>
          <span className="pf-wp-gift-icon" aria-hidden="true">🎁</span>
          <span className="pf-wp-gift-text">
            <strong>
              {pending === 1
                ? t('Bạn có 1 món quà chưa mở', 'You have 1 gift to open')
                : t(`Bạn có ${pending} món quà chưa mở`, `You have ${pending} gifts to open`)}
            </strong>
            <span>{t('Nhấn để nhận ảnh nền Lời Chúa của bạn', 'Tap to receive your Scripture wallpaper')}</span>
          </span>
          <span className="pf-wp-gift-open">{t('Mở', 'Open')}</span>
        </button>
      )}

      {wallpapers.length === 0 ? (
        <p className="pf-empty">
          {t(
            'Chưa có ảnh nào. Lần một chuỗi Mân Côi để nhận ảnh nền Lời Chúa đầu tiên của bạn.',
            'None yet. Pray a rosary to receive your first Scripture wallpaper.',
          )}
        </p>
      ) : (
        <>
          <div className="pf-wp-prog">
            <span>{t('Đã sưu tầm', 'Collected')}</span>
            <span>
              {earned.length} / {TOTAL_WALLPAPERS} 🌹
            </span>
          </div>
          <div className="pf-wp-bar">
            <i style={{ width: `${pct}%` }} />
          </div>

          <div className="pf-wp-sizes" role="group" aria-label={t('Cỡ ảnh', 'Grid size')}>
            {([['lg', 2, t('Ảnh lớn', 'Large')], ['md', 3, t('Vừa', 'Medium')], ['sm', 4, t('Nhỏ', 'Small')]] as const).map(
              ([sz, n, label]) => (
                <button
                  key={sz}
                  type="button"
                  className={`pf-wp-size${gridSize === sz ? ' is-active' : ''}`}
                  aria-label={label}
                  aria-pressed={gridSize === sz}
                  onClick={() => changeSize(sz)}
                >
                  <span className="gi" style={{ gridTemplateColumns: `repeat(${n},1fr)`, gridTemplateRows: `repeat(${n},1fr)` }}>
                    {Array.from({ length: n * n }).map((_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                </button>
              ),
            )}
          </div>

          <div className="pf-wp-moods">
            {moodGroups.map((g) => (
              <div key={g.slug} className="pf-wp-mood">
                <div className="pf-wp-mood-head">
                  <span className="pf-wp-mood-name">{g.emoji} {g.label}</span>
                  <span className="pf-wp-mood-count">{g.tiles.length} / {g.total}</span>
                </div>
                <div className="pf-wp-mbar">
                  <i style={{ width: `${Math.round((g.tiles.length / g.total) * 100)}%` }} />
                </div>
                {g.tiles.length > 0 && <div className={`pf-wp-grid g-${gridSize}`}>{g.tiles.map(renderTile)}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {hasCollection &&
        (auth.isSignedIn ? (
          // A failed backup outranks the "synced ✓" note — never tell someone they're safe when
          // the last attempt to save their collection to the account did not go through.
          backupFailed ? (
            <p className="pf-sync-note pf-wp-note pf-sync-warn">
              {t(
                '⚠ Chưa lưu được bộ sưu tập lên tài khoản — hiện chỉ có trên máy này. Thử tải lại trang; nếu vẫn vậy, hãy tải ảnh về máy để giữ chắc.',
                '⚠ We could not save your collection to your account — right now it exists only on this device. Try reloading; if it keeps failing, download your wallpapers to keep them safely.',
              )}
            </p>
          ) : (
            showWpSyncNote && (
              <p className="pf-sync-note pf-synced pf-wp-note">
                {t(
                  '✓ Bộ sưu tập đã đồng bộ với tài khoản — theo bạn trên mọi thiết bị.',
                  '✓ Your collection is synced to your account — it follows you across devices.',
                )}
              </p>
            )
          )
        ) : (
          <p className="pf-sync-note pf-wp-note">
            {t(
              'Bộ sưu tập hiện chỉ lưu trên thiết bị này và có thể mất nếu bạn xoá dữ liệu trình duyệt hoặc đổi máy. Hãy đăng nhập để giữ ảnh nền của bạn trên mọi thiết bị — bộ sưu tập hiện tại vẫn được giữ nguyên. (Ảnh đã lưu về máy thì không bị mất.)',
              'Your collection is saved only on this device right now and could be lost if you clear your browser or switch devices. Sign in to keep your wallpapers across devices — your current collection is kept. (Wallpapers you already saved to your phone are never lost.)',
            )}
          </p>
        ))}

      {viewing &&
        createPortal(
          <div className="wr-backdrop" onClick={() => setViewing(null)}>
            <div className="wr-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="wr-panel">
                <button
                  type="button"
                  className="wr-preview wr-zoomable"
                  onClick={() => setZoomSrc(viewing.card)}
                  aria-label={t('Phóng to ảnh', 'Zoom in')}
                >
                  <img src={viewing.card} alt={viewing.ref} />
                  <span className="wr-zoom-hint" aria-hidden="true">🔍</span>
                </button>
                <button
                  type="button"
                  className="wr-btn-primary"
                  onClick={() => {
                    download(viewing.card, `${viewing.id}.jpg`);
                    setNote(t('Đã lưu ảnh — đặt làm ảnh nền từ Ảnh của bạn.', 'Saved — set it as your wallpaper from your Photos.'));
                  }}
                >
                  ⬇ {t('Lưu ảnh nền', 'Save wallpaper')}
                </button>
                {avatar === viewing.id ? (
                  <button type="button" className="wr-btn-ghost" onClick={() => { setAvatar(null); setNote(t('Đã bỏ ảnh đại diện.', 'Avatar removed.')); }}>
                    ✓ {t('Đang dùng làm ảnh đại diện — bỏ', 'Current avatar — remove')}
                  </button>
                ) : (
                  <button type="button" className="wr-btn-ghost" onClick={() => setAsAvatar(viewing.id)}>
                    🙂 {t('Đặt làm ảnh đại diện', 'Use as avatar')}
                  </button>
                )}
                {note && <p className="wr-savenote">{note}</p>}
                <button type="button" className="wr-skip" onClick={() => setViewing(null)}>
                  {t('Đóng', 'Close')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {zoomSrc && (
        <ImageZoomViewer src={zoomSrc} onClose={() => setZoomSrc(null)} closeLabel={t('Đóng', 'Close')} />
      )}

      {redeemOpen && (
        <WallpaperReward displayLang={displayLang} occasion="banked" onClose={() => setRedeemOpen(false)} />
      )}

      {signInOpen && (
        <SignInModal
          displayLang={displayLang}
          elevated
          lead={t(
            'Đăng nhập để đặt ảnh nền này làm ảnh đại diện — bộ sưu tập của bạn cũng sẽ được lưu trên mọi thiết bị.',
            'Sign in to set this wallpaper as your profile picture — your collection is saved across your devices too.',
          )}
          onClose={() => setSignInOpen(false)}
        />
      )}
    </section>
  );
}
