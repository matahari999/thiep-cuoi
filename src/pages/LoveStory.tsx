import { Link } from 'react-router-dom'
import { Heart, Sparkles, ChevronLeft, Clock, Eye, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const stories = [
  {
    id: 'nolan-jenny',
    couple: 'Xuân Nam & Kim Thơ',
    title: 'Từ những con số đến trái tim',
    excerpt: 'Họ gặp nhau trong một lần họp nhóm dự án, và từ đó những dòng code đã trở thành những dòng thư tình.',
    date: '08/08/2026',
    photoIdx: 1,
    views: 2847,
    messages: 86,
    milestones: [
      { date: 'Tháng 3/2020', title: 'Lần đầu gặp mặt', desc: 'Cùng tham gia dự án thiện nguyện, tình cờ được ghép cặp làm việc chung nhóm.' },
      { date: 'Tháng 6/2020', title: 'Buổi hẹn đầu tiên', desc: 'Sau 3 tháng làm việc cùng nhau, anh rủ em đi cà phê và câu chuyện kéo dài đến tận tối muộn.' },
      { date: 'Tháng 12/2021', title: 'Kỷ niệm ngọt ngào', desc: 'Chuyến du lịch Đà Lạt đầu tiên, nơi hai đứa chính thức gọi nhau là người yêu giữa rừng thông.' },
      { date: 'Tháng 2/2024', title: 'Lời cầu hôn', desc: 'Trên bãi biển Phú Quốc lúc hoàng hôn, anh quỳ gối với chiếc nhẫn giấu trong vỏ sò.' },
      { date: '08/08/2026', title: 'Đám cưới', desc: 'Ngày trọng đại — hành trình mới bắt đầu!' },
    ],
  },
  {
    id: 'hoang-duong-giang',
    couple: 'Hoàng Dương & Trần Giang',
    title: 'Bản tình ca giữa lòng Hà Nội',
    excerpt: 'Từ những vòng xe đạp quanh Hồ Gươm, tình yêu của họ lớn dần theo từng nhịp sống thủ đô.',
    date: '13/06/2026',
    photoIdx: 2,
    views: 1923,
    messages: 54,
    milestones: [
      { date: 'Tháng 9/2019', title: 'Gặp nhau ở thư viện', desc: 'Cùng mượn một cuốn sách, vô tình chạm tay và biết nhau từ đó.' },
      { date: 'Tháng 12/2019', title: 'Chiều xe đạp quanh Hồ Gươm', desc: 'Anh chở em trên chiếc xe đạp cũ, lòng vòng quanh hồ và hát cho em nghe.' },
      { date: 'Tháng 3/2021', title: 'Tỏ tình bên Hồ Tây', desc: 'Buổi chiều hoàng hôn tím ngắt, anh ngỏ lời và em gật đầu.' },
      { date: 'Tháng 11/2023', title: 'Cầu hôn tại nhà hát lớn', desc: 'Nơi kỷ niệm 4 năm yêu nhau, anh đã chuẩn bị một màn cầu hôn bất ngờ.' },
    ],
  },
  {
    id: 'phuc-khai-kha-tu',
    couple: 'Phúc Khải & Khả Tú',
    title: 'Tình yêu xuyên biên giới',
    excerpt: 'Anh từ Sài Gòn, em từ Seoul — hai con người xa lạ gặp nhau giữa trời Âu và tìm thấy một nửa của mình.',
    date: '20/06/2026',
    photoIdx: 4,
    views: 3561,
    messages: 112,
    milestones: [
      { date: 'Tháng 8/2019', title: 'Gặp nhau ở sân bay', desc: 'Cùng chuyến bay từ Paris về, em lạc đường và anh đã dẫn em ra cửa.' },
      { date: 'Tháng 10/2019', title: 'Hẹn hò online', desc: 'Xa cách hai châu lục, nhưng những cuộc gọi video mỗi đêm là sợi dây kết nối.' },
      { date: 'Tháng 7/2021', title: 'Đoàn tụ tại Seoul', desc: 'Sau gần 2 năm yêu xa, anh quyết định sang Hàn Quốc làm việc để được gần em.' },
      { date: 'Tháng 3/2024', title: 'Cầu hôn tại Namsan', desc: 'Trên tháp Namsan, nơi có những ổ khoá tình yêu, anh quỳ gối và trao em chiếc nhẫn.' },
    ],
  },
  {
    id: 'van-tai-truc-linh',
    couple: 'Văn Tài & Trúc Linh',
    title: 'Chuyện tình đồng quê',
    excerpt: 'Lớn lên cùng xóm, cùng mái trường — tình yêu của họ giản dị như chính mảnh đất quê hương.',
    date: '26/07/2026',
    photoIdx: 3,
    views: 1562,
    messages: 43,
    milestones: [
      { date: '2012', title: 'Bạn học cùng lớp', desc: 'Ngồi cùng bàn suốt 3 năm cấp 3, nhưng chưa bao giờ dám nói một lời.' },
      { date: '2017', title: 'Gặp lại sau đại học', desc: 'Tình cờ gặp nhau ở quê nhà sau ngày tốt nghiệp, cảm xúc năm xưa ùa về.' },
      { date: 'Tháng 6/2018', title: 'Ngày yêu nhau', desc: 'Sau 1 năm tìm hiểu lại từ đầu, anh chính thức ngỏ lời.' },
      { date: 'Tháng 2/2024', title: 'Về chung nhà', desc: 'Hai gia đình gặp mặt, đồng ý cho đám cưới.' },
    ],
  },
]

export default function LoveStory() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-serif font-bold text-lg text-gray-900">Thiệp Cưới</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Trang chủ</Link>
            <Link to="/sites" className="text-gray-600 hover:text-gray-900 font-medium">Cặp đôi đã tạo</Link>
            <Link to="/love-story" className="text-gray-900 font-semibold">Chuyện tình yêu</Link>
            <Link to="/create" className="text-gray-600 hover:text-gray-900 font-medium">Tạo thiệp</Link>
          </nav>
          <Link to="/create"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Tạo miễn phí
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                Chuyện tình yêu
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Những câu chuyện tình yêu đẹp từ cộng đồng Thiệp Cưới Online
              </p>
            </div>

            <div className="space-y-24">
              {stories.map((story, si) => {
                const isOpen = expanded === story.id
                return (
                  <article key={story.id} className={`relative ${si % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    {si > 0 && <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gray-200 hidden md:block" />}
                    <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${si % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                      <div className={si % 2 === 1 ? 'md:col-start-2' : ''}>
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100">
                          <img src={`/photos/gallery-${story.photoIdx}.jpg`} alt={story.couple}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Clock className="w-3 h-3" /> {story.date}
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <Eye className="w-3 h-3" /> {story.views.toLocaleString('vi-VN')}
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <MessageCircle className="w-3 h-3" /> {story.messages}
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">{story.title}</h2>
                        <p className="text-gray-500 text-sm mb-4">{story.excerpt}</p>
                        <p className="text-gray-400 text-xs mb-5 italic flex items-center gap-1.5">
                          <Heart className="w-3 h-3 text-red-300" /> {story.couple}
                        </p>
                        <button onClick={() => setExpanded(isOpen ? null : story.id)}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all">
                          {isOpen ? 'Thu gọn' : 'Xem hành trình'} <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
                        </button>

                        {isOpen && (
                          <div className="mt-8">
                            <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
                              {story.milestones.map((m, mi) => (
                                <div key={mi} className="relative">
                                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                                  </div>
                                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{m.date}</p>
                                  <p className="font-bold text-gray-900 text-sm mt-0.5">{m.title}</p>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Kể câu chuyện của bạn</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Mỗi câu chuyện tình yêu đều đáng được lưu giữ. Hãy chia sẻ câu chuyện của bạn với thế giới.</p>
            <Link to="/create"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-semibold transition-all">
              <Sparkles className="w-4 h-4" /> Tạo thiệp cưới của bạn
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="font-semibold text-gray-800">Thiệp Cưới Online</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <Link to="/" className="hover:text-gray-600">Trang chủ</Link>
              <Link to="/sites" className="hover:text-gray-600">Cặp đôi đã tạo</Link>
              <Link to="/love-story" className="hover:text-gray-600">Chuyện tình yêu</Link>
              <Link to="/create" className="hover:text-gray-600">Tạo thiệp</Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">&copy; 2026 Thiệp Cưới Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
