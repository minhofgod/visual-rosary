import type { DisplayLang } from '../state/useDisplayLang';
import type { Bilingual, MysteryKey } from '../data/types';
import { prayers } from '../data/prayers';
import { mysterySets } from '../data/mysteries';

// A text-rich, crawlable guide rendered on the landing page — the SEO content that
// a purely visual/interactive rosary app otherwise lacks. Vietnamese-first (the
// default language), targeting "cách lần hạt Mân Côi" / "đọc Kinh Mân Côi".

interface Props {
  displayLang: DisplayLang;
}

function pick(t: Bilingual, lang: DisplayLang) {
  if (lang === 'en') return t.en;
  if (lang === 'both') return `${t.vi} / ${t.en}`;
  return t.vi;
}

// Full prayer texts, in the order they first occur in a rosary.
const PRAYER_LIST: { name: Bilingual; key: keyof typeof prayers }[] = [
  { name: { vi: 'Dấu Thánh Giá', en: 'Sign of the Cross' }, key: 'signOfTheCross' },
  { name: { vi: 'Kinh Tin Kính', en: "Apostles' Creed" }, key: 'apostlesCreed' },
  { name: { vi: 'Kinh Lạy Cha', en: 'Our Father' }, key: 'ourFather' },
  { name: { vi: 'Kinh Kính Mừng', en: 'Hail Mary' }, key: 'hailMary' },
  { name: { vi: 'Kinh Sáng Danh', en: 'Glory Be' }, key: 'gloryBe' },
  { name: { vi: 'Kinh Fatima', en: 'Fatima Prayer' }, key: 'fatimaPrayer' },
  { name: { vi: 'Kinh Lạy Nữ Vương', en: 'Hail, Holy Queen' }, key: 'hailHolyQueen' },
];

const STEPS: Bilingual[] = [
  { vi: 'Cầm Tượng Chuộc Tội, làm Dấu Thánh Giá và đọc Kinh Tin Kính.', en: 'Holding the crucifix, make the Sign of the Cross and pray the Apostles’ Creed.' },
  { vi: 'Ở hạt lớn đầu tiên, đọc một Kinh Lạy Cha.', en: 'On the first large bead, pray one Our Father.' },
  { vi: 'Ở ba hạt nhỏ, đọc ba Kinh Kính Mừng, cầu cho được ba nhân đức tin, cậy và mến.', en: 'On the three small beads, pray three Hail Marys for the virtues of faith, hope, and charity.' },
  { vi: 'Đọc một Kinh Sáng Danh.', en: 'Pray one Glory Be.' },
  { vi: 'Ở hạt nối, ngắm mầu nhiệm thứ nhất và đọc một Kinh Lạy Cha.', en: 'At the joining bead, announce the first mystery and pray one Our Father.' },
  { vi: 'Ở mười hạt nhỏ, đọc mười Kinh Kính Mừng, vừa đọc vừa suy niệm mầu nhiệm.', en: 'On the ten small beads, pray ten Hail Marys while meditating on the mystery.' },
  { vi: 'Cuối mỗi chục, đọc Kinh Sáng Danh và Kinh Fatima.', en: 'At the end of each decade, pray the Glory Be and the Fatima Prayer.' },
  { vi: 'Ngắm mầu nhiệm kế tiếp và lặp lại các bước trên cho đủ năm chục.', en: 'Announce the next mystery and repeat for all five decades.' },
  { vi: 'Kết thúc bằng Kinh Lạy Nữ Vương, lời nguyện kết và Dấu Thánh Giá.', en: 'Finish with the Hail, Holy Queen, a closing prayer, and the Sign of the Cross.' },
];

