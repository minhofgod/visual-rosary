import type { Bilingual } from './types';

export const prayers: Record<
  | 'signOfTheCross'
  | 'apostlesCreed'
  | 'ourFather'
  | 'hailMary'
  | 'gloryBe'
  | 'fatimaPrayer'
  | 'hailHolyQueen'
  | 'memorare',
  Bilingual
> = {
  signOfTheCross: {
    vi: 'Nhân danh Cha +, và Con, và Thánh Thần. Amen.',
    en: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  },
  apostlesCreed: {
    vi: 'Tôi tin kính Đức Chúa Trời, là Cha phép tắc vô cùng dựng nên trời đất. Tôi tin kính Đức Chúa Giêsu Kitô là Con Một Đức Chúa Cha, cùng là Chúa chúng tôi, bởi phép Đức Chúa Thánh Thần mà Người xuống thai sinh bởi Bà Maria Đồng Trinh, chịu nạn đời quan Phongxiô Philatô, chịu đóng đanh trên cây Thánh giá, chết và táng xác, xuống ngục tổ tông, ngày thứ ba bởi trong kẻ chết mà sống lại, lên trời ngự bên hữu Đức Chúa Cha phép tắc vô cùng, ngày sau bởi trời lại xuống phán xét kẻ sống và kẻ chết. Tôi tin kính Đức Chúa Thánh Thần. Tôi tin có Hội Thánh hằng có ở khắp thế này, các thánh thông công. Tôi tin phép tha tội. Tôi tin xác loài người ngày sau sống lại. Tôi tin hằng sống vậy. Amen.',
    en: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  },
  ourFather: {
    vi: 'Lạy Cha chúng con ở trên trời, chúng con nguyện danh Cha cả sáng, Nước Cha trị đến, ý Cha thể hiện dưới đất cũng như trên trời. Xin Cha cho chúng con hôm nay lương thực hàng ngày, và tha nợ chúng con như chúng con cũng tha kẻ có nợ chúng con; xin chớ để chúng con sa chước cám dỗ, nhưng cứu chúng con cho khỏi sự dữ. Amen.',
    en: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  },
  hailMary: {
    vi: 'Kính mừng Maria đầy ơn phúc, Đức Chúa Trời ở cùng Bà, Bà có phúc lạ hơn mọi người nữ, và Giêsu Con lòng Bà gồm phúc lạ. Thánh Maria Đức Mẹ Chúa Trời, cầu cho chúng con là kẻ có tội, khi nay và trong giờ lâm tử. Amen.',
    en: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  },
  gloryBe: {
    vi: 'Sáng danh Đức Chúa Cha và Đức Chúa Con và Đức Chúa Thánh Thần. Như đã có trước vô cùng, và bây giờ, và hằng có, và đời đời chẳng cùng. Amen.',
    en: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
  },
  fatimaPrayer: {
    vi: 'Lạy Chúa Giêsu, xin tha tội cho chúng con, xin cứu chúng con khỏi sa hỏa ngục, xin đem các linh hồn lên Thiên Đàng, nhất là những linh hồn cần đến lòng Chúa thương xót hơn.',
    en: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to Heaven, especially those most in need of Thy mercy.',
  },
  hailHolyQueen: {
    vi: 'Lạy Nữ Vương Mẹ nhân lành làm cho chúng con được sống, được vui, được cậy, thân lạy Mẹ. Chúng con con cháu Evà ở chốn khách đầy, kêu đến cùng Bà, chúng con ở nơi khóc lóc than thở kêu khẩn Bà thương. Hỡi ôi! Bà là Chúa bầu chúng con, xin ghé mặt thương xem chúng con. Đến sau khỏi đầy, xin cho chúng con được thấy Đức Chúa Giêsu Con lòng Bà gồm phúc lạ. Ôi! Khoan thay! Nhân thay! Dịu thay! Thánh Maria trọn đời đồng trinh. Amen.',
    en: 'Hail, holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen.',
  },
  memorare: {
    vi: 'Chúng con trông cậy Rất Thánh Đức Mẹ Chúa Trời, xin chớ chê chớ bỏ lời chúng con nguyện trong cơn gian nan thiếu thốn, Đức Nữ Đồng Trinh hiển vinh sáng láng. Hằng chữa chúng con cho khỏi sự dữ. Amen.',
    en: 'Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.',
  },
};
