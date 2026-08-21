import type { Bilingual } from './types';

// Short intercessions shown on the "🙏 Praying for you" card. After praying one,
// the user taps Amen to record their prayer for the requester. A refresh button
// cycles through the set. Vietnamese-first, traditional Catholic devotional wording.
export const INTERCESSIONS: Bilingual[] = [
  {
    vi: 'Lạy Cha nhân từ, xin đoái thương đến người đang dâng lời cầu xin này. Xin ban cho họ sức mạnh, bình an và niềm hy vọng nơi Cha. Amen.',
    en: 'Merciful Father, look with love upon the one who offers this prayer. Grant them strength, peace, and hope in you. Amen.',
  },
  {
    vi: 'Lạy Chúa Giêsu, Chúa hằng chạnh lòng thương xót. Xin ghé mắt nhìn đến ý nguyện này và ra tay cứu giúp theo thánh ý Chúa. Amen.',
    en: 'Lord Jesus, ever moved with compassion, look upon this intention and come to their aid according to your holy will. Amen.',
  },
  {
    vi: 'Lạy Chúa, xin nhậm lời con cầu nguyện cho anh chị em con đây. Xin an ủi, nâng đỡ và ban cho họ ơn cần thiết trong lúc này. Amen.',
    en: 'Lord, hear my prayer for my brother or sister here. Console them, uphold them, and grant them the grace they need in this hour. Amen.',
  },
  {
    vi: 'Lạy Mẹ Maria, xin Mẹ chuyển cầu cùng Chúa cho người con đang nhớ đến trong lời kinh này. Xin Mẹ ủi an và gìn giữ họ. Amen.',
    en: 'Mary, our Mother, intercede with your Son for the one I hold in this prayer. Console them and keep them safe. Amen.',
  },
];
