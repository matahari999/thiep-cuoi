import { Link } from 'react-router-dom'
import { Heart, Sparkles, ChevronLeft, Users, Gift, TrendingUp, Percent, Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function Affiliate() {
  const [copied, setCopied] = useState(false)
  const refLink = 'thiepcuoi.com/ref/welcome2026'

  const copyRef = () => {
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Trang chủ
            </Link>
            <div className="text-center mb-14">
              <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                Kiếm tiền với Thiệp Cưới Online
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Giới thiệu bạn bè và kiếm hoa hồng lên đến 20% mỗi đơn hàng
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: Users, label: 'Đại lý', desc: 'Hoa hồng 20%', detail: 'Dành cho cá nhân / tổ chức có lượng khách hàng lớn. Nhận hoa hồng 20% trên mỗi đơn hàng.', color: 'bg-gray-900' },
                { icon: TrendingUp, label: 'Cộng tác viên', desc: 'Hoa hồng 15%', detail: 'Dành cho blogger, KOL, KOC. Chia sẻ link giới thiệu và nhận hoa hồng 15%.', color: 'bg-blue-600' },
                { icon: Percent, label: 'Giới thiệu bạn bè', desc: 'Giảm 10%', detail: 'Bạn bè được giảm 10% đơn hàng đầu tiên, bạn nhận 5% hoa hồng.', color: 'bg-emerald-600' },
              ].map(p => (
                <div key={p.label} className="bg-gray-50 rounded-3xl p-6 text-center border border-gray-100">
                  <div className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{p.label}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-3">{p.desc}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 mb-16">
              <h2 className="font-bold text-lg text-gray-900 mb-2">Link giới thiệu của bạn</h2>
              <p className="text-sm text-gray-400 mb-4">Sao chép và chia sẻ link này để bắt đầu kiếm hoa hồng</p>
              <div className="flex gap-2">
                <input readOnly value={refLink}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-600 focus:border-gray-400 outline-none" />
                <button onClick={copyRef}
                  className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
                  {copied ? <><Check className="w-4 h-4" /> Đã sao chép</> : <><Copy className="w-4 h-4" /> Sao chép</>}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { step: '1', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản miễn phí và đăng ký chương trình đối tác.' },
                { step: '2', title: 'Chia sẻ link giới thiệu', desc: 'Chia sẻ link cá nhân lên Facebook, Zalo, TikTok, blog của bạn.' },
                { step: '3', title: 'Nhận hoa hồng', desc: 'Khi khách hàng đặt mua và thanh toán, hoa hồng sẽ tự động được ghi nhận.' },
                { step: '4', title: 'Rút tiền', desc: 'Rút tiền hoa hồng về tài khoản ngân hàng mỗi tháng một lần.' },
              ].map(s => (
                <div key={s.step} className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">{s.step}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 Thiệp Cưới Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