const DAY_VI = ['Chúa Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SET_ORDER: MysteryKey[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

function daysLabel(days: number[], lang: DisplayLang) {
  const names = lang === 'en' ? DAY_EN : DAY_VI;
  return days.map((d) => names[d]).join(lang === 'en' ? ', ' : ' và ');
}

const FAQ: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { vi: 'Lần một chuỗi Mân Côi (năm chục) mất bao lâu?', en: 'How long does one rosary (five decades) take?' },
    a: { vi: 'Thông thường khoảng 15–20 phút để đọc trọn một chuỗi năm chục Kinh Mân Côi.', en: 'Usually about 15–20 minutes to pray one full five-decade rosary.' },
  },
  {
    q: { vi: 'Chuỗi Mân Côi có bao nhiêu hạt?', en: 'How many beads are on a rosary?' },
    a: { vi: 'Một chuỗi Mân Côi có 59 hạt: một Tượng Chuộc Tội, phần dẫn nhập (một hạt lớn và ba hạt nhỏ), một hạt nối, và năm chục — mỗi chục gồm một hạt lớn và mười hạt nhỏ.', en: 'A rosary has 59 beads: a crucifix, an introductory large bead and three small beads, a centerpiece, and five decades of one large bead plus ten small beads each.' },
  },
  {
    q: { vi: 'Ngày nào đọc mầu nhiệm nào?', en: 'Which mysteries are prayed on which day?' },
    a: {
      vi: SET_ORDER.map((k) => `${mysterySets[k].name.vi}: ${daysLabel(mysterySets[k].days, 'vi')}`).join('; ') + '.',
      en: SET_ORDER.map((k) => `${mysterySets[k].name.en}: ${daysLabel(mysterySets[k].days, 'en')}`).join('; ') + '.',
    },
  },
];

export function HowToGuide({ displayLang }: Props) {
  return (
    <section className="howto-guide" aria-label={pick({ vi: 'Hướng dẫn đọc Kinh Mân Côi', en: 'Guide to praying the Rosary' }, displayLang)}>
      <div className="howto-inner">
        <h2 className="howto-title">{pick({ vi: 'Hướng Dẫn Đọc Kinh Mân Côi', en: 'How to Pray the Rosary' }, displayLang)}</h2>
        <p className="howto-lead">
          {pick(
            {
              vi: 'Kinh Mân Côi (lần hạt Mân Côi) là lời kinh kính Đức Mẹ, vừa đọc kinh vừa suy niệm cuộc đời Chúa Giêsu qua bốn mùa mầu nhiệm: Mùa Vui, Mùa Sáng, Mùa Thương và Mùa Mừng. Trang này giúp bạn đọc Kinh Mân Côi trực tuyến, song ngữ Việt–Anh, cùng hướng dẫn cách lần chuỗi từng bước.',
              en: 'The Rosary is a Marian prayer that meditates on the life of Christ through four sets of mysteries — Joyful, Luminous, Sorrowful, and Glorious. This page lets you pray the Rosary online in Vietnamese and English, with a step-by-step guide to praying the beads.',
            },
            displayLang
          )}
        </p>

        <h3 className="howto-h3">{pick({ vi: 'Cách Lần Hạt Mân Côi Từng Bước', en: 'Praying the Rosary Step by Step' }, displayLang)}</h3>
        <ol className="howto-steps">
          {STEPS.map((s, i) => (
            <li key={i}>{pick(s, displayLang)}</li>
          ))}
        </ol>

        <h3 className="howto-h3">{pick({ vi: 'Các Kinh Trong Chuỗi Mân Côi', en: 'The Prayers of the Rosary' }, displayLang)}</h3>
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

        <h3 className="howto-h3">{pick({ vi: 'Các Mầu Nhiệm Mân Côi', en: 'The Mysteries of the Rosary' }, displayLang)}</h3>
        {SET_ORDER.map((key) => {
          const set = mysterySets[key];
          return (
            <div key={key} className="howto-mystery-set">
              <h4 className="howto-h4">
                {pick(set.name, displayLang)} — <span className="howto-days">{daysLabel(set.days, displayLang)}</span>
              </h4>
              <ol className="howto-mystery-list">
                {set.list.map((m) => (
                  <li key={m.imageKey}>{pick(m.title, displayLang)}</li>
                ))}
              </ol>
            </div>
          );
        })}

        <h3 className="howto-h3">{pick({ vi: 'Câu Hỏi Thường Gặp', en: 'Frequently Asked Questions' }, displayLang)}</h3>
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
