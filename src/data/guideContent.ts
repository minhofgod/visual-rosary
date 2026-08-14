import type { Bilingual, MysteryKey } from './types';
import { prayers } from './prayers';
import { mysterySets } from './mysteries';

// Shared content for the landing-page "how to pray" guide. Kept as pure data (no
// JSX) so it can drive BOTH the React <HowToGuide> component and the build-time
// static HTML injection (src/lib/renderGuideHtml.ts), which stay in sync.

export const GUIDE_TEXT = {
  ariaLabel: { vi: 'Hướng dẫn đọc Kinh Mân Côi', en: 'Guide to praying the Rosary' } as Bilingual,
  title: { vi: 'Hướng Dẫn Đọc Kinh Mân Côi', en: 'How to Pray the Rosary' } as Bilingual,
  lead: {
    vi: 'Kinh Mân Côi (lần hạt Mân Côi) là lời kinh kính Đức Mẹ, vừa đọc kinh vừa suy niệm cuộc đời Chúa Giêsu qua bốn mùa mầu nhiệm: Mùa Vui, Mùa Sáng, Mùa Thương và Mùa Mừng. Trang này giúp bạn đọc Kinh Mân Côi trực tuyến, song ngữ Việt–Anh, cùng hướng dẫn cách lần chuỗi từng bước.',
    en: 'The Rosary is a Marian prayer that meditates on the life of Christ through four sets of mysteries — Joyful, Luminous, Sorrowful, and Glorious. This page lets you pray the Rosary online in Vietnamese and English, with a step-by-step guide to praying the beads.',
  } as Bilingual,
  hSteps: { vi: 'Cách Lần Hạt Mân Côi Từng Bước', en: 'Praying the Rosary Step by Step' } as Bilingual,
  hPrayers: { vi: 'Các Kinh Trong Chuỗi Mân Côi', en: 'The Prayers of the Rosary' } as Bilingual,
  hMysteries: { vi: 'Các Mầu Nhiệm Mân Côi', en: 'The Mysteries of the Rosary' } as Bilingual,
  hFaq: { vi: 'Câu Hỏi Thường Gặp', en: 'Frequently Asked Questions' } as Bilingual,
};

export const PRAYER_LIST: { name: Bilingual; key: keyof typeof prayers }[] = [
  { name: { vi: 'Dấu Thánh Giá', en: 'Sign of the Cross' }, key: 'signOfTheCross' },
  { name: { vi: 'Kinh Tin Kính', en: "Apostles' Creed" }, key: 'apostlesCreed' },
  { name: { vi: 'Kinh Lạy Cha', en: 'Our Father' }, key: 'ourFather' },
  { name: { vi: 'Kinh Kính Mừng', en: 'Hail Mary' }, key: 'hailMary' },
  { name: { vi: 'Kinh Sáng Danh', en: 'Glory Be' }, key: 'gloryBe' },
  { name: { vi: 'Kinh Fatima', en: 'Fatima Prayer' }, key: 'fatimaPrayer' },
  { name: { vi: 'Kinh Lạy Nữ Vương', en: 'Hail, Holy Queen' }, key: 'hailHolyQueen' },
];

export const STEPS: Bilingual[] = [
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
export const SET_ORDER: MysteryKey[] = ['joyful', 'luminous', 'sorrowful', 'glorious'];

export function daysLabel(days: number[], lang: 'vi' | 'en') {
  const names = lang === 'en' ? DAY_EN : DAY_VI;
  return days.map((d) => names[d]).join(lang === 'en' ? ', ' : ' và ');
}

export const FAQ: { q: Bilingual; a: Bilingual }[] = [
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
