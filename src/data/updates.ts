// User-facing "Có gì mới / What's new" log. Curated for users (not the full dev CHANGELOG.md).
// Newest first. Also a handy source when writing Threads posts.

export interface AppUpdate {
  id: string;
  date: string; // display label
  title: { vi: string; en: string };
  items: { vi: string; en: string }[];
}

export const UPDATES: AppUpdate[] = [
  {
    id: '2026-08-wallpaper',
    date: '28 tháng 8, 2026',
    title: { vi: 'Ảnh nền Lời Chúa', en: 'Scripture wallpapers' },
    items: [
      {
        vi: 'Lần xong một chuỗi Mân Côi, bạn nhận một tấm ảnh nền có Lời Chúa làm quà.',
        en: 'Finish a rosary to receive a Scripture wallpaper as a gift.',
      },
      {
        vi: 'Ba phong cách ảnh — Nhẹ nhàng, Điện ảnh, Cổ điển — tuỳ theo câu Lời Chúa.',
        en: 'Three art styles — Soft, Cinematic, Classical — depending on the verse.',
      },
      {
        vi: 'Bộ sưu tập "Ảnh nền của bạn" — sưu tầm, phóng to chiêm ngắm, dùng làm ảnh nền điện thoại.',
        en: 'A "Your wallpapers" collection — collect them, zoom in, use them as your phone wallpaper.',
      },
      { vi: 'Xem tổng số chuỗi Mân Côi đã lần trên toàn trang.', en: 'See the site-wide total of rosaries prayed.' },
    ],
  },
  {
    id: '2026-08-community',
    date: '25 tháng 8, 2026',
    title: { vi: 'Cộng đoàn & Tài khoản', en: 'Community & accounts' },
    items: [
      {
        vi: 'Ý Cầu Nguyện — bức tường cầu nguyện của cộng đoàn, hoàn toàn ẩn danh; cùng cầu nguyện cho nhau.',
        en: 'A prayer wall — the community prays for one another, completely anonymously.',
      },
      { vi: 'Chuỗi ngày lần hạt + lịch cầu nguyện.', en: 'A prayer streak and calendar.' },
      { vi: 'Đăng nhập để lưu dữ liệu trên mọi thiết bị.', en: 'Sign in to keep your data across devices.' },
      { vi: 'Tuỳ chọn chữ lớn hơn cho dễ đọc.', en: 'A larger-text option for easier reading.' },
    ],
  },
  {
    id: '2026-08-launch',
    date: '22 tháng 8, 2026',
    title: { vi: 'Ra mắt', en: 'Official launch' },
    items: [
      {
        vi: 'Đọc Kinh Mân Côi trực tuyến — đủ bốn Mùa Mầu Nhiệm (Vui, Sáng, Thương, Mừng).',
        en: 'Pray the rosary online — all four sets of mysteries (Joyful, Luminous, Sorrowful, Glorious).',
      },
      {
        vi: 'Mỗi ngắm có suy niệm và Lời Kinh Thánh; hiển thị song ngữ Việt – Anh.',
        en: 'Each mystery with a meditation and Scripture; bilingual Vietnamese – English.',
      },
      { vi: 'Đếm số chuỗi Mân Côi cộng đoàn đã lần trong ngày.', en: "A daily counter of the community's rosaries." },
    ],
  },
];

export const LATEST_UPDATE_ID = UPDATES[0].id;

const SEEN_KEY = 'rosary.updatesSeen';

/** True if the latest update hasn't been opened on this device (drives the "new" dot). */
export function hasUnseenUpdate(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) !== LATEST_UPDATE_ID;
  } catch {
    return false;
  }
}

/** Mark the latest update as seen (call when the What's-new panel opens). */
export function markUpdatesSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, LATEST_UPDATE_ID);
  } catch {
    /* storage disabled — the dot just won't persist as dismissed */
  }
}
