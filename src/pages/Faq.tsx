import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Sparkles, ChevronDown, Mail, MessageCircle } from 'lucide-react'

const faqs = [
  {
    category: 'Về thiệp cưới online',
    items: [
      { q: 'Thiệp cưới online là gì?', a: 'Thiệp cưới online là thiệp mời dưới dạng website, có thể gửi qua Zalo, Facebook, Email,... giúp bạn tiết kiệm chi phí in ấn và dễ dàng cập nhật thông tin.' },
      { q: 'Tôi có cần kiến thức lập trình để tạo thiệp không?', a: 'Không. Bạn chỉ cần điền thông tin, chọn mẫu yêu thích và hệ thống sẽ tự động tạo ra website cưới hoàn chỉnh. Mọi thao tác đều trực quan, dễ sử dụng.' },
      { q: 'Thiệp cưới online có thể xem được trên điện thoại không?', a: 'Có. Tất cả mẫu thiệp của chúng tôi đều được thiết kế tương thích với mọi thiết bị: điện thoại, máy tính bảng, laptop và máy tính để bàn.' },
      { q: 'Tôi có thể tạo thiệp cưới online miễn phí không?', a: 'Có. Bạn có thể tạo thiệp cưới online hoàn toàn miễn phí với gói Free, bao gồm đầy đủ các tính năng cơ bản và thời hạn sử dụng 6 tháng.' },
    ]
  },
  {
    category: 'Tính năng & Tuỳ chỉnh',
    items: [
      { q: 'Tôi có thể đổi mẫu thiệp sau khi đã tạo không?', a: 'Có. Với gói Cơ bản và Cao cấp, bạn có thể đổi sang bất kỳ mẫu thiệp nào trong kho giao diện bất cứ lúc nào mà không mất dữ liệu đã nhập.' },
      { q: 'Có thể thêm nhạc nền vào thiệp cưới không?', a: 'Có. Tất cả các gói đều hỗ trợ nhạc nền. Bạn có thể chọn nhạc có sẵn hoặc tải lên bài hát yêu thích của riêng mình.' },
      { q: 'Thiệp có hỗ trợ tiếng Anh hoặc tiếng Hàn không?', a: 'Gói Cao cấp hỗ trợ đa ngôn ngữ (Việt Nam, English, 한국어), giúp khách mời quốc tế dễ dàng theo dõi thông tin đám cưới của bạn.' },
      { q: 'Tôi có thể sử dụng tên miền riêng cho website cưới không?', a: 'Có. Gói Cao cấp cho phép bạn sử dụng tên miền riêng (ví dụ: cuoi.example.com) để website cưới thêm chuyên nghiệp và cá nhân hoá.' },
    ]
  },
  {
    category: 'Quản lý khách mời & RSVP',
    items: [
      { q: 'Khách mời xác nhận tham dự bằng cách nào?', a: 'Khách mời chỉ cần click vào link thiệp cưới, kéo xuống mục RSVP và điền thông tin. Bạn sẽ nhận được thông báo khi có người xác nhận.' },
      { q: 'Tôi có thể xem danh sách khách mời đã xác nhận không?', a: 'Có. Với gói Cao cấp, bạn có thể quản lý danh sách khách mời, theo dõi ai đã xác nhận tham dự và ai chưa.' },
      { q: 'Khách mời có thể gửi lời chúc không?', a: 'Có. Tất cả khách mời đều có thể gửi lời chúc đến cô dâu chú rể ngay trên website cưới.' },
    ]
  },
  {
    category: 'Thanh toán & Hoá đơn',
    items: [
      { q: 'Tôi có thể thanh toán bằng những phương thức nào?', a: 'Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, Momo, ZaloPay và tiền mặt (tại Đà Nẵng).' },
      { q: 'Thời hạn sử dụng là bao lâu?', a: 'Gói Free: 6 tháng. Gói Cơ bản: 2 năm. Gói Cao cấp: vĩnh viễn (một lần thanh toán).' },
      { q: 'Tôi có thể gia hạn khi hết thời hạn không?', a: 'Có. Bạn có thể gia hạn thêm với chi phí thấp hơn so với tạo mới. Dữ liệu của bạn sẽ được giữ nguyên.' },
    ]
  },
  {
    category: 'Hỗ trợ',
    items: [
      { q: 'Tôi cần hỗ trợ, liên hệ ở đâu?', a: 'Bạn có thể liên hệ qua Email: info@thiepcuoi.com, Facebook Messenger, Zalo hoặc gọi hotline 0906.521.623 (8:00-22:00 hàng ngày).' },
      { q: 'Có hướng dẫn chi tiết về cách tạo thiệp không?', a: 'Có. Chúng tôi có bài hướng dẫn chi tiết từng bước kèm hình ảnh minh hoạ giúp bạn dễ dàng tạo thiệp cưới online.' },
    ]
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-serif font-bold text-lg text-gray-900">Thiệp Cưới</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Trang chủ</Link>
            <Link to="/sites" className="text-gray-600 hover:text-gray-900 font-medium">Cặp đôi đã tạo</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Bảng giá</Link>
            <Link to="/faq" className="text-gray-900 font-semibold">FAQ</Link>
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
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                Câu hỏi thường gặp
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Những thắc mắc phổ biến về thiệp cưới online
              </p>
            </div>

            <div className="space-y-10">
              {faqs.map(cat => (
                <div key={cat.category}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">{cat.category}</h2>
                  <div className="space-y-1.5">
                    {cat.items.map((item, idx) => {
                      const globalIdx = faqs.flatMap(c => c.items).indexOf(item)
                      const isOpen = openIndex === globalIdx
                      return (
                        <div key={idx}
                          className={`rounded-2xl border transition-all ${isOpen ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                          >
                            <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                            <p className="px-6 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Chưa tìm thấy câu trả lời?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Đừng ngần ngại liên hệ với chúng tôi, đội ngũ hỗ trợ luôn sẵn sàng giúp bạn</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="mailto:info@thiepcuoi.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-semibold transition-all">
                  <Mail className="w-4 h-4" /> Gửi Email
                </a>
                <a href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full text-sm font-semibold transition-all">
                  <MessageCircle className="w-4 h-4" /> Chat Messenger
                </a>
              </div>
            </div>
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
              <Link to="/pricing" className="hover:text-gray-600">Bảng giá</Link>
              <Link to="/faq" className="hover:text-gray-600">FAQ</Link>
              <Link to="/create" className="hover:text-gray-600">Tạo thiệp</Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">&copy; 2026 Thiệp Cưới Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
