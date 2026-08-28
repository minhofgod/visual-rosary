import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ImageZoomViewer } from './ImageZoomViewer';
import { WALLPAPERS, type MoodSlug, type WallpaperStyle, type Wallpaper } from '../data/wallpapers';
import { useWallpaperCollection } from '../state/useWallpaperCollection';
import { unownedInMood, moodsWithNew } from '../lib/wallpaperCollection';
import type { DisplayLang } from '../state/useDisplayLang';

const STYLE_LABEL: Record<WallpaperStyle, { vi: string; en: string }> = {
  papercut: { vi: 'Nhẹ nhàng', en: 'Soft' },
  cinematic: { vi: 'Điện ảnh', en: 'Cinematic' },
  renaissance: { vi: 'Cổ điển', en: 'Classical' },
};
// Display order for the style chooser (data order is alphabetical; this reads nicer).
const STYLE_ORDER: WallpaperStyle[] = ['papercut', 'cinematic', 'renaissance'];

function download(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * The post-rosary gift, as a lock-forward flow so a person only ever previews ONE verse:
 *  1. Pick a feeling (reversible).
 *  2. Open the wrapped gift — this freezes ONE random un-owned verse from that mood and LOCKS
 *     the mood + verse (re-choosing would let them shop across verses).
 *  3. Pick that verse's STYLE — one preview per style it has. Reversible: since it's the same
 *     verse, they can switch styles (and zoom each) freely until they keep — no new verses shown.
 *  4. Browse that verse+style's VARIANTS (‹ 1/N › — arrows only when there's more than one of
 *     the same verse in the same style, e.g. the three Good Shepherd papercuts) and keep one.
 * The only hard lock is mood+verse (at open); keeping is the final commit. Everything unpicked
 * stays un-owned (a future gift) — variety to collect, never a duplicate, never a spread of verses.
 */
