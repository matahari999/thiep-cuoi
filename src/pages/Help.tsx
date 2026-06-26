import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Sparkles, ChevronLeft, Search, MessageCircle, Mail, HelpCircle, FileText, CreditCard, Settings, Shield } from 'lucide-react'

const articles = [
  { cat: 'Bắt đầu', icon: FileText, items: [
    { q: 'Cách tạo thiệp cưới online', a: 'Chọn mẫu → Điền thông tin → Chia sẻ link. Chỉ 3 bước đơn giản, không cần kỹ năng lập trình.' },
    { q: 'Làm thế nào để đổi mẫu thiệp?', a: 'Vào trang quản lý, chọn "Đổi giao diện". Lưu ý: tính năng này chỉ có ở gói Cơ bản và Cao cấp.' },
    { q: 'Cách thêm nhạc nền', a: 'Trong trang chỉnh sửa, kéo xuống mục "Nhạc nền". Bạn có thể chọn nhạc có sẵn hoặc tải lên file MP3.' },
  ]},
  { cat: 'Thanh toán', icon: CreditCard, items: [
    { q: 'Các phương thức thanh toán', a: 'Chúng tôi chấp nhận: Chuyển khoản ngân hàng, Momo, ZaloPay, và tiền mặt (tại Đà Nẵng).' },
    { q: 'Có được hoàn tiền không?', a: 'Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày kể từ khi thanh toán nếu chưa sử dụng dịch vụ.' },
    { q: 'Làm sao để gia hạn?', a: 'Vào trang quản lý → Gói dịch vụ → Gia hạn. Dữ liệu của bạn sẽ được giữ nguyên.' },
  ]},
  { cat: 'Tài khoản', icon: Settings, items: [
    { q: 'Cách đăng ký tài khoản', a: 'Nhấn "Đăng nhập" → "Đăng ký" → Điền email và mật khẩu. Hoặc đăng ký qua Facebook/Google.' },
    { q: 'Quên mật khẩu', a: 'Nhấn "Quên mật khẩu" trên trang đăng nhập, nhập email và làm theo hướng dẫn.' },
  ]},
  { cat: 'Bảo mật', icon: Shield, items: [
    { q: 'Thông tin của tôi có an toàn không?', a: 'Tất cả dữ liệu đều được mã hoá và bảo vệ theo tiêu chuẩn bảo mật quốc tế.' },
    { q: 'Tôi có thể xoá tài khoản không?', a: 'Có. Vào Cài đặt tài khoản → Xoá tài khoản. Dữ liệu sẽ được xoá vĩnh viễn sau 30 ngày.' },
  ]},
]

export default function Help() {
  const [search, setSearch] = useState('')
  const [openIdx, setOpenIdx] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return articles
    const q = search.toLowerCase()
    return articles.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)),
    })).filter(cat => cat.items.length > 0)
  }, [search])

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-serif font-bold text-lg text-gray-900">Thiệp Cưới</span>
          </Link>
          <Link to="/create"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Tạo miễn phí
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Trang chủ
          </Link>

          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">Trung tâm trợ giúp</h1>
            <p className="text-gray-400">Tìm kiếm câu trả lời cho thắc mắc của bạn</p>
          </div>

          <div className="relative max-w-lg mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-gray-400 outline-none transition-colors" />
          </div>

          <div className="space-y-8">
            {filtered.map(cat => (
              <div key={cat.cat}>
                <div className="flex items-center gap-2 mb-4">
                  <cat.icon className="w-4 h-4 text-gray-400" />
                  <h2 className="font-bold text-sm text-gray-800">{cat.cat}</h2>
                </div>
                <div className="space-y-1.5">
                  {cat.items.map((item, i) => {
                    const idx = `${cat.cat}-${i}`
                    const isOpen = openIdx === idx
                    return (
                      <div key={idx}
                        className={`rounded-xl border transition-all ${isOpen ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <button onClick={() => setOpenIdx(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left">
                          <span className="text-sm font-medium text-gray-900">{item.q}</span>
                          <ChevronLeft className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
                        </button>
                        {isOpen && <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-gray-50 rounded-3xl p-8">
            <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Chưa tìm thấy câu trả lời?</h2>
            <p className="text-sm text-gray-400 mb-5">Liên hệ với chúng tôi qua các kênh hỗ trợ</p>
            <div className="flex justify-center gap-3">
              <a href="mailto:info@thiepcuoi.com"
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Email
              </a>
              <a href="#"
                className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> Messenger
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
