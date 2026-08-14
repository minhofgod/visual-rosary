import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual } from '../data/types';
import { prayers } from '../data/prayers';
import { mysterySets } from '../data/mysteries';
import { GUIDE_TEXT, PRAYER_LIST, STEPS, FAQ, SET_ORDER, daysLabel } from '../data/guideContent';

// A text-rich, crawlable guide rendered on the landing page — the SEO content that
// a purely visual/interactive rosary app otherwise lacks. Vietnamese-first (the
// default language), targeting "cách lần hạt Mân Côi" / "đọc Kinh Mân Côi". Its
// content is shared with the build-time static injection (src/lib/renderGuideHtml.ts)
// via src/data/guideContent.ts, so the two never drift.

interface Props {
  displayLang: DisplayLang;
}

function pick(t: Bilingual, lang: DisplayLang) {
  if (lang === 'en') return t.en;
  if (lang === 'both') return `${t.vi} / ${t.en}`;
  return t.vi;
}

export function HowToGuide({ displayLang }: Props) {
  const lang = displayLang === 'both' ? 'vi' : displayLang;
  return (
    <section className="howto-guide" aria-label={pick(GUIDE_TEXT.ariaLabel, displayLang)}>
      <div className="howto-inner">
        <h2 className="howto-title">{pick(GUIDE_TEXT.title, displayLang)}</h2>
        <p className="howto-lead">{pick(GUIDE_TEXT.lead, displayLang)}</p>

        <h3 className="howto-h3">{pick(GUIDE_TEXT.hSteps, displayLang)}</h3>
        <ol className="howto-steps">
          {STEPS.map((s, i) => (
            <li key={i}>{pick(s, displayLang)}</li>
          ))}
        </ol>

        <h3 className="howto-h3">{pick(GUIDE_TEXT.hPrayers, displayLang)}</h3>
        {PRAYER_LIST.map((p) => (
          <div key={p.key} className="howto-prayer">
            <h4 className="howto-h4">{pick(p.name, displayLang)}</h4>
            {displayLang === 'both' ? (
              <>
                <p lang="vi">{prayers[p.key].vi}</p>
                <p lang="en" className="howto-secondary">
                  {prayers[p.key].en}
                </p>
              </>
            ) : (
              <p lang={displayLang}>{prayers[p.key][displayLang]}</p>
            )}
          </div>
        ))}

        <h3 className="howto-h3">{pick(GUIDE_TEXT.hMysteries, displayLang)}</h3>
        {SET_ORDER.map((key) => {
          const set = mysterySets[key];
          return (
            <div key={key} className="howto-mystery-set">
              <h4 className="howto-h4">
                {pick(set.name, displayLang)} — <span className="howto-days">{daysLabel(set.days, lang)}</span>
              </h4>
              <ol className="howto-mystery-list">
                {set.list.map((m) => (
                  <li key={m.imageKey}>{pick(m.title, displayLang)}</li>
                ))}
              </ol>
            </div>
          );
        })}

        <h3 className="howto-h3">{pick(GUIDE_TEXT.hFaq, displayLang)}</h3>
        <dl className="howto-faq">
          {FAQ.map((f, i) => (
            <div key={i}>
              <dt>{pick(f.q, displayLang)}</dt>
              <dd>{pick(f.a, displayLang)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
