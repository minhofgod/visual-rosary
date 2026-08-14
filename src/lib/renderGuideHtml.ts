import type { Bilingual } from '../data/types';
import { prayers } from '../data/prayers';
import { mysterySets } from '../data/mysteries';
import { GUIDE_TEXT, PRAYER_LIST, STEPS, FAQ, SET_ORDER, daysLabel } from './../data/guideContent';

// Builds the static HTML for the how-to guide, so it can be injected into the built
// index.html at build time (see the inject-guide plugin in vite.config.ts). This
// gives crawlers and link-preview scrapers that don't run JavaScript the full text,
// and speeds first paint. It renders the SAME shared content as <HowToGuide>, so
// the two stay in sync. Static output is Vietnamese (the site's default language).

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderGuideHtml(lang: 'vi' | 'en' = 'vi'): string {
  const t = (b: Bilingual) => esc(b[lang]);

  const steps = STEPS.map((s) => `<li>${t(s)}</li>`).join('');

  const prayerBlocks = PRAYER_LIST.map(
    (p) => `<div class="howto-prayer"><h4 class="howto-h4">${t(p.name)}</h4><p lang="${lang}">${esc(prayers[p.key][lang])}</p></div>`
  ).join('');

  const mysteryBlocks = SET_ORDER.map((key) => {
    const set = mysterySets[key];
    const items = set.list.map((m) => `<li>${t(m.title)}</li>`).join('');
    return `<div class="howto-mystery-set"><h4 class="howto-h4">${t(set.name)} — <span class="howto-days">${esc(daysLabel(set.days, lang))}</span></h4><ol class="howto-mystery-list">${items}</ol></div>`;
  }).join('');

  const faq = FAQ.map((f) => `<div><dt>${t(f.q)}</dt><dd>${t(f.a)}</dd></div>`).join('');

  return (
    `<section class="howto-guide" aria-label="${t(GUIDE_TEXT.ariaLabel)}"><div class="howto-inner">` +
    `<h2 class="howto-title">${t(GUIDE_TEXT.title)}</h2>` +
    `<p class="howto-lead">${t(GUIDE_TEXT.lead)}</p>` +
    `<h3 class="howto-h3">${t(GUIDE_TEXT.hSteps)}</h3><ol class="howto-steps">${steps}</ol>` +
    `<h3 class="howto-h3">${t(GUIDE_TEXT.hPrayers)}</h3>${prayerBlocks}` +
    `<h3 class="howto-h3">${t(GUIDE_TEXT.hMysteries)}</h3>${mysteryBlocks}` +
    `<h3 class="howto-h3">${t(GUIDE_TEXT.hFaq)}</h3><dl class="howto-faq">${faq}</dl>` +
    `</div></section>`
  );
}
