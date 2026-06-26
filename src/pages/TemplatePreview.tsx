import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTemplateById, getCategoryForTemplate } from '../lib/templates'
import { Smartphone, Tablet, Monitor, Sparkles, Heart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

type DeviceMode = 'mobile' | 'tablet' | 'desktop'

const deviceWidths: Record<DeviceMode, string> = {
  mobile: 'w-[375px]',
  tablet: 'w-[768px]',
  desktop: 'w-full',
}

const deviceClasses: Record<DeviceMode, string> = {
  mobile: 'rounded-[3rem] border-8 border-gray-900 shadow-2xl',
  tablet: 'rounded-[2rem] border-8 border-gray-900 shadow-2xl',
  desktop: 'rounded-2xl border border-gray-200 shadow-lg',
}

export default function TemplatePreview() {
  const { id } = useParams<{ id: string }>()
  const theme = getTemplateById(id || '')
  const category = id ? getCategoryForTemplate(id) : undefined

  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [groom, setGroom] = useState('Xuân Nam')
  const [bride, setBride] = useState('Kim Thơ')
  const [date, setDate] = useState('08/08/2026')

  const catTemplates = category?.templates || []
  const currentIdx = catTemplates.findIndex(t => t.id === id)
  const prevT = currentIdx > 0 ? catTemplates[currentIdx - 1] : null
  const nextT = currentIdx < catTemplates.length - 1 ? catTemplates[currentIdx + 1] : null

  const iframeUrl = useMemo(() => {
    const params = new URLSearchParams({ preview: '1', groom, bride, date })
    return `/${id}?${params.toString()}`
  }, [id, groom, bride, date])

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy mẫu</h1>
          <p className="text-gray-500 mb-6">Mẫu thiệp không tồn tại.</p>
          <Link to="/" className="text-red-500 font-semibold hover:underline">← Về trang chủ</Link>
        </div>
      </div>
    )
  }

  const bgStyle = theme.cardBg || 'bg-gradient-to-br from-red-600 to-red-800'

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Kho giao diện
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(['mobile', 'tablet', 'desktop'] as const).map(d => {
                const Icon = d === 'mobile' ? Smartphone : d === 'tablet' ? Tablet : Monitor
                return (
                  <button key={d} onClick={() => setDevice(d)}
                    className={`p-2 rounded-lg transition-all ${device === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
            <Link to={`/create?template=${theme.id}`}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all">
              <Sparkles className="w-3.5 h-3.5" /> Dùng mẫu này
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <span className="text-4xl mb-3 block">{theme.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{theme.name}</h1>
                <p className="text-sm text-gray-400">{theme.nameEn}</p>
              </div>

              {category && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{category.icon} {category.name}</span>
                  <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{theme.fontFamily === 'serif' ? 'Serif' : 'Sans'} · {theme.pattern}</span>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-gray-800">Tuỳ chỉnh trước</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Chú rể</label>
                    <input value={groom} onChange={e => setGroom(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Cô dâu</label>
                    <input value={bride} onChange={e => setBride(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ngày cưới</label>
                    <input value={date} onChange={e => setDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-gray-800">Chi tiết mẫu</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Phong cách</p>
                    <p className="font-semibold text-gray-700">{category?.name || 'Tổng hợp'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Font chữ</p>
                    <p className="font-semibold text-gray-700">{theme.fontFamily === 'serif' ? 'Serif (Playfair Display)' : 'Sans (Be Vietnam Pro)'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tông màu</p>
                    <p className="font-semibold text-gray-700">{theme.accentHex}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hoa văn</p>
                    <p className="font-semibold text-gray-700">{theme.pattern}</p>
                  </div>
                </div>
              </div>

              <Link to={`/create?template=${theme.id}`}
                className="block w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm text-center transition-all">
                <Sparkles className="w-4 h-4 inline-block mr-1.5" /> Sử dụng mẫu {theme.name}
              </Link>

              {category && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-3 tracking-wide uppercase">Cùng bộ sưu tập</p>
                  <div className="space-y-2">
                    {catTemplates.filter(t => t.id !== theme.id).slice(0, 4).map(t => (
                      <Link key={t.id} to={`/template-preview/${t.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <span className="text-xl">{t.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 group-hover:text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400 truncate">{t.nameEn}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <div className="flex flex-col items-center">
                <div className={`relative overflow-hidden transition-all duration-300 ${deviceWidths[device]} ${deviceClasses[device]}`}>
                  <div className={`h-10 flex items-center justify-between px-4 ${bgStyle}`}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    </div>
                    <span className="text-white/60 text-[10px] font-medium">{theme.name}</span>
                    <div className="w-10" />
                  </div>
                  <div style={{ height: device === 'mobile' ? '600px' : device === 'tablet' ? '700px' : '70vh', minHeight: '500px' }}>
                    <iframe
                      src={iframeUrl}
                      className="w-full h-full border-0 bg-white"
                      title={`Preview ${theme.name}`}
                      loading="lazy"
                    />
                  </div>
                  {device === 'mobile' && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {prevT && (
                    <Link to={`/template-preview/${prevT.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> {prevT.name}
                    </Link>
                  )}
                </div>
                <div className="flex gap-2">
                  {nextT && (
                    <Link to={`/template-preview/${nextT.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                      {nextT.name} <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
