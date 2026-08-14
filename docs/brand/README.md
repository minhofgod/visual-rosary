# Đọc Kinh Mân Côi — logo package

> **In this repo:** the built assets live in [`/public/logo/`](../../public/logo)
> (served at `/logo/...`), and the wordmark's rosary-Ô is implemented as
> [`src/components/RosaryO.tsx`](../../src/components/RosaryO.tsx). The file paths in
> the table below refer to that `public/logo/` asset tree. This folder keeps the
> original brand guidelines and the paste-ready snippets for reference.

The Ô of **CÔI** is a rosary: a beaded ring for the decade, a gold centerpiece where the
pendant leaves the loop at 22° (so it never reads as the dot-below of "ộ"), and a gold crucifix on the pendant. Everything else in the
wordmark is unchanged — Source Serif 4, the same three-line lockup.

## Files

| File | Use |
|---|---|
| `lockup/lockup-dark.svg` | Full lockup on dark ground (needs Source Serif 4) |
| `lockup/lockup-light.svg` | Full lockup on light chrome |
| `glyph/o-rosary.svg` | The Ô alone, full pendant — for setting live text |
| `glyph/o-rosary-compact.svg` | Same glyph, tighter canvas (headers, tight rows) |
| `glyph/o-rosary-light.svg` | The Ô alone for light grounds |
| `icon/icon.svg` | Mark only, no circumflex — app icon, social avatar |
| `icon/icon-tile.svg` | Mark on a #1a1310 rounded tile (= `favicon.svg`) |
| `icon/icon-light.svg` | Mark for light grounds |
| `icon/icon-16.svg` | 16px build: small beads dropped, four gold marks only |
| `favicon.svg` | Drop-in favicon |
| `png/` | icon-512, icon-192, apple-touch-icon-180, favicon-32 |
| `snippets/wordmark.html` | Paste-ready HTML lockup, full + compact |
| `snippets/Wordmark.jsx` | React `<Wordmark>` / `<RosaryO>` for the codebase |

## Colors

Gold `#c9a227` (large beads, centerpiece, crucifix) · white `#ffffff` (Hail Mary beads) ·
string `#ffffff` hairline on dark (`#8c7f6d` on light) · letterforms inherit `currentColor` (`#ffffff` in app, `#f2ead9` on the
dark panel, `#241f1b` on light). On light grounds the string goes `#8c7f6d` and the beads stay white.

## Rules

1. **Reserve the pendant.** In the full variant the crucifix hangs below the baseline and is
   drawn outside the viewBox (`overflow: visible`). Keep `padding-bottom: .5em` on the
   title line, or use the compact variant.
2. **Below 16px use `icon-16.svg`** — the small beads
   turn to mush before that.
3. **Circumflex only in the wordmark.** The icon and favicon drop the hat; the mark is the
   rosary alone.
4. **Never recolor the crucifix or centerpiece** away from gold, and never add a second
   accent hue, gradient, or shadow.
5. Clear space around the mark: one bead diameter (≈ 6% of the mark's height) on all sides.

## HTML head

```html
<link rel="icon" href="/logo/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/logo/png/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/logo/png/apple-touch-icon-180.png">
```

Manifest: `icon-192.png` and `icon-512.png` (`purpose: "any maskable"` — the tile already
carries the dark ground and safe padding).
