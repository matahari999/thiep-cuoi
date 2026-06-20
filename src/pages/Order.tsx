import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, Check, HeartHandshake, Upload } from 'lucide-react'
import { templateCategories, allTemplates } from '../lib/templates'

const WEDDING_TIMES = ['06:00','07:00','08:00','09:00','10:00','10:30','11:00','11:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00']

function DateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [d, m, y] = value ? value.split('/') : ['', '', '']
  const emit = (nd: string, nm: string, ny: string) => onChange(nd && nm && ny ? `${nd}/${nm}/${ny}` : '')
  const cls = "flex-1 px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm"
  return (
    <div className="flex gap-2">
      <select value={d || ''} onChange={e => emit(e.target.value, m || '', y || '')} className={cls}>
        <option value="">Ngày</option>
        {Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')).map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <select value={m || ''} onChange={e => emit(d || '', e.target.value, y || '')} className={cls}>
        <option value="">Tháng</option>
        {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(v => <option key={v} value={v}>T.{Number(v)}</option>)}
      </select>
      <select value={y || ''} onChange={e => emit(d || '', m || '', e.target.value)} className={cls}>
        <option value="">Năm</option>
        {[2025,2026,2027,2028,2029,2030].map(v => <option key={v} value={String(v)}>{v}</option>)}
      </select>
    </div>
  )
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm">
      <option value="">Chọn giờ</option>
      {WEDDING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  )
}

const basePrices: Record<string, number> = {
  'classic-red': 299000, 'dong-son': 349000, 'hoa-sen': 349000, 'song-hy': 299000,
  'minimal-beige': 349000, 'minimal-black': 399000, 'sage-green': 349000,
  'romantic-pink': 349000, 'watercolor': 399000, 'peony-garden': 399000,
  'gold-elegant': 399000, 'black-gold': 449000, 'rose-gold': 449000,
  'rustic-green': 349000, 'earthy-beige': 349000, 'olive-garden': 349000,
  'vintage-gold': 399000, 'vintage-rose': 399000, 'french-vintage': 449000,
  'ao-dai': 349000, 'non-la': 349000, 'truc-dong': 399000,
}

const addons = [
  { id: 'rsvp', name: 'RSVP (Xác nhận tham dự)', price: 50000 },
  { id: 'bank', name: 'Tài khoản / QR tiền mừng', price: 0 },
  { id: 'music', name: 'Nhạc nền tự động', price: 30000 },
  { id: 'multilingual', name: 'Đa ngôn ngữ (VN/EN/KR)', price: 100000 }
]

interface FormData {
  templateId: string
  groomName: string
  brideName: string
  date: string
  time: string
  venue: string
  mapUrl: string
  message: string
  contact: string
  addons: string[]
  photos: File[]
}

function formatPrice(n: number): string {
  return n.toLocaleString('vi-VN') + '₫'
}

