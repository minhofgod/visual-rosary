import type { MysteryKey, MysterySet } from './types';

export const mysterySets: Record<MysteryKey, MysterySet> = {
  joyful: {
    key: 'joyful',
    name: { vi: 'Năm Sự Vui', en: 'The Joyful Mysteries' },
    days: [1, 6], // Mon, Sat
    list: [
      {
        order: 1,
        title: { vi: 'Thiên thần truyền tin cho Đức Bà chịu thai', en: 'The Annunciation' },
        petition: { vi: 'Ta hãy xin cho được ở khiêm nhường.', en: 'That we may obtain the virtue of humility.' },
      },
      {
        order: 2,
        title: { vi: 'Đức Bà đi viếng bà thánh Isave', en: 'The Visitation' },
        petition: { vi: 'Ta hãy xin cho được lòng yêu người.', en: 'That we may obtain love of neighbor.' },
      },
      {
        order: 3,
        title: { vi: 'Đức Bà sinh Đức Chúa Giêsu nơi hang đá', en: 'The Nativity' },
        petition: { vi: 'Ta hãy xin cho được lòng khó khăn.', en: 'That we may obtain the spirit of poverty.' },
      },
      {
        order: 4,
        title: { vi: 'Đức Bà dâng Đức Chúa Giêsu trong đền thánh', en: 'The Presentation in the Temple' },
        petition: { vi: 'Ta hãy xin cho được vâng lời chịu lụy.', en: 'That we may obtain the virtue of obedience.' },
      },
      {
        order: 5,
        title: { vi: 'Đức Bà tìm được Đức Chúa Giêsu trong đền thánh', en: 'The Finding in the Temple' },
        petition: { vi: 'Ta hãy xin cho được giữ nghĩa cùng Chúa luôn.', en: 'That we may obtain fidelity to God.' },
      },
    ],
  },
  luminous: {
    key: 'luminous',
    name: { vi: 'Năm Sự Sáng', en: 'The Luminous Mysteries' },
    days: [4], // Thu
    list: [
      {
        order: 1,
        title: { vi: 'Đức Chúa Giêsu chịu phép Rửa tại sông Giođan', en: 'The Baptism in the Jordan' },
        petition: {
          vi: 'Ta hãy xin cho được sống xứng đáng là con Thiên Chúa.',
          en: 'That we may live worthily as children of God.',
        },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu làm phép lạ tại tiệc cưới Cana', en: 'The Wedding at Cana' },
        petition: {
          vi: 'Ta hãy xin cho được noi gương Đức Mẹ mà vững tin vào Chúa.',
          en: 'That we may follow Mary’s example of unwavering trust in God.',
        },
      },
      {
        order: 3,
        title: {
          vi: 'Đức Chúa Giêsu rao giảng Nước Trời và kêu gọi sám hối',
          en: 'The Proclamation of the Kingdom',
        },
        petition: {
          vi: 'Ta hãy xin cho được tin vào lòng Chúa thương xót và siêng năng lãnh nhận Bí tích Giao hòa.',
          en: 'That we may trust in God’s mercy and turn often to the Sacrament of Reconciliation.',
        },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Giêsu biến hình trên núi', en: 'The Transfiguration' },
        petition: { vi: 'Ta hãy xin cho được biến đổi nhờ Chúa Thánh Thần.', en: 'That we may be transformed by the Holy Spirit.' },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Giêsu lập Bí tích Thánh Thể', en: 'The Institution of the Eucharist' },
        petition: {
          vi: 'Ta hãy xin cho được siêng năng tham dự Thánh lễ và rước Mình Máu Thánh Người.',
          en: 'That we may faithfully attend Mass and receive the Body and Blood of Christ.',
        },
      },
    ],
  },
  sorrowful: {
    key: 'sorrowful',
    name: { vi: 'Năm Sự Thương', en: 'The Sorrowful Mysteries' },
    days: [2, 5], // Tue, Fri
    list: [
      {
        order: 1,
        title: { vi: 'Đức Chúa Giêsu lo buồn đổ mồ hôi máu', en: 'The Agony in the Garden' },
        petition: { vi: 'Ta hãy xin cho được ăn năn tội nên.', en: 'That we may obtain true sorrow for sin.' },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu chịu đánh đòn', en: 'The Scourging at the Pillar' },
        petition: { vi: 'Ta hãy xin cho được hãm mình chịu khó bằng lòng.', en: 'That we may obtain the virtue of purity and mortification.' },
      },
      {
        order: 3,
        title: { vi: 'Đức Chúa Giêsu chịu đội mão gai', en: 'The Crowning with Thorns' },
        petition: { vi: 'Ta hãy xin cho được chịu mọi sự sỉ nhục bằng lòng.', en: 'That we may bear humiliation with patience.' },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Giêsu vác Thánh giá', en: 'The Carrying of the Cross' },
        petition: { vi: 'Ta hãy xin cho được vác Thánh giá theo chân Chúa.', en: 'That we may carry our own cross in Christ’s footsteps.' },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Giêsu chịu chết trên cây Thánh giá', en: 'The Crucifixion' },
        petition: { vi: 'Ta hãy xin đóng đanh tính xác thịt vào Thánh giá Chúa.', en: 'That we may die to sin and cling to Christ’s cross.' },
      },
    ],
  },
  glorious: {
    key: 'glorious',
    name: { vi: 'Năm Sự Mừng', en: 'The Glorious Mysteries' },
    days: [3, 0], // Wed, Sun
    list: [
      {
        order: 1,
        title: { vi: 'Đức Chúa Giêsu sống lại', en: 'The Resurrection' },
        petition: { vi: 'Ta hãy xin cho được sống lại thật về phần linh hồn.', en: 'That we may obtain true faith and rise to new life in Christ.' },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu lên trời', en: 'The Ascension' },
        petition: { vi: 'Ta hãy xin cho được ái mộ những sự trên trời.', en: 'That we may obtain hope and desire for Heaven.' },
      },
      {
        order: 3,
        title: { vi: 'Đức Chúa Thánh Thần hiện xuống', en: 'The Descent of the Holy Spirit' },
        petition: { vi: 'Ta hãy xin cho được lòng đầy rẫy mọi ơn Đức Chúa Thánh Thần.', en: 'That we may be filled with the gifts of the Holy Spirit.' },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Trời cho Đức Bà lên trời', en: 'The Assumption of Mary' },
        petition: { vi: 'Ta hãy xin ơn chết lành trong tay Đức Mẹ.', en: 'That we may obtain the grace of a happy death.' },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Trời thưởng Đức Mẹ trên trời', en: 'The Coronation of Mary' },
        petition: {
          vi: 'Ta hãy xin Đức Mẹ phù hộ cho ta được thưởng cùng Đức Mẹ trên nước thiên đàng.',
          en: 'That we may share with Mary the reward of Heaven.',
        },
      },
    ],
  },
};

export function todaysMysteryKey(date: Date = new Date()): MysteryKey {
  const day = date.getDay();
  const match = Object.values(mysterySets).find((set) => set.days.includes(day));
  return match ? match.key : 'joyful';
}