export function WallpaperReward({
  displayLang,
  onClose,
  occasion = 'finished',
}: {
  displayLang: DisplayLang;
  onClose: () => void;
  /** 'finished' = opened right after a rosary; 'banked' = redeeming a saved credit from the profile. */
  occasion?: 'finished' | 'banked';
}) {
  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);
  const navigate = useNavigate();
  const { earned, pending, claim, giftRef, setGiftRef } = useWallpaperCollection();

  // Resume an opened-but-unkept gift: if a verse is frozen in the store, reconstruct its un-owned
  // cards and start at the style chooser — never back at the mood picker (that would re-roll the
  // verse and reopen the preview-shopping loophole).
  const [mood, setMood] = useState<MoodSlug | null>(() => {
    if (!giftRef) return null;
    const c = WALLPAPERS.find((w) => w.ref === giftRef && !earned.includes(w.id));
    return c ? c.mood : null;
  });
  // ALL of the frozen verse's cards, owned ones included — the style chooser shows an already-owned
  // style as "Đã có" so it's clear why only some are pickable (a verse can gain a second style in a
  // later update). Only un-owned cards can actually be kept.
  const [giftCards, setGiftCards] = useState<Wallpaper[] | null>(() => {
    if (!giftRef) return null;
    const cards = WALLPAPERS.filter((w) => w.ref === giftRef);
    return cards.some((w) => !earned.includes(w.id)) ? cards : null;
  });
  const [pickedStyle, setPickedStyle] = useState<WallpaperStyle | null>(null); // locked once chosen
  const [variantIdx, setVariantIdx] = useState(0);
  const [kept, setKept] = useState<Wallpaper | null>(null); // the one they chose to keep
  const [zoomSrc, setZoomSrc] = useState<string | null>(null); // full-screen pinch/zoom preview

  const availableMoods = useMemo(() => moodsWithNew(earned), [earned]);
  // Out of stock = nothing new to claim. A held credit is never decremented here.
  const outOfStock = availableMoods.length === 0;

  function reset() {
    setMood(null);
    setGiftCards(null);
    setPickedStyle(null);
    setVariantIdx(0);
    setKept(null);
  }

  // Open the gift: freeze ONE random un-owned verse from the mood. From here the mood is locked —
  // re-choosing it would let them preview other verses. If the verse has only one un-owned style,
  // there's nothing to choose, so go straight to its variants.
  function openGift() {
    if (!mood || giftCards) return;
    const pool = unownedInMood(mood, earned);
    const refs = [...new Set(pool.map((w) => w.ref))];
    if (refs.length === 0) return;
    const ref = refs[Math.floor(Math.random() * refs.length)];
    setGiftCards(WALLPAPERS.filter((w) => w.ref === ref));
    setGiftRef(ref); // persist so "Để sau" → reopen resumes THIS verse, never a re-roll
  }

  // A verse with only ONE style has nothing to choose between — skip the chooser rather than show a
  // single tile. Runs on resume too, not just at open.
  useEffect(() => {
    if (!giftCards || pickedStyle) return;
    const styles = [...new Set(giftCards.map((w) => w.style))];
    if (styles.length === 1) setPickedStyle(styles[0]);
  }, [giftCards, pickedStyle]);

  function keep(w: Wallpaper) {
    claim(w.id);
    setKept(w);
  }

  const committed = giftCards !== null; // gift opened → mood locked, backdrop tap no longer closes

  const body = (() => {
    // Nothing new left anywhere — warm compliment + "more coming".
    if (outOfStock) {
      return (
        <div className="wr-panel wr-done-all">
          <div className="wr-rose">🌹</div>
          <p className="wr-msg">
            {t(
              'Bạn đã sưu tầm hết rồi — thật đáng quý! Hiện chưa có ảnh mới, nhưng sẽ sớm có thêm. Cảm ơn lòng trung thành của bạn.',
              "You've collected them all — how beautiful. No new one just yet, but more are coming soon. Thank you for your faithfulness.",
            )}
          </p>
          <button type="button" className="wr-btn-primary" onClick={onClose}>
            {t('Xong', 'Done')}
          </button>
        </div>
      );
    }

    // Step 1 — pick a feeling. Nothing is locked here; they can change it freely.
    if (!mood) {
      return (
        <div className="wr-panel">
          <div className="wr-eyebrow">
            {occasion === 'finished'
              ? `🌹 ${t('Hoàn tất chuỗi Mân Côi', 'Rosary complete')}`
              : `🎁 ${t('Ảnh nền Lời Chúa cho bạn', 'A Scripture wallpaper for you')}`}
            {pending > 1 && ` · ${t(`còn ${pending}`, `${pending} left`)}`}
          </div>
          <h2 className="wr-q">{t('Hôm nay bạn cần gì?', 'What do you need today?')}</h2>
          <p className="wr-sub">
            {t(
              'Chọn một tâm tình để nhận một tấm ảnh nền Lời Chúa làm quà.',
              'Pick a feeling to receive a Scripture wallpaper as your gift.',
            )}
          </p>
          <div className="wr-chips">
            {availableMoods.map((m) => (
              <button key={m.slug} type="button" className="wr-chip" onClick={() => setMood(m.slug)}>
                <span className="wr-chip-emoji">{m.emoji}</span>
                {t(m.vi, m.en)}
              </button>
            ))}
          </div>
          <button type="button" className="wr-skip" onClick={onClose}>
            {t('Để sau', 'Maybe later')}
          </button>
        </div>
      );
    }

    // Step 2 — the wrapped gift. This is the last reversible point: back to mood is allowed until
    // they open it (an accidental mood tap is never a trap). Opening locks the mood.
    if (!giftCards) {
      return (
        <div className="wr-panel">
          <div className="wr-eyebrow">🌹 {t('Một món quà cho bạn', 'A gift for you')}</div>
          <div className="wr-gift">
            <span className="wr-gift-cover" aria-hidden="true">🎁</span>
          </div>
          <p className="wr-gift-hint">
            {t('Một ảnh nền Lời Chúa đang chờ bạn mở.', 'A Scripture wallpaper is waiting to be opened.')}
          </p>
          <button type="button" className="wr-btn-primary" onClick={openGift}>
            {t('Mở ảnh', 'Open it')}
          </button>
          <button type="button" className="wr-skip" onClick={() => setMood(null)}>
            {t('← Chọn cảm giác khác', '← Choose another feeling')}
          </button>
        </div>
      );
    }

    // Step 3 — pick this verse's style. One preview per style the verse has; choosing locks it.
    // No going back to the mood (that would re-roll to other verses).
    if (!pickedStyle) {
      const reps = STYLE_ORDER.filter((s) => giftCards.some((w) => w.style === s)).map((s) => {
        const all = giftCards.filter((w) => w.style === s);
        const fresh = all.filter((w) => !earned.includes(w.id));
        // Preview an un-owned card when there is one; otherwise this style is already collected.
        return { style: s, card: fresh[0] ?? all[0], owned: fresh.length === 0 };
      });
      return (
        <div className="wr-panel wr-reveal">
          <p className="wr-style-q">{t('Chọn phong cách', 'Choose a style')}</p>
          <div className="wr-choices">
            {reps.map((r) => (
              <button
                key={r.style}
                type="button"
                className={r.owned ? 'wr-choice is-owned' : 'wr-choice'}
                disabled={r.owned}
                onClick={() => !r.owned && setPickedStyle(r.style)}
              >
                <img className="no-save" src={r.card.card} alt="" onContextMenu={(e) => e.preventDefault()} />
                <span className="wr-choice-style">
                  {t(STYLE_LABEL[r.style].vi, STYLE_LABEL[r.style].en)}
                  {r.owned && <span className="wr-choice-owned">{t('Đã có', 'Collected')}</span>}
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="wr-skip" onClick={onClose}>
            {t('Để sau', 'Maybe later')}
          </button>
        </div>
      );
    }

    // Step 4 — browse this verse + style's variants and keep one. Both mood and style are locked,
    // so the only thing to browse is the same verse in the same style (usually one image).
    if (!kept) {
      const variants = giftCards.filter((w) => w.style === pickedStyle && !earned.includes(w.id));
      // Only offer "change style" when the verse actually HAS another style; with one style the
      // chooser is skipped, so the button would bounce straight back here.
      const multiStyle = new Set(giftCards.map((v) => v.style)).size > 1;
      const w = variants[variantIdx] ?? variants[0];
      const many = variants.length > 1;
      return (
        <div className="wr-panel wr-vbrowse">
          <p className="wr-vstyle">{t(STYLE_LABEL[pickedStyle].vi, STYLE_LABEL[pickedStyle].en)}</p>
          <div className="wr-vstage">
            <button
              type="button"
              className="wr-preview wr-zoomable"
              onClick={() => setZoomSrc(w.card)}
              aria-label={t('Phóng to ảnh', 'Zoom in')}
            >
              <img className="no-save" src={w.card} alt={w.ref} onContextMenu={(e) => e.preventDefault()} />
              <span className="wr-zoom-hint" aria-hidden="true">🔍</span>
            </button>
            {many && (
              <>
                <button
                  type="button"
                  className="wr-varrow l"
                  onClick={() => setVariantIdx((i) => (i - 1 + variants.length) % variants.length)}
                  aria-label={t('Trước', 'Previous')}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="wr-varrow r"
                  onClick={() => setVariantIdx((i) => (i + 1) % variants.length)}
                  aria-label={t('Sau', 'Next')}
                >
                  ›
                </button>
              </>
            )}
          </div>
          {many && (
            <>
              <div className="wr-vdots">
                {variants.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`wr-vdot${i === variantIdx ? ' on' : ''}`}
                    onClick={() => setVariantIdx(i)}
                    aria-label={`${i + 1}`}
                  />
                ))}
              </div>
              <p className="wr-vcount">{t(`ảnh ${variantIdx + 1} / ${variants.length}`, `${variantIdx + 1} / ${variants.length}`)}</p>
            </>
          )}
          <button type="button" className="wr-btn-primary" onClick={() => keep(w)}>
            {t('Giữ ảnh này', 'Keep this one')}
          </button>
          {/* Same verse, so switching style reveals no new verses — allowed until they keep. */}
          {multiStyle && (
            <button type="button" className="wr-skip" onClick={() => { setPickedStyle(null); setVariantIdx(0); }}>
              {t('← Đổi phong cách', '← Change style')}
            </button>
          )}
          <button type="button" className="wr-skip" onClick={onClose}>
            {t('Để sau', 'Maybe later')}
          </button>
        </div>
      );
    }

    // Step 5 — kept. It's theirs; offer to save. (Set-as-avatar lives only in the gallery.)
    return (
      <div className="wr-panel">
        <button
          type="button"
          className="wr-preview wr-reveal wr-zoomable"
          onClick={() => setZoomSrc(kept.card)}
          aria-label={t('Phóng to ảnh', 'Zoom in')}
        >
          <img src={kept.card} alt={kept.ref} />
          <span className="wr-zoom-hint" aria-hidden="true">🔍</span>
        </button>
        <button
          type="button"
          className="wr-btn-primary"
          onClick={() => { download(kept.card, `${kept.id}.jpg`); onClose(); navigate('/ho-so'); }}
        >
          ⬇ {t('Lưu ảnh nền', 'Save wallpaper')}
        </button>
        {pending > 0 && (
          <button type="button" className="wr-btn-ghost wr-open-next" onClick={reset}>
            🎁 {t(`Mở món quà tiếp theo (còn ${pending})`, `Open your next gift (${pending} left)`)}
          </button>
        )}
        <button type="button" className="wr-btn-ghost wr-later" onClick={onClose}>
          {t('Để sau', 'Later')}
          <span className="wr-later-sub">
            {t('tải ảnh trong bộ sưu tập', 'download it from your collection')}
          </span>
        </button>
        {pending === 0 && (
          <p className="wr-return-note">
            {t(
              'Hãy quay lại ngày mai — lần thêm một chuỗi Mân Côi để nhận một món quà mới. 🌹',
              'Come back tomorrow — pray another rosary to receive a new gift. 🌹',
            )}
          </p>
        )}
      </div>
    );
  })();

  return createPortal(
    <>
      <div className="wr-backdrop" onClick={committed || outOfStock ? undefined : onClose}>
        <div className="wr-sheet" onClick={(e) => e.stopPropagation()}>{body}</div>
      </div>
      {zoomSrc && (
        <ImageZoomViewer
          src={zoomSrc}
          onClose={() => setZoomSrc(null)}
          closeLabel={t('Đóng', 'Close')}
          protect={kept === null}
        />
      )}
    </>,
    document.body,
  );
}
