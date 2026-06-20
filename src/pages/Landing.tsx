import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Camera, Menu, X, Upload, Smartphone, Share2 } from 'lucide-react';
import { useState } from 'react';
import { templateCategories, allTemplates } from '../lib/templates';
import { photoSettings, getAnimation } from '../lib/animations';

const features = [
  { icon: <Camera className="w-5 h-5" />, title: 'Tự tạo', desc: 'Chỉ cần tải ảnh lên là tự động hoàn thành' },
  { icon: <Smartphone className="w-5 h-5" />, title: 'Tối ưu mobile', desc: 'Hiển thị hoàn hảo trên mọi thiết bị' },
  { icon: <Share2 className="w-5 h-5" />, title: 'Chia sẻ dễ dàng', desc: 'Gửi ngay qua Zalo, Facebook' },
  { icon: <Upload className="w-5 h-5" />, title: 'Hỗ trợ in ấn', desc: 'In trực tiếp dưới dạng thiệp A5' },
]

const catPhotos = [
  '/photos/gallery-1.jpg',
  '/photos/gallery-2.jpg',
  '/photos/gallery-3.jpg',
  '/photos/gallery-4.jpg',
  '/photos/gallery-5.jpg',
  '/photos/gallery-6.jpg',
  '/photos/gallery-7.jpg',
  '/photos/gallery-8.jpg',
]