export default function Order() {
  const [step, setStep] = useState(1)
  const [selectedCat, setSelectedCat] = useState(templateCategories[0].id)
  const [form, setForm] = useState<FormData>({
    templateId: '',
    groomName: '',
    brideName: '',
    date: '',
    time: '',
    venue: '',
    mapUrl: '',
    message: '',
    contact: '',
    addons: [],
    photos: []
  })
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof FormData, value: any) => setForm(p => ({ ...p, [key]: value }))

  const toggleAddon = (id: string) => {
    setForm(p => ({
      ...p,
      addons: p.addons.includes(id) ? p.addons.filter(a => a !== id) : [...p.addons, id]
    }))
  }

  const handleSubmit = () => {
    const checkoutUrl = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL
    if (checkoutUrl && !checkoutUrl.includes('YOUR-STORE')) {
      const params = new URLSearchParams({
        'checkout[custom][template]': form.templateId,
        'checkout[custom][groom]': form.groomName,
        'checkout[custom][bride]': form.brideName,
        'checkout[custom][date]': form.date,
        'checkout[custom][venue]': form.venue,
        'checkout[custom][contact]': form.contact,
        'checkout[custom][total]': String(total),
      })
      window.open(`${checkoutUrl}?${params.toString()}`, '_blank')
    }
    setSubmitted(true)
  }

  const currentCat = templateCategories.find(c => c.id === selectedCat) || templateCategories[0]
  const selected = allTemplates.find(t => t.id === form.templateId)
  const basePrice = form.templateId ? (basePrices[form.templateId] || 299000) : 0
  const addonTotal = form.addons.reduce((sum, a) => sum + (addons.find(ad => ad.id === a)?.price || 0), 0)
  const total = basePrice + addonTotal

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-3">
            Cảm ơn bạn đã đặt thiệp cưới tại Thiệp Cưới Online.
          </p>
          {import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL && !import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL.includes('YOUR-STORE') && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3 mb-4">
              💳 Vui lòng hoàn tất thanh toán trong cửa sổ mới vừa mở.
            </p>
          )}
          <p className="text-gray-400 text-sm mb-6">Chúng tôi sẽ liên hệ qua Zalo trong vòng 24 giờ.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-red-500 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-bold text-gray-900">Đặt thiệp cưới</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 justify-center text-sm">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {s}
              </div>
              <span className={`hidden sm:inline ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Mẫu thiệp' : s === 2 ? 'Thông tin' : 'Xác nhận'}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-red-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Chọn mẫu thiệp</h2>
            <p className="text-gray-500 mb-6">21+ mẫu thiệp trong 7 phong cách. Chọn thiết kế bạn yêu thích.</p>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
              {templateCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                    selectedCat === cat.id
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span className={`text-[10px] ${selectedCat === cat.id ? 'text-red-200' : 'text-gray-400'}`}>({cat.templates.length})</span>
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="grid gap-4">
              {currentCat.templates.map(t => {
                const price = basePrices[t.id] || 299000
                return (
                  <button
                    key={t.id}
                    onClick={() => set('templateId', t.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      form.templateId === t.id ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${t.cardBg} rounded-xl flex items-center justify-center shrink-0`}>
                        <span className="text-2xl">{t.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{t.name}</h3>
                        <p className="text-xs text-gray-400">{t.nameEn}</p>
                        <span className="text-[10px] text-gray-400">{currentCat.icon} {currentCat.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-red-500">{formatPrice(price)}</p>
                        {form.templateId === t.id && <Check className="w-5 h-5 text-red-500 ml-auto mt-1" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              disabled={!form.templateId}
              onClick={() => setStep(2)}
              className="mt-8 w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg transition-all"
            >
              Tiếp theo — {form.templateId ? `${formatPrice(basePrices[form.templateId] || 299000)}` : 'Chọn mẫu thiệp'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Thông tin đám cưới</h2>
            <p className="text-gray-500 mb-6">Điền thông tin của cô dâu & chú rể</p>

            {/* Selected template reminder */}
            {selected && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl mb-6">
                <div className={`w-10 h-10 ${selected.cardBg} rounded-lg flex items-center justify-center`}>
                  <span className="text-lg">{selected.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-500">{formatPrice(basePrices[selected.id] || 299000)}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-red-500 font-semibold hover:underline">Đổi mẫu</button>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tên chú rể *</label>
                  <input
                    value={form.groomName}
                    onChange={e => set('groomName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tên cô dâu *</label>
                  <input
                    value={form.brideName}
                    onChange={e => set('brideName', e.target.value)}
                    placeholder="Trần Thị B"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ngày cưới *</label>
                <DateSelect value={form.date} onChange={v => set('date', v)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Giờ *</label>
                <TimeSelect value={form.time} onChange={v => set('time', v)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Địa điểm tổ chức *</label>
                <input
                  value={form.venue}
                  onChange={e => set('venue', e.target.value)}
                  placeholder="Nhà hàng / Trung tâm tiệc cưới"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Link Google Maps</label>
                <input
                  value={form.mapUrl}
                  onChange={e => set('mapUrl', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lời nhắn gửi khách mời</label>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder="Trân trọng kính mời bạn đến chung vui..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại / Zalo *</label>
                <input
                  value={form.contact}
                  onChange={e => set('contact', e.target.value)}
                  placeholder="Liên hệ khi thiệp hoàn tất"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Hình ảnh đám cưới</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-red-300 transition-colors">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Chọn ảnh cưới từ thiết bị của bạn</p>
                  <p className="text-xs text-gray-300 mt-1">Tối thiểu 1 ảnh, hỗ trợ JPG/PNG/WebP</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Tính năng bổ sung</label>
                <div className="grid gap-3">
                  {addons.map(a => (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${form.addons.includes(a.id) ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 text-sm">{a.name}</span>
                        <span className="text-sm text-gray-500">{a.price === 0 ? 'Miễn phí' : formatPrice(a.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all">
                Quay lại
              </button>
              <button
                disabled={!form.groomName || !form.brideName || !form.date || !form.time || !form.venue || !form.contact}
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg transition-all"
              >
                Xem lại & xác nhận
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Xác nhận đặt hàng</h2>
            <p className="text-gray-500 mb-6">Vui lòng kiểm tra lại thông tin trước khi đặt</p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
              {selected && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className={`w-12 h-12 ${selected.cardBg} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">{selected.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selected.name}</p>
                    <p className="text-xs text-gray-400">{templateCategories.find(c => c.templates.some(t => t.id === form.templateId))?.name}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Chú rể</span>
                <span className="font-semibold text-gray-900">{form.groomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cô dâu</span>
                <span className="font-semibold text-gray-900">{form.brideName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày giờ</span>
                <span className="font-semibold text-gray-900">{form.date} — {form.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Địa điểm</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">{form.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Liên hệ</span>
                <span className="font-semibold text-gray-900">{form.contact}</span>
              </div>
              {form.addons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bổ sung</span>
                  <span className="font-semibold text-gray-900">{form.addons.length} mục</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                <span className="font-bold text-red-500 text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-8 w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" /> Xác nhận đặt hàng — {formatPrice(total)}
            </button>
            <button onClick={() => setStep(2)} className="mt-3 w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
