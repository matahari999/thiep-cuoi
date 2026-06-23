import { useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Upload, Image, ArrowLeft, ArrowRight, Sparkles, Heart, Check, Camera,
         Trash2, Home, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { templateCategories, getCategoryForTemplate } from '../lib/templates'
import { DateSelect, TimeSelect } from '../components/DateTimePicker'
import { VN_BANKS, encodeBankDisplay } from '../lib/vietqr'
import {
  type FieldErrors, LIMITS, uniLen,
  validateName, validateParentName, validateDate, validateVenue,
  validateBankAccount, validateBankName, validateStep1,
} from '../lib/validation'

// ── 폼 데이터 타입 ─────────────────────────────────────────────────────────────

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

// ── 유틸리티 ──────────────────────────────────────────────────────────────────

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
        canvas.width = width; canvas.height = height
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

// ── 공통 UI 컴포넌트 ───────────────────────────────────────────────────────────

/** 필드 에러 메시지 */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1 animate-fade-in">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  )
}

/** 글자 수 카운터 */
function CharCounter({ value, max, warnAt }: { value: string; max: number; warnAt?: number }) {
  const len = uniLen(value)
  const warn = warnAt ?? Math.floor(max * 0.8)
  const colorClass = len > max ? 'text-red-500 font-semibold' : len > warn ? 'text-amber-500' : 'text-gray-300'
  return (
    <span className={`text-[10px] tabular-nums ${colorClass}`}>{len}/{max}</span>
  )
}

