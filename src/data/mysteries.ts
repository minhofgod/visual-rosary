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
        fruitShort: { vi: 'Khiêm Nhường', en: 'Humility' },
        imageKey: 'annunciation',
        meditation: {
          en: "At the angel's greeting, Mary does not exalt herself but asks only how such a thing can be, then surrenders entirely: “Let it be done to me according to your word.” Her humility makes room for God to work. We ask for that same emptying of self, so that our own fiat can become the doorway through which grace enters our daily lives.",
          vi: "Trước lời chào của thiên thần, Đức Mẹ không tự tôn mình lên nhưng chỉ hỏi làm sao việc ấy xảy ra, rồi hoàn toàn phó thác: “Xin hãy thành sự cho tôi như lời sứ thần truyền.” Sự khiêm nhường của Mẹ đã mở đường cho Thiên Chúa hành động. Chúng ta xin được ơn từ bỏ chính mình như thế, để tiếng “xin vâng” của ta cũng trở nên cửa ngõ cho ân sủng bước vào đời sống hằng ngày.",
        },
      },
      {
        order: 2,
        title: { vi: 'Đức Bà đi viếng bà thánh Isave', en: 'The Visitation' },
        petition: { vi: 'Ta hãy xin cho được lòng yêu người.', en: 'That we may obtain love of neighbor.' },
        fruitShort: { vi: 'Bác Ái', en: 'Fraternal Charity' },
        imageKey: 'visitation',
        meditation: {
          en: "Even carrying the Word made flesh within her, Mary's first thought is for her cousin Elizabeth, and she hurries into the hill country to serve her. True love of God always overflows into service of others. We ask for hearts that, having received Christ, cannot help but hasten toward whoever needs us.",
          vi: "Dù đang cưu mang Ngôi Lời nhập thể trong lòng, Đức Mẹ vẫn nghĩ đến bà Isave trước tiên và vội vã lên miền núi để phục vụ bà. Lòng mến Chúa thật sự luôn tràn ra thành sự phục vụ tha nhân. Chúng ta xin cho được tấm lòng, một khi đã đón nhận Chúa Kitô, không thể không vội vã đến với những ai đang cần đến mình.",
        },
      },
      {
        order: 3,
        title: { vi: 'Đức Bà sinh Đức Chúa Giêsu nơi hang đá', en: 'The Nativity' },
        petition: { vi: 'Ta hãy xin cho được lòng khó khăn.', en: 'That we may obtain the spirit of poverty.' },
        fruitShort: { vi: 'Khó Nghèo', en: 'Detachment' },
        imageKey: 'nativity',
        meditation: {
          en: 'The King of Heaven is born not in a palace but a stable, with no bed but a manger. He teaches us from His first breath that greatness is not found in possessions but in simplicity of heart. We ask for the grace to hold the things of this world loosely, that our hands may be free to receive Him.',
          vi: 'Vua trời đất sinh ra không phải trong cung điện mà nơi hang lừa máng cỏ. Ngay từ hơi thở đầu tiên, Người đã dạy ta rằng sự cao trọng không hệ tại của cải nhưng ở tâm hồn đơn sơ. Chúng ta xin ơn biết buông bỏ những sự đời này, để đôi tay được tự do đón nhận Người.',
        },
      },
      {
        order: 4,
        title: { vi: 'Đức Bà dâng Đức Chúa Giêsu trong đền thánh', en: 'The Presentation in the Temple' },
        petition: { vi: 'Ta hãy xin cho được vâng lời chịu lụy.', en: 'That we may obtain the virtue of obedience.' },
        fruitShort: { vi: 'Vâng Lời', en: 'Obedience' },
        imageKey: 'presentation',
        meditation: {
          en: 'Mary and Joseph bring the Son of God to the Temple simply because the Law asks it of them, not because He needs purifying. Their quiet obedience, even in something so small, shows us that holiness is built in the ordinary acts of fidelity. We ask for the grace to obey God’s will in the small things of each day.',
          vi: 'Đức Mẹ và thánh Giuse đem Con Thiên Chúa lên Đền Thờ chỉ vì Lề Luật đòi buộc, dù Người không cần được thanh tẩy. Sự vâng phục âm thầm ấy, dù trong một việc nhỏ bé, cho ta thấy sự thánh thiện được xây nên từ những hành vi trung tín thường ngày. Chúng ta xin ơn biết vâng theo thánh ý Chúa trong những điều nhỏ mọn của mỗi ngày.',
        },
      },
      {
        order: 5,
        title: { vi: 'Đức Bà tìm được Đức Chúa Giêsu trong đền thánh', en: 'The Finding in the Temple' },
        petition: { vi: 'Ta hãy xin cho được giữ nghĩa cùng Chúa luôn.', en: 'That we may obtain fidelity to God.' },
        fruitShort: { vi: 'Niềm Vui Tìm Được Chúa', en: 'Joy at Finding Jesus' },
        imageKey: 'finding',
        meditation: {
          en: "After three anxious days of searching, Mary and Joseph find the boy Jesus in the Temple, intent on His Father's business. Even those closest to Him do not always understand His ways, yet they keep seeking and keep believing. We ask for perseverance in seeking Christ, especially in the seasons when He seems hidden from us.",
          vi: 'Sau ba ngày lo lắng tìm kiếm, Đức Mẹ và thánh Giuse gặp lại Chúa Giêsu trong Đền Thờ, đang lo việc của Cha Người. Ngay cả những người gần gũi Người nhất cũng không phải lúc nào cũng hiểu được đường lối của Người, nhưng các ngài vẫn kiên trì tìm kiếm và tin tưởng. Chúng ta xin ơn bền đỗ tìm kiếm Chúa Kitô, nhất là trong những lúc Người dường như ẩn khuất khỏi ta.',
        },
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
        fruitShort: { vi: 'Ơn Thanh Tẩy', en: 'The Gift of Baptism' },
        imageKey: 'baptism',
        meditation: {
          en: "As Jesus rises from the waters of the Jordan, the Father's voice names Him beloved Son, and the Spirit descends like a dove. In our own baptism we were claimed with the same words. We ask for the grace to live each day aware that we are truly, already, God's beloved children.",
          vi: 'Khi Chúa Giêsu bước lên khỏi dòng nước sông Giođan, tiếng Chúa Cha gọi Người là Con yêu dấu, và Thánh Thần ngự xuống như chim bồ câu. Trong phép Rửa của mình, ta cũng đã được gọi bằng chính lời ấy. Chúng ta xin ơn sống mỗi ngày trong ý thức rằng mình thật sự, đã từ lâu, là con cái yêu dấu của Thiên Chúa.',
        },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu làm phép lạ tại tiệc cưới Cana', en: 'The Wedding at Cana' },
        petition: {
          vi: 'Ta hãy xin cho được noi gương Đức Mẹ mà vững tin vào Chúa.',
          en: 'That we may follow Mary’s example of unwavering trust in God.',
        },
        fruitShort: { vi: 'Lòng Sùng Kính Đức Mẹ', en: 'Marian Devotion' },
        imageKey: 'cana',
        meditation: {
          en: "Mary notices the wine has run out before anyone else does, and simply tells the servants, “Do whatever He tells you.” Her quiet confidence in her Son becomes the occasion for His first miracle. We ask for that same trust, bringing our own empty jars to Jesus and waiting on His word.",
          vi: 'Đức Mẹ nhận ra rượu đã hết trước cả những người khác, và chỉ nói với gia nhân: “Người bảo gì, các anh cứ việc làm theo.” Lòng tin tưởng âm thầm của Mẹ nơi Con mình đã trở nên dịp cho phép lạ đầu tiên của Người. Chúng ta xin được lòng tin tưởng ấy, mang những chum nước trống rỗng của đời mình đến với Chúa Giêsu và chờ đợi lời Người.',
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
        fruitShort: { vi: 'Rao Giảng Tin Mừng', en: 'Evangelization' },
        imageKey: 'proclamation',
        meditation: {
          en: 'Jesus begins His public life with a simple, urgent call: repent, and believe in the Good News. He does not wait for us to become worthy before inviting us into the Kingdom. We ask for the courage to turn back to Him again and again, trusting that His mercy is always greater than our sin.',
          vi: 'Chúa Giêsu bắt đầu đời sống công khai bằng một lời mời gọi đơn sơ mà khẩn thiết: hãy sám hối và tin vào Tin Mừng. Người không đợi ta trở nên xứng đáng rồi mới mời gọi ta vào Nước Trời. Chúng ta xin ơn can đảm quay về với Người mãi mãi, tin tưởng rằng lòng thương xót của Người luôn lớn hơn tội lỗi ta.',
        },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Giêsu biến hình trên núi', en: 'The Transfiguration' },
        petition: { vi: 'Ta hãy xin cho được biến đổi nhờ Chúa Thánh Thần.', en: 'That we may be transformed by the Holy Spirit.' },
        fruitShort: { vi: 'Vinh Quang Chúa Ki-tô', en: "Christ's Glory" },
        imageKey: 'transfiguration',
        meditation: {
          en: 'For a brief moment on the mountain, Peter, James, and John glimpse Christ’s hidden glory, and Peter wants to stay there forever. But the vision is given to strengthen them for the descent, not to replace it. We ask for a taste of God’s glory that sends us back, transformed, into the ordinary work of holiness.',
          vi: 'Trong giây phút ngắn ngủi trên núi, các thánh Phêrô, Giacôbê và Gioan được thoáng thấy vinh quang ẩn giấu của Chúa Kitô, và thánh Phêrô muốn ở lại đó mãi mãi. Nhưng thị kiến ấy được ban để củng cố các ngài khi xuống núi, chứ không phải để thay thế đời sống thường ngày. Chúng ta xin được nếm trước vinh quang Thiên Chúa, để rồi được biến đổi mà trở lại với công việc nên thánh mỗi ngày.',
        },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Giêsu lập Bí tích Thánh Thể', en: 'The Institution of the Eucharist' },
        petition: {
          vi: 'Ta hãy xin cho được siêng năng tham dự Thánh lễ và rước Mình Máu Thánh Người.',
          en: 'That we may faithfully attend Mass and receive the Body and Blood of Christ.',
        },
        fruitShort: { vi: 'Lòng Sùng Kính Thánh Thể', en: 'Devotion to The Blessed Sacrament' },
        imageKey: 'institution',
        meditation: {
          en: 'On the night before He suffered, Jesus takes bread and wine and gives us Himself, entirely, to be received again and again until He comes. It is the deepest gift love could invent: to remain with us under so humble a sign. We ask for hunger for this Bread, and reverence each time we come to His table.',
          vi: 'Vào đêm trước khi chịu khổ nạn, Chúa Giêsu cầm lấy bánh và rượu mà ban chính mình Người cho ta, trọn vẹn, để được lãnh nhận đi lãnh nhận lại cho đến ngày Người lại đến. Đó là món quà sâu xa nhất mà tình yêu có thể nghĩ ra: ở lại với ta dưới một dấu chỉ khiêm hạ như thế. Chúng ta xin được đói khát Tấm Bánh này, và lòng cung kính mỗi khi đến bàn tiệc của Người.',
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
        fruitShort: { vi: 'Vâng Theo Ý Chúa', en: "Choosing God's Will" },
        imageKey: 'agony',
        meditation: {
          en: "Alone in Gethsemane, Jesus takes on the full weight of the world's sin, sweating blood as He prays, “not my will, but yours be done.” He asks His friends to watch with Him, and they fall asleep. We ask for true sorrow for our sins, and for the willingness to stay awake with Him in His hour of need.",
          vi: 'Một mình trong vườn Giệtsimani, Chúa Giêsu gánh lấy trọn vẹn sức nặng tội lỗi của cả nhân loại, đổ mồ hôi máu khi cầu nguyện: “xin đừng theo ý con, một theo ý Cha.” Người xin các môn đệ tỉnh thức cùng Người, nhưng các ông lại ngủ mê. Chúng ta xin ơn thật lòng ăn năn tội lỗi mình, và sẵn lòng tỉnh thức bên Người trong giờ Người cần đến ta.',
        },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu chịu đánh đòn', en: 'The Scourging at the Pillar' },
        petition: { vi: 'Ta hãy xin cho được hãm mình chịu khó bằng lòng.', en: 'That we may obtain the virtue of purity and mortification.' },
        fruitShort: { vi: 'Hãm Mình', en: 'Mortification' },
        imageKey: 'scourging',
        meditation: {
          en: 'For our sake He is bound and torn, His body given over so that ours might be made whole. There is nothing glamorous about this suffering, only love that refuses to hold anything back. We ask for the grace to discipline our own desires, offering small mortifications in union with His great one.',
          vi: 'Vì ta, Người bị trói buộc và đánh đòn tan nát thân mình, để thân xác ta được nên lành mạnh. Trong nỗi khổ đau ấy không có gì huy hoàng, chỉ có một tình yêu không giữ lại điều gì cho riêng mình. Chúng ta xin ơn biết hãm dẹp những đam mê của bản thân, dâng những hy sinh nhỏ bé kết hợp với hy sinh lớn lao của Người.',
        },
      },
      {
        order: 3,
        title: { vi: 'Đức Chúa Giêsu chịu đội mão gai', en: 'The Crowning with Thorns' },
        petition: { vi: 'Ta hãy xin cho được chịu mọi sự sỉ nhục bằng lòng.', en: 'That we may bear humiliation with patience.' },
        fruitShort: { vi: 'Hiền Lành', en: 'Meekness' },
        imageKey: 'crowning',
        meditation: {
          en: 'The soldiers mock Him as a false king, pressing thorns into His head and bowing in cruel jest, and He says nothing in His own defense. His silence in the face of humiliation is its own kind of strength. We ask for the courage to bear insult and mockery for His sake without losing our peace.',
          vi: 'Quân lính nhạo báng Người như một vị vua giả hiệu, ấn mão gai vào đầu Người rồi cúi lạy cách nhạo cợt, mà Người không nói một lời để tự biện hộ. Sự thinh lặng của Người trước cảnh sỉ nhục ấy chính là một sức mạnh riêng. Chúng ta xin ơn can đảm chịu đựng lời sỉ nhục và chê cười vì Người mà không đánh mất sự bình an trong lòng.',
        },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Giêsu vác Thánh giá', en: 'The Carrying of the Cross' },
        petition: { vi: 'Ta hãy xin cho được vác Thánh giá theo chân Chúa.', en: 'That we may carry our own cross in Christ’s footsteps.' },
        fruitShort: { vi: 'Can Đảm', en: 'Fortitude' },
        imageKey: 'carrying',
        meditation: {
          en: 'The cross is heavier than He can carry alone, and Simon of Cyrene is pressed into helping Him bear it. Christ does not refuse the help, nor does He put the cross down. We ask for the patience to keep walking under the weight we are given, and the humility to let others help us carry it.',
          vi: 'Thập giá nặng hơn sức Người có thể vác một mình, và ông Simon thành Xyrênê bị bắt buộc giúp Người vác đỡ. Chúa Kitô không từ chối sự giúp đỡ ấy, cũng không đặt thập giá xuống. Chúng ta xin ơn kiên nhẫn tiếp tục bước đi dưới gánh nặng được trao cho mình, và lòng khiêm nhường để người khác giúp ta vác nó.',
        },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Giêsu chịu chết trên cây Thánh giá', en: 'The Crucifixion' },
        petition: { vi: 'Ta hãy xin đóng đanh tính xác thịt vào Thánh giá Chúa.', en: 'That we may die to sin and cling to Christ’s cross.' },
        fruitShort: { vi: 'Hy Sinh', en: 'Sacrifice' },
        imageKey: 'crucifixion',
        meditation: {
          en: "From the cross, with His last breath, Jesus forgives His executioners, promises paradise to the thief beside Him, and gives us His own Mother. Even in death He is pouring Himself out for us. We ask for the grace to persevere in faith to the very end, trusting that this death has opened heaven for us.",
          vi: 'Trên thập giá, với hơi thở cuối cùng, Chúa Giêsu tha thứ cho những kẻ đóng đinh mình, hứa ban Thiên Đàng cho người trộm lành bên cạnh, và trao ban chính Mẹ Người cho ta. Ngay cả trong cái chết, Người vẫn không ngừng trao hiến chính mình cho ta. Chúng ta xin ơn bền đỗ trong đức tin cho đến cùng, tin tưởng rằng cái chết này đã mở cửa Thiên Đàng cho ta.',
        },
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
        fruitShort: { vi: 'Đức Tin', en: 'The Virtue of Faith' },
        imageKey: 'resurrection',
        meditation: {
          en: "On the third day the tomb is found empty, and death itself is undone. What looked like the final defeat becomes the first proof that God's love cannot be buried. We ask for a living faith in the Resurrection, one that changes how we face every small death and disappointment in our own lives.",
          vi: 'Ngày thứ ba, ngôi mộ được thấy trống rỗng, và sự chết đã bị đánh bại. Điều tưởng như thất bại cuối cùng lại trở nên bằng chứng đầu tiên rằng tình yêu Thiên Chúa không thể bị chôn vùi. Chúng ta xin được đức tin sống động vào sự Phục Sinh, một đức tin biến đổi cách ta đối diện với mọi cái chết nhỏ bé và những thất vọng trong đời mình.',
        },
      },
      {
        order: 2,
        title: { vi: 'Đức Chúa Giêsu lên trời', en: 'The Ascension' },
        petition: { vi: 'Ta hãy xin cho được ái mộ những sự trên trời.', en: 'That we may obtain hope and desire for Heaven.' },
        fruitShort: { vi: 'Đức Cậy', en: 'The Virtue of Hope' },
        imageKey: 'ascension',
        meditation: {
          en: 'Jesus is taken up before their eyes, not abandoning His disciples but going ahead to prepare a place for them. Our true home is no longer only this earth, but where He has gone. We ask for a heart that longs for heaven, without ever loving the world or its people any less.',
          vi: 'Chúa Giêsu được cất lên trước mắt các môn đệ, không phải để bỏ rơi các ông, nhưng để đi trước dọn chỗ cho các ông. Quê hương thật của ta không còn chỉ là trần gian này, mà là nơi Người đã đến. Chúng ta xin được tấm lòng khao khát Thiên Đàng, mà vẫn không bớt yêu mến thế gian và những người sống trong đó.',
        },
      },
      {
        order: 3,
        title: { vi: 'Đức Chúa Thánh Thần hiện xuống', en: 'The Descent of the Holy Spirit' },
        petition: { vi: 'Ta hãy xin cho được lòng đầy rẫy mọi ơn Đức Chúa Thánh Thần.', en: 'That we may be filled with the gifts of the Holy Spirit.' },
        fruitShort: { vi: 'Đức Mến', en: 'The Virtue of Charity' },
        imageKey: 'pentecost',
        meditation: {
          en: 'Fear kept the apostles hidden behind locked doors until the Spirit came upon them like fire, and they went out boldly to proclaim Christ to every nation. The same Spirit who transformed them dwells in us at our own confirmation. We ask to be filled with His gifts, and sent out just as fearlessly.',
          vi: 'Nỗi sợ hãi đã giữ các tông đồ ẩn mình sau cánh cửa đóng kín, cho đến khi Thánh Thần ngự xuống trên các ngài như lửa, và các ngài đã ra đi rao giảng Chúa Kitô cách can đảm cho muôn dân. Chính Thánh Thần đã biến đổi các ngài cũng đang ngự trong ta từ ngày ta chịu phép Thêm Sức. Chúng ta xin được tràn đầy các ơn của Người, và được sai đi cách can đảm như thế.',
        },
      },
      {
        order: 4,
        title: { vi: 'Đức Chúa Trời cho Đức Bà lên trời', en: 'The Assumption of Mary' },
        petition: { vi: 'Ta hãy xin ơn chết lành trong tay Đức Mẹ.', en: 'That we may obtain the grace of a happy death.' },
        fruitShort: { vi: 'Ơn Chết Lành', en: 'Grace of a Holy Death' },
        imageKey: 'assumption',
        meditation: {
          en: "Mary, who was never touched by sin, is taken body and soul into heaven, the first fruits of what awaits all who belong to Christ. Her Assumption is a sign of hope for our own death, that it is not an ending but a homecoming. We ask, through her intercession, for the grace of a peaceful and holy death.",
          vi: 'Đức Mẹ, người chưa từng vướng mắc tội lỗi, được đưa cả hồn lẫn xác lên trời, là hoa quả đầu mùa của những gì đang chờ đợi tất cả những ai thuộc về Chúa Kitô. Việc Mẹ được đưa lên trời là dấu chỉ hy vọng cho cái chết của chính ta, rằng đó không phải là sự kết thúc mà là ngày trở về nhà. Nhờ lời Mẹ chuyển cầu, chúng ta xin ơn được chết lành và bình an.',
        },
      },
      {
        order: 5,
        title: { vi: 'Đức Chúa Trời thưởng Đức Mẹ trên trời', en: 'The Coronation of Mary' },
        petition: {
          vi: 'Ta hãy xin Đức Mẹ phù hộ cho ta được thưởng cùng Đức Mẹ trên nước thiên đàng.',
          en: 'That we may share with Mary the reward of Heaven.',
        },
        fruitShort: { vi: 'Tin Tưởng Vào Lời Mẹ Chuyển Cầu', en: "Confidence in Mary's Intercession" },
        imageKey: 'coronation',
        meditation: {
          en: 'Crowned Queen of Heaven and earth, Mary does not sit apart from us in glory but continues to be our mother, close to every one of her children. Her queenship is one of tender care, not distance. We ask for confidence in her intercession, trusting that she brings every one of our prayers before her Son.',
          vi: 'Được tôn phong làm Nữ Vương trời đất, Đức Mẹ không ngồi xa cách ta trong vinh quang, nhưng vẫn tiếp tục là Mẹ của ta, gần gũi với từng người con của Mẹ. Ngôi vị Nữ Vương của Mẹ là một sự chăm sóc dịu dàng, không phải xa cách. Chúng ta xin được lòng tin tưởng nơi lời Mẹ chuyển cầu, tin rằng Mẹ đem mọi lời cầu nguyện của ta đến trước Con Mẹ.',
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
