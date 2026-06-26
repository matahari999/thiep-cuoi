import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { showcaseCouples } from '../lib/showcase'
import { getTemplateById } from '../lib/templates'
import { useSearchParams } from 'react-router-dom'
import { Heart, Search, Sparkles, ArrowRight, X } from 'lucide-react'

export default function Sites() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterTemplate = searchParams.get('template') || ''
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return showcaseCouples.filter(c => {
      if (filterTemplate && c.template !== filterTemplate) return false
      if (search) {
        const q = search.toLowerCase()
        const name = `${c.groom} ${c.bride}`.toLowerCase()
        if (!name.includes(q)) return false
      }
      return true
    })
  }, [filterTemplate, search])

  const totalCouples = showcaseCouples.length

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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-6">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                Cặp đôi đã tạo
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                {totalCouples.toLocaleString('vi-VN')}+ cặp đôi đã tin tưởng sử dụng Thiệp Cưới Online
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm cặp đôi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {filterTemplate && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
                  {getTemplateById(filterTemplate)?.icon} {getTemplateById(filterTemplate)?.name}
                </span>
                <button onClick={() => setSearchParams({})}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
                  <X className="w-3 h-3" /> Bỏ lọc
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Không tìm thấy cặp đôi nào</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filtered.map(couple => {
                    const theme = getTemplateById(couple.template)
                    return (
                      <Link
                        key={couple.id}
                        to={`/${couple.template}`}
                        className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <img
                            src={`/photos/gallery-${couple.photoIdx}.jpg`}
                            alt={`Đám cưới ${couple.groom} & ${couple.bride}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg drop-shadow-lg leading-tight">
                              {couple.groom} <span className="text-white/70">&</span> {couple.bride}
                            </h3>
                            <p className="text-white/60 text-xs mt-1 drop-shadow">Save the Date: {couple.dateDisplay}</p>
                          </div>
                          {theme && (
                            <div className="absolute top-3 left-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${theme.accent?.replace('text-', 'bg-') || 'bg-red-500'} text-white/90 backdrop-blur-sm`}>
                                {theme.icon} {theme.name}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {filterTemplate && (
                  <div className="mt-12 flex justify-center">
                    <Link to="/create"
                      className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all inline-flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" /> Tạo thiệp của bạn ngay
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-12">
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
