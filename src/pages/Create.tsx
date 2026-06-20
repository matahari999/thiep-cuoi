import { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Upload, Image, ArrowLeft, ArrowRight, Sparkles, Heart, Check, Camera, Trash2, Home, AlertCircle } from 'lucide-react'
import { templateCategories, getCategoryForTemplate } from '../lib/templates'
import { DateSelect, TimeSelect } from '../components/DateTimePicker'
import { VN_BANKS, encodeBankDisplay } from '../lib/vietqr'

interface FormData {
  groom: string
  bride: string
  groomParent: string
  brideParent: string
  date: string
  time: string
  venue: string
  message: string
  bankGroom: string
  bankBride: string
  bankGroomId: string
  bankGroomAccount: string
  bankGroomName: string
  bankBrideId: string
  bankBrideAccount: string
  bankBrideName: string
  heroPhoto: string
  gallery: string[]
  template: string
  categoryId: string
}

function encodeShareUrl(data: Omit<FormData, 'heroPhoto' | 'gallery' | 'categoryId'>): string {
  try {
    const json = JSON.stringify(data)
    const b64 = btoa(unescape(encodeURIComponent(json)))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch { return '' }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function compressImage(file: File): Promise<string> {
  if (file.type === 'image/gif') return readFileAsDataURL(file)
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    const fallback = () => readFileAsDataURL(file).then(resolve).catch(() => resolve(''))
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const MAX = 1280
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { fallback(); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      } catch { fallback() }
    }
    img.onerror = () => { URL.revokeObjectURL(url); fallback() }
    img.src = url
  })
}


function formatDate(v: string): string { return v }