/** 라벨 + 우측 카운터 행 */
function LabelRow({
  label, required, children,
}: { label: string; required?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── 필드별 단일 검사 함수 ─────────────────────────────────────────────────────

function checkField(field: keyof FormData, value: string): string {
  switch (field) {
    case 'groom':            return validateName(value, 'Tên chú rể')
    case 'bride':            return validateName(value, 'Tên cô dâu')
    case 'groomParent':      return validateParentName(value, 'Tên bố mẹ chú rể')
    case 'brideParent':      return validateParentName(value, 'Tên bố mẹ cô dâu')
    case 'date':             return validateDate(value)
    case 'venue':            return validateVenue(value)
    case 'bankGroomAccount': return validateBankAccount(value, 'nhà trai')
    case 'bankGroomName':    return validateBankName(value, 'nhà trai')
    case 'bankBrideAccount': return validateBankAccount(value, 'nhà gái')
    case 'bankBrideName':    return validateBankName(value, 'nhà gái')
    default:                 return ''
  }
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export default function Create() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const heroInputRef  = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const defaultCat  = templateCategories[0]?.id ?? ''
  const defaultTmpl = templateCategories[0]?.templates[0]?.id ?? ''
  const presetTmpl  = searchParams.get('template') ?? ''
  const presetCat   = getCategoryForTemplate(presetTmpl)?.id ?? ''

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
    template: presetTmpl && presetCat ? presetTmpl : defaultTmpl,
    categoryId: presetTmpl && presetCat ? presetCat : defaultCat,
  })

  // ── 유효성 상태 ────────────────────────────────────────────────────────────
  const [errors,  setErrors]  = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast,     setToast]     = useState('')
  const [step2Attempted, setStep2Attempted] = useState(false)
  const [showParents,    setShowParents]    = useState(false)
  const [showBank,       setShowBank]       = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // ── 필드 변경 — touched 필드는 즉시 재검사 ─────────────────────────────────
  const update = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (touched.has(field as string)) {
      const err = checkField(field, value)
      setErrors(prev => ({ ...prev, [field]: err || undefined }))
    }
  }, [touched])

  // blur 시 해당 필드 touch + 검사
  const handleBlur = useCallback((field: keyof FormData, value: string) => {
    setTouched(prev => new Set([...prev, field as string]))
    const err = checkField(field, value)
    setErrors(prev => ({ ...prev, [field]: err || undefined }))
  }, [])

  // 오류 유무 확인 헬퍼
  const err = (field: keyof FormData) => touched.has(field as string) ? errors[field as string] : undefined

  // ── 이미지 처리 ───────────────────────────────────────────────────────────

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try { update('heroPhoto', await compressImage(file)) }
      catch { showToast('Không thể tải ảnh. Thử ảnh khác.') }
      finally { setUploading(false) }
    }
    if (e.target) e.target.value = ''
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const results = await Promise.allSettled(files.map(compressImage))
    const urls = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value)
    setUploading(false)
    if (!urls.length) { showToast('Không thể tải ảnh. Thử ảnh khác.'); return }
    const newGallery = [...form.gallery]
    let urlIdx = 0
    for (let i = 0; i < newGallery.length && urlIdx < urls.length; i++) {
      if (!newGallery[i]) { newGallery[i] = urls[urlIdx++] }
    }
    while (urlIdx < urls.length && newGallery.length < 4) newGallery.push(urls[urlIdx++])
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
      setForm(prev => {
        const g = [...prev.gallery]; g[idx] = url; return { ...prev, gallery: g }
      })
    }
    input.click()
  }

  const removeGalleryPhoto = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setForm(prev => {
      const g = [...prev.gallery]; g[idx] = ''
      const filled = g.filter(Boolean); while (filled.length < 4) filled.push('')
      return { ...prev, gallery: filled }
    })
  }

  // ── Step 1 다음 버튼 ──────────────────────────────────────────────────────

  const REQUIRED_FIELDS: Array<keyof FormData> = ['groom', 'bride', 'date', 'venue']

  const handleStep1Next = () => {
    const allErrs = validateStep1(form)
    const requiredErrors: FieldErrors = {}
    REQUIRED_FIELDS.forEach(f => { if (allErrs[f]) requiredErrors[f] = allErrs[f] })

    // 모든 필드를 touched로 표시 → 에러 표시
    const allTouched = new Set([...touched, ...Object.keys(allErrs), ...REQUIRED_FIELDS])
    setTouched(allTouched)
    setErrors(allErrs)

    if (Object.keys(requiredErrors).length === 0) {
      setStep(2)
      return
    }
    const firstMsg = REQUIRED_FIELDS.map(f => allErrs[f]).find(Boolean)
    if (firstMsg) showToast(firstMsg)
  }

  // required 필드에 오류 없으면 버튼 활성
  const canSubmitStep1 = REQUIRED_FIELDS.every(f =>
    form[f] && !errors[f as string]
  )

  // ── 최종 생성 ─────────────────────────────────────────────────────────────

  const generate = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    const groomDisplay = form.bankGroomAccount
      ? encodeBankDisplay(form.bankGroomId, form.bankGroomAccount, form.bankGroomName)
      : form.bankGroom
    const brideDisplay = form.bankBrideAccount
      ? encodeBankDisplay(form.bankBrideId, form.bankBrideAccount, form.bankBrideName)
      : form.bankBride
    const payload = { ...form, bankGroom: groomDisplay, bankBride: brideDisplay, _created: Date.now() }
    try { localStorage.setItem('thiepcuoi_custom', JSON.stringify(payload)) } catch { /* quota */ }
    const { heroPhoto: _h, gallery: _g, categoryId: _c, ...textOnly } = payload
    const encoded  = encodeShareUrl(textOnly)
    const shareUrl = encoded ? `/v/${encoded}` : '/custom-invitation'
    setSaving(false); setSaved(true)
    setTimeout(() => navigate(shareUrl, { state: { invitationData: payload } }), 1200)
  }

  // ── 생성 완료 화면 ────────────────────────────────────────────────────────

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

  // ── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-2xl shadow-xl animate-fade-in max-w-[90vw]">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> {toast}
        </div>
      )}

      {/* Header */}
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

        {/* ══════════════════════════════════════════════
            Step 1: 정보 입력
        ══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin đám cưới</h1>
              <p className="text-sm text-gray-500">Nhập thông tin để tạo thiệp</p>
            </div>

            <div className="space-y-5">

              {/* ── 신랑 / 신부 이름 ── */}
              <div className="grid grid-cols-2 gap-3">
                {/* 신랑 */}
                <div>
                  <LabelRow label="Chú rể" required />
                  <input
                    value={form.groom}
                    onChange={e => update('groom', e.target.value)}
                    onBlur={e => handleBlur('groom', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="off"
                    className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none transition-all text-sm ${
                      err('groom') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={err('groom')} />
                </div>
                {/* 신부 */}
                <div>
                  <LabelRow label="Cô dâu" required />
                  <input
                    value={form.bride}
                    onChange={e => update('bride', e.target.value)}
                    onBlur={e => handleBlur('bride', e.target.value)}
                    placeholder="Trần Thị B"
                    autoComplete="off"
                    className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none transition-all text-sm ${
                      err('bride') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={err('bride')} />
                </div>
              </div>

              {/* ── 부모 이름 (접힘/펼침) ── */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowParents(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span>👨‍👩‍👦 Tên bố mẹ hai bên (tùy chọn)</span>
                  {showParents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showParents && (
                  <div className="px-4 pb-4 pt-3 space-y-3 bg-white/60">
                    <div>
                      <LabelRow label="Bố mẹ chú rể" />
                      <input
                        value={form.groomParent}
                        onChange={e => update('groomParent', e.target.value)}
                        onBlur={e => handleBlur('groomParent', e.target.value)}
                        placeholder="Ông Nguyễn Văn A & Bà Trần Thị B"
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:border-red-400 outline-none text-sm transition-all ${
                          err('groomParent') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                        }`}
                      />
                      <FieldError msg={err('groomParent')} />
                    </div>
                    <div>
                      <LabelRow label="Bố mẹ cô dâu" />
                      <input
                        value={form.brideParent}
                        onChange={e => update('brideParent', e.target.value)}
                        onBlur={e => handleBlur('brideParent', e.target.value)}
                        placeholder="Ông Trần Văn C & Bà Lê Thị D"
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:border-red-400 outline-none text-sm transition-all ${
                          err('brideParent') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                        }`}
                      />
                      <FieldError msg={err('brideParent')} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── 날짜 ── */}
              <div>
                <LabelRow label="Ngày cưới" required />
                <DateSelect
                  value={form.date}
                  onChange={v => {
                    update('date', v)
                    // DateSelect는 세 드롭다운 모두 선택 시 onChange 호출 → 즉시 touch
                    setTouched(prev => new Set([...prev, 'date']))
                    const e = validateDate(v)
                    setErrors(prev => ({ ...prev, date: e || undefined }))
                  }}
                  inputClassName={`flex-1 px-2 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none text-sm ${
                    err('date') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                <FieldError msg={err('date')} />
              </div>

              {/* ── 시간 + 장소 ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <LabelRow label="Giờ" required />
                  <TimeSelect value={form.time} onChange={v => update('time', v)} />
                </div>
                <div>
                  <LabelRow label="Địa điểm" required>
                    <CharCounter value={form.venue} max={LIMITS.venue.max} warnAt={LIMITS.venue.warnAt} />
                  </LabelRow>
                  <input
                    value={form.venue}
                    onChange={e => update('venue', e.target.value)}
                    onBlur={e => handleBlur('venue', e.target.value)}
                    placeholder="Nhà hàng, khách sạn..."
                    maxLength={LIMITS.venue.max + 20}  // hard stop slightly above limit for UX
                    className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none transition-all text-sm ${
                      err('venue') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={err('venue')} />
                </div>
              </div>

              {/* ── 장소 전체 표시 (긴 주소용) — 2열일 때 좁아서 별도 행에 full-width로 */}
              {uniLen(form.venue) > 30 && (
                <div>
                  <LabelRow label="Địa điểm đầy đủ" required>
                    <CharCounter value={form.venue} max={LIMITS.venue.max} warnAt={LIMITS.venue.warnAt} />
                  </LabelRow>
                  <textarea
                    value={form.venue}
                    onChange={e => update('venue', e.target.value)}
                    onBlur={e => handleBlur('venue', e.target.value)}
                    rows={2}
                    maxLength={LIMITS.venue.max + 20}
                    className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none transition-all text-sm resize-none ${
                      err('venue') ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={err('venue')} />
                </div>
              )}

              {/* ── 메시지 ── */}
              <div>
                <LabelRow label="Lời nhắn (tùy chọn)">
                  <CharCounter value={form.message} max={LIMITS.message.max} warnAt={LIMITS.message.warnAt} />
                </LabelRow>
                <textarea
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  rows={3}
                  maxLength={LIMITS.message.max + 20}
                  className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:border-red-400 outline-none transition-all text-sm resize-none ${
                    uniLen(form.message) > LIMITS.message.max ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {uniLen(form.message) > LIMITS.message.max && (
                  <FieldError msg={`Lời nhắn không quá ${LIMITS.message.max} ký tự`} />
                )}
              </div>

              {/* ── 은행 계좌 (접힘/펼침) ── */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBank(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span>🧧 Tài khoản tiền mừng (tùy chọn)</span>
                  {showBank ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showBank && (
                  <div className="px-4 pb-4 pt-3 space-y-4">
                    {(['Groom', 'Bride'] as const).map(side => {
                      const idKey   = `bank${side}Id`   as keyof FormData
                      const accKey  = `bank${side}Account` as keyof FormData
                      const nameKey = `bank${side}Name` as keyof FormData
                      const sideLabel = side === 'Groom' ? 'Nhà trai (chú rể)' : 'Nhà gái (cô dâu)'
                      const sideShort = side === 'Groom' ? 'nhà trai' : 'nhà gái'
                      return (
                        <div key={side} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{sideLabel}</p>
                          <select
                            value={form[idKey] as string}
                            onChange={e => update(idKey, e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400"
                          >
                            <option value="">— Chọn ngân hàng —</option>
                            {VN_BANKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>

                          <div>
                            <input
                              value={form[accKey] as string}
                              onChange={e => update(accKey, e.target.value)}
                              onBlur={e => handleBlur(accKey, e.target.value)}
                              placeholder="Số tài khoản (chỉ số)"
                              inputMode="numeric"
                              className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm outline-none focus:border-red-400 ${
                                err(accKey) ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                              }`}
                            />
                            <FieldError msg={err(accKey)} />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-400">Tên chủ TK (VietQR cần IN HOA)</span>
                            </div>
                            <input
                              value={form[nameKey] as string}
                              onChange={e => update(nameKey, e.target.value.toUpperCase())}
                              onBlur={e => handleBlur(nameKey, e.target.value)}
                              placeholder={`NGUYEN VAN A (${sideShort})`}
                              className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm outline-none focus:border-red-400 uppercase ${
                                err(nameKey) ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                              }`}
                            />
                            <FieldError msg={err(nameKey)} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            <button
              onClick={handleStep1Next}
              className={`mt-8 w-full py-4 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                canSubmitStep1 ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 hover:bg-red-400'
              }`}
            >
              Tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            Step 2: 사진 업로드
        ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tải ảnh lên</h1>
              <p className="text-sm text-gray-500">Hỗ trợ PNG, JPEG, WEBP, GIF — ảnh tự động nén</p>
            </div>

            <div className="space-y-6">
              {/* 대표 사진 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Ảnh chính (hero) <span className="text-red-400">*bắt buộc</span>
                </label>
                <div
                  onClick={() => heroInputRef.current?.click()}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
                    form.heroPhoto ? 'border-transparent'
                    : step2Attempted ? 'border-red-400' : 'border-gray-300 hover:border-red-400'
                  }`}
                >
                  {form.heroPhoto ? (
                    <>
                      <img src={form.heroPhoto} alt="Hero" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); update('heroPhoto', '') }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
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
                {step2Attempted && !form.heroPhoto && (
                  <FieldError msg="Vui lòng tải lên ảnh chính trước khi tiếp tục" />
                )}
                <input
                  ref={heroInputRef} type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
                  onChange={handleHeroUpload} className="hidden"
                />
              </div>

              {/* 갤러리 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Ảnh gallery (tối đa 4 ảnh)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {form.gallery.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => url ? replaceGalleryPhoto(i) : galleryInputRef.current?.click()}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
                        url ? 'border-transparent hover:border-red-300' : 'border-gray-300 hover:border-red-400'
                      }`}
                    >
                      {url ? (
                        <>
                          <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">Nhấn để thay</span>
                          </div>
                          <button
                            onClick={e => removeGalleryPhoto(i, e)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                          >
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
                  {form.gallery.filter(Boolean).length}/4 ảnh đã tải — Nhấn để thay / Nhấn ô trống để thêm
                </p>
                <input
                  ref={galleryInputRef} type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
                  multiple onChange={handleGalleryUpload} className="hidden"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={uploading}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => {
                  if (uploading) return
                  if (!form.heroPhoto) { setStep2Attempted(true); showToast('Vui lòng tải lên ảnh chính'); return }
                  setStep(3)
                }}
                disabled={uploading}
                className="flex-1 py-4 bg-red-500 disabled:bg-gray-400 text-white rounded-2xl font-bold text-sm hover:bg-red-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {uploading ? 'Đang nén ảnh...' : <> Xem trước <ArrowRight className="w-4 h-4" /> </>}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            Step 3: 템플릿 선택 + 미리보기
        ══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="animate-fade-in pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Chọn mẫu & xem trước</h1>
              <p className="text-sm text-gray-500">Chọn phong cách thiệp</p>
            </div>

            {/* 카테고리 선택 */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide mb-3">
              {templateCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    update('categoryId', cat.id)
                    if (cat.templates.length > 0) update('template', cat.templates[0].id)
                  }}
                  className={`snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    form.categoryId === cat.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* 하위 템플릿 선택 */}
            {(() => {
              const currentCat = templateCategories.find(c => c.id === form.categoryId)
              if (!currentCat) return null
              return (
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                  {currentCat.templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => update('template', t.id)}
                      className={`snap-start shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        form.template === t.id
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* 미리보기 카드 */}
            {(() => {
              const cat  = templateCategories.find(c => c.id === form.categoryId)
              const tmpl = cat?.templates.find(t => t.id === form.template)
              // 이름 오버플로우 대비: 표시 이름 글자 수로 폰트 크기 결정
              const groomLast = (form.groom || '??').split(' ').pop() ?? '??'
              const brideLast = (form.bride || '??').split(' ').pop() ?? '??'
              const previewNameLen = uniLen(groomLast) + uniLen(brideLast)
              const previewNameSize = previewNameLen > 16 ? 'text-base' : previewNameLen > 12 ? 'text-lg' : 'text-lg'
              return (
                <div className="mt-2 rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                  {/* 미니 히어로 */}
                  <div
                    className={`relative h-48 flex items-center justify-center ${tmpl?.cardBg || 'bg-gradient-to-br from-gray-800 to-gray-900'}`}
                    style={form.heroPhoto ? { backgroundImage: `url(${form.heroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {form.heroPhoto && <div className="absolute inset-0 bg-black/40" />}
                    <div className="relative text-center z-10 px-4">
                      <span className={`text-3xl ${tmpl?.fontColor || 'text-white'}`}>{tmpl?.icon || '💒'}</span>
                      <Heart className={`w-5 h-5 mx-auto mt-1 animate-pulse ${tmpl?.accent || 'text-red-400'}`} />
                      <p className={`text-[10px] font-light tracking-[0.2em] ${tmpl?.fontColorSecondary || 'text-white/70'} mt-1`}>
                        WEDDING INVITATION
                      </p>
                      <h2 className={`${tmpl?.fontColor || 'text-white'} ${previewNameSize} font-bold mt-1 break-words`}>
                        {groomLast}
                        <span className={`mx-1 ${tmpl?.accent || 'text-red-400'}`}>&</span>
                        {brideLast}
                      </h2>
                      {form.date && (
                        <p className={`text-[10px] ${tmpl?.fontColorSecondary || 'text-white/60'} mt-1`}>{form.date}</p>
                      )}
                    </div>
                  </div>

                  {/* 미니 콘텐츠 */}
                  <div className="p-4 space-y-3 text-center">
                    <p className="text-xs text-gray-400">📅 {form.date || 'Chưa chọn ngày'} — {form.time}</p>
                    <p className="text-xs text-gray-400 flex items-start justify-center gap-1">
                      📍
                      <a
                        href={`https://maps.google.com/maps?q=${encodeURIComponent(form.venue || '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-red-500 hover:underline font-medium text-left break-words"
                      >
                        {form.venue || 'Chưa có địa điểm'}
                      </a>
                    </p>
                    <div className="flex justify-center gap-1">
                      {form.gallery.filter(Boolean).slice(0, 4).map((url, i) => (
                        <img key={i} src={url} alt="" className="w-14 h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 italic">
                      {form.message?.slice(0, 60)}{form.message?.length > 60 ? '...' : ''}
                    </p>
                  </div>

                  {/* 스타일 정보 */}
                  {tmpl && (
                    <div className="px-4 pb-3 flex justify-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{cat?.icon} {cat?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{tmpl.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-500">{tmpl.fontFamily}</span>
                    </div>
                  )}
                </div>
              )
            })()}

            <button
              onClick={generate}
              disabled={saving}
              className="mt-8 w-full py-5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              {saving ? 'Đang tạo...' : <><Sparkles className="w-5 h-5" /> Tạo thiệp của tôi</>}
            </button>

            <button
              onClick={() => setStep(2)}
              className="mt-3 w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Quay lại
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
