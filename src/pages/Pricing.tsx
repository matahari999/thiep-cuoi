import { Link } from 'react-router-dom'
import { Heart, Check, X, Sparkles, ArrowRight, HelpCircle } from 'lucide-react'

const tiers = [
  { id: 'free', name: 'FREE', price: '0đ', period: '6 tháng', badge: 'FREE', badgeCls: 'bg-gray-200 text-gray-700', cta: 'Tạo miễn phí', ctaCls: 'bg-gray-900 hover:bg-gray-800 text-white', popular: false },
  { id: 'basic', name: 'Cơ bản', price: '199,000đ', period: '2 năm', badge: 'BASIC', badgeCls: 'bg-blue-100 text-blue-700', cta: 'Dùng thử', ctaCls: 'bg-gray-900 hover:bg-gray-800 text-white', popular: true },
  { id: 'premium', name: 'Cao cấp', price: '499,000đ', period: 'Vĩnh viễn', badge: 'PREMIUM', badgeCls: 'bg-amber-100 text-amber-700', cta: 'Liên hệ', ctaCls: 'bg-gray-900 hover:bg-gray-800 text-white', popular: false },
]

const featureRows = [
  { label: 'Thời hạn website', free: '6 tháng', basic: '2 năm', premium: 'Vĩnh viễn' },
  { label: 'Album ảnh cưới', free: '10 ảnh', basic: '50 ảnh', premium: 'Không giới hạn' },
  { label: 'Mẫu thiệp', free: '5 mẫu', basic: 'Tất cả (21+)', premium: 'Tất cả (21+)' },
  { label: 'Nhạc nền', free: true, basic: true, premium: true },
  { label: 'RSVP xác nhận tham dự', free: true, basic: true, premium: true },
  { label: 'Chia sẻ Zalo / Facebook', free: true, basic: true, premium: true },
  { label: 'Lời chúc từ bạn bè', free: false, basic: true, premium: true },
  { label: 'QR tiền mừng', free: false, basic: true, premium: true },
  { label: 'Thông tin phụ mẫu', free: false, basic: true, premium: true },
  { label: 'Loại bỏ logo', free: false, basic: true, premium: true },
  { label: 'Đổi giao diện', free: false, basic: true, premium: true },
  { label: 'Đếm lượt truy cập', free: false, basic: true, premium: true },
  { label: 'Quản lý khách mời', free: false, basic: false, premium: true },
  { label: 'Đa ngôn ngữ', free: false, basic: false, premium: true },
  { label: 'Tên miền riêng', free: false, basic: false, premium: true },
  { label: 'Tuỳ chỉnh mã nguồn', free: false, basic: false, premium: true },
  { label: 'Hỗ trợ ưu tiên', free: false, basic: false, premium: true },
]

function CheckIcon() { return <Check className="w-4 h-4 text-emerald-500 shrink-0" /> }
function XIcon() { return <X className="w-4 h-4 text-gray-300 shrink-0" /> }

export default function Pricing() {

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
            <Link to="/pricing" className="text-gray-900 font-semibold">Bảng giá</Link>
            <Link to="/faq" className="text-gray-600 hover:text-gray-900 font-medium">FAQ</Link>
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
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                Bảng giá
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Chọn gói phù hợp để tạo thiệp cưới online đẹp và chuyên nghiệp
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {tiers.map(tier => (
                <div key={tier.id}
                  className={`relative rounded-3xl border-2 p-8 flex flex-col ${tier.popular ? 'border-gray-900 shadow-xl scale-105 bg-gray-50' : 'border-gray-100 bg-white'}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full tracking-wider uppercase">Phổ biến nhất</span>
                    </div>
                  )}
                  <div className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold ${tier.badgeCls}`}>
                    {tier.badge}
                  </div>
                  <div className="mt-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      {tier.id !== 'premium' && <span className="text-gray-400 text-sm">/{tier.period.toLowerCase()}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {featureRows.slice(0, 7).map(f => {
                      const val = f[tier.id as keyof typeof f]
                      return (
                        <li key={f.label} className="flex items-start gap-2.5 text-sm">
                          {typeof val === 'boolean' ? val ? <CheckIcon /> : <XIcon /> : <span className="text-emerald-600 font-medium shrink-0">{val as string}</span>}
                          <span className={typeof val === 'boolean' && !val ? 'text-gray-400' : 'text-gray-700'}>{f.label}</span>
                        </li>
                      )
                    })}
                  </ul>
                  <Link to={tier.id === 'free' ? '/create' : '/dat-hang'}
                    className={`w-full py-3 rounded-2xl text-sm font-semibold text-center inline-flex items-center justify-center gap-2 ${tier.ctaCls} transition-all`}>
                    {tier.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="max-w-5xl mx-auto">
              <h3 className="text-center font-serif text-2xl font-bold text-gray-900 mb-8">So sánh chi tiết</h3>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Tính năng</th>
                      {tiers.map(t => (
                        <th key={t.id} className="text-center py-4 px-4 font-semibold text-gray-900 min-w-[100px]">
                          {t.badge}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featureRows.map((f, i) => (
                      <tr key={f.label} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3.5 px-6 text-gray-700">{f.label}</td>
                        {(['free', 'basic', 'premium'] as const).map(tierId => {
                          const val = f[tierId]
                          return (
                            <td key={tierId} className="text-center py-3.5 px-4">
                              {typeof val === 'boolean' ? val ? <CheckIcon /> : <XIcon /> : <span className="text-gray-900 font-medium">{val as string}</span>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Có câu hỏi?</h2>
            <p className="text-gray-400 mb-8">Liên hệ với chúng tôi để được tư vấn gói dịch vụ phù hợp nhất</p>
            <a href="mailto:info@thiepcuoi.com"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-semibold transition-all">
              <HelpCircle className="w-4 h-4" /> Liên hệ tư vấn
            </a>
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