export default function Create() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const defaultCat = templateCategories.length > 0 ? templateCategories[0].id : ''
  const defaultTmpl = templateCategories.length > 0 && templateCategories[0].templates.length > 0
    ? templateCategories[0].templates[0].id : ''

  const presetTmpl = searchParams.get('template') ?? ''
  const presetCat = getCategoryForTemplate(presetTmpl)?.id ?? ''
  const initialTmpl = presetTmpl && presetCat ? presetTmpl : defaultTmpl
  const initialCat = presetTmpl && presetCat ? presetCat : defaultCat

  const [form, setForm] = useState<FormData>({
    groom: '', bride: '',
    groomParent: '', brideParent: '',
    date: '', time: '10:00',
    venue: '',
    message: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi trong ngày trọng đại. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất của chúng tôi.',
    bankGroom: '', bankBride: '',
    bankGroomId: '', bankGroomAccount: '', bankGroomName: '',
    bankBrideId: '', bankBrideAccount: '', bankBrideName: '',
    heroPhoto: '',
    gallery: ['', '', '', ''],
    template: initialTmpl,
    categoryId: initialCat,
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const update = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        update('heroPhoto', await compressImage(file))
      } catch {
        showToast('Không thể tải ảnh. Thử ảnh khác.')
      } finally {
        setUploading(false)
      }
    }
    if (e.target) e.target.value = ''
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    const results = await Promise.allSettled(files.map(compressImage))
    const urls = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value)
    setUploading(false)
    if (urls.length === 0) { showToast('Không thể tải ảnh. Thử ảnh khác.'); return }
    const newGallery = [...form.gallery]
    let urlIdx = 0
    for (let i = 0; i < newGallery.length && urlIdx < urls.length; i++) {
      if (newGallery[i] === '') {
        newGallery[i] = urls[urlIdx]
        urlIdx++
      }
    }
    while (urlIdx < urls.length && newGallery.length < 4) {
      newGallery.push(urls[urlIdx])
      urlIdx++
    }
    setForm(prev => ({ ...prev, gallery: newGallery }))
    if (e.target) e.target.value = ''
  }

  const replaceGalleryPhoto = async (idx: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const url = await compressImage(file)
      const newGallery = [...form.gallery]
      newGallery[idx] = url
      setForm(prev => ({ ...prev, gallery: newGallery }))
    }
    input.click()
  }

  const removeGalleryPhoto = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newGallery = [...form.gallery]
    newGallery[idx] = ''
    const filled = newGallery.filter(g => g !== '')
    while (filled.length < 4) filled.push('')
    setForm(prev => ({ ...prev, gallery: filled }))
  }

  const canSubmitStep1 = form.groom && form.bride && form.date && form.venue

  const generate = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    const groomDisplay = form.bankGroomAccount
      ? encodeBankDisplay(form.bankGroomId, form.bankGroomAccount, form.bankGroomName)
      : form.bankGroom
    const brideDisplay = form.bankBrideAccount
      ? encodeBankDisplay(form.bankBrideId, form.bankBrideAccount, form.bankBrideName)
      : form.bankBride

    const payload = {
      ...form,
      bankGroom: groomDisplay,
      bankBride: brideDisplay,
      _created: Date.now(),
    }
    try { localStorage.setItem('thiepcuoi_custom', JSON.stringify(payload)) } catch { /* quota exceeded */ }

    const { heroPhoto: _h, gallery: _g, categoryId: _c, ...textOnly } = payload
    const encoded = encodeShareUrl(textOnly)
    const shareUrl = encoded ? `/v/${encoded}` : '/custom-invitation'

    setSaving(false)
    setSaved(true)
    setTimeout(() => navigate(shareUrl, { state: { invitationData: payload } }), 1200)
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo thiệp thành công!</h2>
          <p className="text-gray-500">Đang chuyển đến thiệp của bạn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-2xl shadow-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          {toast}
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all">
            <Home className="w-5 h-5" />
            <span className="font-bold text-gray-900">Tạo thiệp</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s ? 'bg-green-500 text-white' : step === s ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>{step > s ? <Check className="w-3 h-3" /> : s}</div>
                {s < 3 && <div className={`w-6 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-14 max-w-lg mx-auto px-4 pb-24">
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin đám cưới</h1>
              <p className="text-sm text-gray-500">Nhập thông tin để tạo thiệp</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Chú rể</label>
                  <input value={form.groom} onChange={e => update('groom', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Cô dâu</label>
                  <input value={form.bride} onChange={e => update('bride', e.target.value)}
                    placeholder="Trần Thị B"
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày cưới</label>
                <DateSelect value={form.date} onChange={v => update('date', v)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Giờ</label>
                  <TimeSelect value={form.time} onChange={v => update('time', v)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Địa điểm</label>
                  <input value={form.venue} onChange={e => update('venue', e.target.value)}
                    placeholder="Nhà hàng, khách sạn..."
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Lời nhắn (tùy chọn)</label>
                <textarea value={form.message} onChange={e => update('message', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm resize-none" />
              </div>

              {/* Bank / VietQR */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-600 mb-3">🧧 Tài khoản tiền mừng (tùy chọn)</p>
                {(['Groom', 'Bride'] as const).map(side => {
                  const idKey = `bank${side}Id` as keyof FormData
                  const accKey = `bank${side}Account` as keyof FormData
                  const nameKey = `bank${side}Name` as keyof FormData
                  const label = side === 'Groom' ? 'Nhà trai (chú rể)' : 'Nhà gái (cô dâu)'
                  return (
                    <div key={side} className="mb-4 p-4 bg-white/60 rounded-2xl border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">{label}</p>
                      <div className="space-y-2">
                        <select value={form[idKey] as string} onChange={e => update(idKey, e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400">
                          <option value="">— Chọn ngân hàng —</option>
                          {VN_BANKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <input value={form[accKey] as string} onChange={e => update(accKey, e.target.value)}
                          placeholder="Số tài khoản"
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400" />
                        <input value={form[nameKey] as string} onChange={e => update(nameKey, e.target.value)}
                          placeholder="Tên chủ tài khoản (IN HOA)"
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button onClick={() => setStep(2)}
              disabled={!canSubmitStep1}
              className="mt-8 w-full py-4 bg-red-500 disabled:bg-gray-300 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tải ảnh lên</h1>
              <p className="text-sm text-gray-500">Hỗ trợ PNG, JPEG, WEBP, GIF — ảnh tự động nén</p>
            </div>

            <div className="space-y-6">
              {/* Hero photo */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Ảnh chính (hero)</label>
                <div onClick={() => heroInputRef.current?.click()}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
                    form.heroPhoto ? 'border-transparent' : 'border-gray-300 hover:border-red-400'
                  }`}>
                  {form.heroPhoto ? (
                    <>
                      <img src={form.heroPhoto} alt="Hero" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); update('heroPhoto', ''); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-10 h-10 mb-3 group-hover:text-red-400 transition-colors" />
                      <span className="text-sm font-medium">Nhấn để tải ảnh chính lên</span>
                      <span className="text-xs mt-1">Tỷ lệ 3:4 khuyến nghị</span>
                    </div>
                  )}
                </div>
                <input ref={heroInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml" onChange={handleHeroUpload} className="hidden" />
              </div>

              {/* Gallery photos */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Ảnh gallery (tối đa 4 ảnh)</label>
                <div className="grid grid-cols-2 gap-3">
                  {form.gallery.map((url, i) => (
                    <div key={i} onClick={() => url ? replaceGalleryPhoto(i) : galleryInputRef.current?.click()}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
                        url ? 'border-transparent hover:border-red-300' : 'border-gray-300 hover:border-red-400'
                      }`}>
                      {url ? (
                        <>
                          <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">Nhấn để thay</span>
                          </div>
                          <button onClick={(e) => removeGalleryPhoto(i, e)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Image className="w-8 h-8 mb-1 group-hover:text-red-400 transition-colors" />
                          <span className="text-xs">Ảnh {i + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {form.gallery.filter(g => g).length}/4 ảnh đã tải — Nhấn để thay / Nhấn ô trống để thêm
                </p>
                <input ref={galleryInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml" multiple onChange={handleGalleryUpload} className="hidden" />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(1)}
                disabled={uploading}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-all">
                ← Quay lại
              </button>
              <button onClick={() => setStep(3)}
                disabled={uploading}
                className="flex-1 py-4 bg-red-500 disabled:bg-gray-400 text-white rounded-2xl font-bold text-sm hover:bg-red-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                {uploading ? 'Đang nén ảnh...' : <> Xem trước <ArrowRight className="w-4 h-4" /> </>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview + Generate */}
        {step === 3 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Chọn mẫu & xem trước</h1>
              <p className="text-sm text-gray-500">Chọn phong cách thiệp</p>
            </div>

            {/* Category selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide mb-3">
              {templateCategories.map(cat => (
                <button key={cat.id} onClick={() => {
                  update('categoryId', cat.id)
                  if (cat.templates.length > 0) update('template', cat.templates[0].id)
                }}
                  className={`snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    form.categoryId === cat.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200'
                  }`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Sub-template selector */}
            {(() => {
              const currentCat = templateCategories.find(c => c.id === form.categoryId)
              if (!currentCat) return null
              return (
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                  {currentCat.templates.map(t => (
                    <button key={t.id} onClick={() => update('template', t.id)}
                      className={`snap-start shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        form.template === t.id
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-rose-200'
                      }`}>
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* Live Preview */}
            <div className="mt-2 rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-white">
              {/* Mini hero */}
              {(() => {
                const cat = templateCategories.find(c => c.id === form.categoryId)
                const tmpl = cat?.templates.find(t => t.id === form.template)
                return (
                  <div className={`relative h-48 flex items-center justify-center ${tmpl?.cardBg || 'bg-gradient-to-br from-gray-800 to-gray-900'}`}
                    style={form.heroPhoto ? { backgroundImage: `url(${form.heroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {form.heroPhoto && <div className="absolute inset-0 bg-black/40" />}
                    <div className="relative text-center z-10">
                      <span className={`text-3xl ${tmpl?.fontColor || 'text-white'}`}>{tmpl?.icon || '💒'}</span>
                      <Heart className={`w-5 h-5 mx-auto mt-1 animate-pulse ${tmpl?.accent || 'text-red-400'}`} />
                      <p className={`text-[10px] font-light tracking-[0.2em] ${tmpl?.fontColorSecondary || 'text-white/70'} mt-1`}>WEDDING INVITATION</p>
                      <h2 className={`${tmpl?.fontColor || 'text-white'} text-lg font-bold mt-1`}>
                        {form.groom?.split(' ').pop() || '??'}
                        <span className={`mx-1 ${tmpl?.accent || 'text-red-400'}`}>&</span>
                        {form.bride?.split(' ').pop() || '??'}
                      </h2>
                      {form.date && <p className={`text-[10px] ${tmpl?.fontColorSecondary || 'text-white/60'} mt-1`}>{formatDate(form.date)}</p>}
                    </div>
                  </div>
                )
              })()}

              {/* Mini preview content */}
              <div className="p-4 space-y-3 text-center">
                <p className="text-xs text-gray-400">📅 {formatDate(form.date) || 'Chưa chọn ngày'} — {form.time}</p>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  📍
                  <a href={`https://maps.google.com/maps?q=${encodeURIComponent(form.venue || '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-red-500 hover:underline font-medium">
                    {form.venue || 'Chưa có địa điểm'}
                  </a>
                  <span className="text-[10px] text-red-300">(Nhấn để mở bản đồ)</span>
                </p>
                <div className="flex justify-center gap-1">
                  {form.gallery.filter(g => g).slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="" className="w-14 h-20 object-cover rounded-lg" />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 italic">{form.message?.slice(0, 60)}...</p>
              </div>

              {/* Style info */}
              {(() => {
                const cat = templateCategories.find(c => c.id === form.categoryId)
                const tmpl = cat?.templates.find(t => t.id === form.template)
                if (!tmpl) return null
                return (
                  <div className="px-4 pb-3 flex justify-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{cat?.icon} {cat?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{tmpl.name}</span>
                  </div>
                )
              })()}
            </div>

            <button onClick={generate} disabled={saving}
              className="mt-8 w-full py-5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-200">
              {saving ? (
                <>Đang tạo...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Tạo thiệp của tôi</>
              )}
            </button>

            <button onClick={() => setStep(2)}
              className="mt-3 w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-all flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Quay lại
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