const categories = templateCategories.map((c, i) => ({
  id: c.id, name: c.name, count: c.templates.length,
  photo: catPhotos[i % catPhotos.length],
  icon: c.icon, desc: c.desc,
}))

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-serif font-bold text-lg text-gray-900 tracking-tight">Thiệp Cưới</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Trang chủ</Link>
            <a href="#categories" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Bộ sưu tập</a>
            <Link to="/create" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Tạo thiệp</Link>
            <Link to="/dat-hang" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Đặt hàng</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Tạo miễn phí
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="flex flex-col items-center gap-6 py-12">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-gray-800">Trang chủ</Link>
            <a href="#categories" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-gray-800">Bộ sưu tập</a>
            <Link to="/create" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-gray-800">Tạo thiệp</Link>
            <Link to="/dat-hang" onClick={() => setMenuOpen(false)}
              className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold">Đặt hàng</Link>
          </nav>
        </div>
      )}

      <main>
        {/* ===== HERO: Premium full-screen with Framer Motion ===== */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <img src="/photos/gallery-20.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative text-center px-6 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/70 font-medium mb-8 tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Thiệp cưới mobile cao cấp — 26 mẫu độc quyền
            </motion.div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="block"
              >Câu chuyện tình yêu của bạn</motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="block bg-gradient-to-r from-white/90 via-amber-200 to-white/90 bg-clip-text text-transparent"
              >
                được kể đẹp nhất
              </motion.span>
            </h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light"
            >
              Tạo thiệp cưới mobile của riêng bạn trong vài phút.
              Tải ảnh, nhập thông tin, chia sẻ ngay — không cần biết thiết kế.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/create"
                className="group px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 shadow-xl hover:bg-amber-50">
                <Sparkles className="w-4 h-4" /> Tạo thiệp ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#categories"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-2xl font-semibold text-sm transition-all inline-flex items-center justify-center">
                Xem mẫu thiệp
              </a>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span className="text-[10px] font-medium tracking-widest uppercase">Cuộn</span>
            <div className="w-4 h-7 border border-white/40 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-1.5 bg-white/50 rounded-full animate-scroll-dot" />
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-gray-600">{f.icon}</div>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING / CREATE SECTION ===== */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold tracking-wider mb-6">NEW</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                  Miễn phí & Cao cấp
                  <br />
                  <span className="text-gray-400">Thiệp cưới</span>
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Tự tải ảnh và tạo miễn phí nhanh chóng, hoặc đặt thiệp cao cấp
                  do nhà thiết kế thực hiện. Mọi mẫu đều tối ưu cho mobile.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/create"
                    className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all text-center">
                    Miễn phí — Tải & Tạo
                  </Link>
                  <Link to="/dat-hang"
                    className="px-6 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition-all text-center">
                    Cao cấp — từ 299K₫
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['/photos/gallery-9.jpg', '/photos/gallery-10.jpg', '/photos/gallery-11.jpg', '/photos/gallery-12.jpg'].map((src, i) => (
                  <div key={i} className={`aspect-[3/4] rounded-3xl overflow-hidden ${i % 2 === 1 ? 'mt-8' : ''} shadow-md`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES (Collection) ===== */}
        <section id="categories" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Bộ sưu tập</h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">8 phong cách, 21 mẫu độc quyền — Tìm phong cách của bạn</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(cat => {
                return (
                  <a key={cat.id} href={`#cat-${cat.id}`}
                    className="group relative block rounded-3xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-1 duration-300">
                    <div className="h-48 flex items-center justify-center relative overflow-hidden">
                      <img src={cat.photo} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
                      <span className="text-5xl relative drop-shadow-lg">{cat.icon}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{cat.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">{cat.count} mẫu</span>
                      </div>
                      <p className="text-xs text-gray-400">{cat.desc}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== FULL GALLERY ===== */}
        <section id="all-templates" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Tất cả mẫu thiệp</h2>
            <p className="text-gray-400">Khám phá toàn bộ thiết kế</p>
            </div>

            {templateCategories.map(cat => (
              <div key={cat.id} id={`cat-${cat.id}`} className="mb-16 scroll-mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-400">{cat.desc}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {cat.templates.map((t, ti) => {
                    const galleryIdx = ((ti + cat.templates.length * templateCategories.indexOf(cat) + 18) % 25) + 1
                    return (
                    <div key={t.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all hover:-translate-y-0.5 duration-300">
                      <Link to={`/${t.id}`}>
                        <div className={`h-48 relative overflow-hidden`}>
                          <img src={`/photos/gallery-${galleryIdx}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className={`absolute inset-0 ${t.cardBg} opacity-60`} />
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="relative h-full flex items-center justify-center text-center">
                            <span className={`text-5xl drop-shadow-lg ${t.fontColor}`}>{t.icon}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                            <p className={`text-xs font-semibold ${t.accent}`}>Xem trước →</p>
                          </div>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{cat.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{t.nameEn}</p>
                        <Link to={`/${t.id}`}
                          className="mt-3 inline-flex items-center gap-1 text-gray-900 text-xs font-semibold hover:gap-2 transition-all">
                          Xem demo <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ANIMATED PHOTO GALLERY ===== */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Thư viện ảnh</h2>
            <p className="text-gray-400">Mỗi bức ảnh với hiệu ứng chuyển động độc đáo</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {photoSettings.map(p => {
                const anim = getAnimation(p.animation)
                return (
                  <motion.div key={p.id}
                    initial={anim.initial}
                    whileInView={anim.whileInView}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7, delay: p.delay }}
                    className="relative group rounded-2xl overflow-hidden shadow-md bg-gray-100"
                  >
                    <img src={`/photos/${p.id}`} alt="" className="w-full aspect-[3/4] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: p.delay + 0.3 }}
                      className="absolute bottom-0 left-0 right-0 p-5"
                    >
                      <p className="text-white font-serif text-lg md:text-xl italic drop-shadow-lg">{p.text}</p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== QUICK DEMOS ===== */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Mẫu nổi bật</h2>
            <p className="text-gray-400">Xem trước những mẫu được yêu thích nhất</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {allTemplates.slice(0, 6).map((t, i) => (
                <Link key={t.id} to={`/${t.id}`}
                  className="group relative h-48 rounded-2xl overflow-hidden">
                  <img src={`/photos/gallery-${13 + i}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute inset-0 ${t.cardBg} opacity-60`} />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <span className="text-2xl mb-1">{t.icon}</span>
                    <span className="font-bold text-white text-lg">{t.name}</span>
                    <span className="text-xs text-white/60">{t.nameEn}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">Bắt đầu ngay hôm nay</h2>
            <p className="text-gray-400 mb-8 text-lg">Bắt đầu miễn phí — Hoàn thiện với gói cao cấp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create"
                className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-all shadow-xl inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Tạo miễn phí
              </Link>
              <Link to="/dat-hang"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2">
                Đặt thiệp cao cấp <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="font-semibold text-gray-800">Thiệp Cưới Online</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <Link to="/" className="hover:text-gray-600 transition-colors">Trang chủ</Link>
              <a href="#categories" className="hover:text-gray-600 transition-colors">Bộ sưu tập</a>
              <Link to="/create" className="hover:text-gray-600 transition-colors">Tạo thiệp</Link>
              <Link to="/dat-hang" className="hover:text-gray-600 transition-colors">Cao cấp</Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">&copy; 2026 Thiệp Cưới Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
