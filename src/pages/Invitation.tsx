import React, { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatedPattern } from '../components/AnimatedPattern'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { MapPin, Calendar, Heart, ArrowLeft, Music, Music2, ChevronDown, Share2, Copy, Check, MessageCircle, Users, Printer, QrCode, MessageSquare, Download, Lock, Loader2, Globe, ExternalLink, Bell } from 'lucide-react'
import { getTemplateById, allTemplates } from '../lib/templates'
import { lunarDateFromStr } from '../lib/lunar'
import FrameDecoration from '../components/FrameDecoration'
import { QRCodeSVG } from 'qrcode.react'
import { vietQrUrl, VN_BANKS } from '../lib/vietqr'
import { supabase } from '../lib/supabase'
import WatermarkOverlay from '../components/WatermarkOverlay'
import { deriveInvitationId, checkPaymentStatus, buildCheckoutUrl, downloadInvitationCard } from '../lib/payment'
import { useOGMeta } from '../hooks/useOGMeta'
import { shareNative, shareZalo, shareFacebook, shareKakaoTalk, shareWhatsApp, shareTwitter, copyToClipboard } from '../lib/share'
import { t, type Locale, SUPPORTED_LOCALES, detectLocale } from '../lib/i18n'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined

function decodeShareUrl(encoded: string): Partial<InvitationData> | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - encoded.length % 4) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json)
  } catch { return null }
}

interface Milestone {
  date: string
  title: string
  desc: string
  photo?: string
}

interface InvitationData {
  groom: string
  bride: string
  groomParent: string
  brideParent: string
  date: string
  time: string
  venue: string
  mapUrl: string
  message: string
  heroPhoto: string
  gallery: string[]
  template: string
  bankGroom?: string
  bankBride?: string
  bankGroomId?: string
  bankGroomAccount?: string
  bankGroomName?: string
  bankBrideId?: string
  bankBrideAccount?: string
  bankBrideName?: string
  loveStory?: Milestone[]
  transport?: string
  phone?: string
  pickupTime?: string
  pickupLocation?: string
  pickupContact?: string
}

const demoData: Record<string, InvitationData> = {}

for (let idx = 0; idx < allTemplates.length; idx++) {
  const tmpl = allTemplates[idx]
  const couples = [
    { g: 'Nguyễn Văn Trang', b: 'Trần Thị Anh', gp: 'Ông Nguyễn Văn A & Bà Trần Thị B', bp: 'Ông Trần Văn C & Bà Lê Thị D', d: '15/12/2026', ti: '10:00', v: 'Nhà hàng Hoàng Gia, 123 Nguyễn Huệ, Q.1, TP.HCM' },
    { g: 'Lê Văn Minh', b: 'Phạm Thị Hoa', gp: 'Ông Lê Văn E & Bà Phạm Thị F', bp: 'Ông Phạm Văn G & Bà Trần Thị H', d: '20/01/2027', ti: '11:00', v: 'Trung tâm Hội nghị Diamond, 456 Lê Lợi, Q.3, TP.HCM' },
    { g: 'Hoàng Văn Tuấn', b: 'Ngô Thị Linh', gp: 'Ông Hoàng Văn I & Bà Ngô Thị J', bp: 'Ông Ngô Văn K & Bà Lê Thị L', d: '08/03/2027', ti: '17:30', v: 'Khu du lịch Sinh Thái Xanh, 789 Võ Văn Kiệt, Cần Thơ' },
    { g: 'Phạm Văn Nam', b: 'Lê Thị Hương', gp: 'Ông Phạm Văn M & Bà Lê Thị N', bp: 'Ông Lê Văn O & Bà Phạm Thị P', d: '25/06/2027', ti: '10:30', v: 'Khách sạn Rex, 141 Nguyễn Huệ, Q.1, TP.HCM' },
    { g: 'Trần Văn Đức', b: 'Nguyễn Thị Mai', gp: 'Ông Trần Văn Q & Bà Nguyễn Thị R', bp: 'Ông Nguyễn Văn S & Bà Trần Thị T', d: '10/07/2027', ti: '16:00', v: 'Nhà hàng Sen Vàng, 88 Láng Hạ, Hà Nội' },
    { g: 'Vũ Hoàng Long', b: 'Đinh Thị Thảo', gp: 'Ông Vũ Văn U & Bà Đinh Thị V', bp: 'Ông Đinh Văn W & Bà Vũ Thị X', d: '15/08/2027', ti: '10:00', v: 'Khu nghỉ dưỡng Ana Mandara, Đà Lạt' },
    { g: 'Đỗ Văn Huy', b: 'Trương Thị Ngọc', gp: 'Ông Đỗ Văn Y & Bà Trương Thị Z', bp: 'Ông Trương Văn A1 & Bà Đỗ Thị B1', d: '20/09/2027', ti: '17:00', v: 'Harmony Garden, 22 Trần Não, TP. Thủ Đức' },
    { g: 'Bùi Văn Tâm', b: 'Lý Thị Kiều', gp: 'Ông Bùi Văn C1 & Bà Lý Thị D1', bp: 'Ông Lý Văn E1 & Bà Bùi Thị F1', d: '12/10/2027', ti: '10:30', v: 'Trung tâm Hội nghị White Palace, 6/1 Thảo Điền, TP.HCM' },
    { g: 'Cao Văn Phát', b: 'Tăng Thị Ngân', gp: 'Ông Cao Văn G1 & Bà Tăng Thị H1', bp: 'Ông Tăng Văn I1 & Bà Cao Thị J1', d: '05/11/2027', ti: '11:00', v: 'Nhà hàng Vườn Mơ, 88 Mai Hắc Đế, Hà Nội' },
    { g: 'Lâm Văn Khang', b: 'Dương Thị Quyên', gp: 'Ông Lâm Văn K1 & Bà Dương Thị L1', bp: 'Ông Dương Văn M1 & Bà Lâm Thị N1', d: '18/12/2027', ti: '17:00', v: 'Saigon Riverside, 2B Tôn Đức Thắng, Q.1, TP.HCM' },
    { g: 'Ngô Văn Tiến', b: 'Hồ Thị Phượng', gp: 'Ông Ngô Văn O1 & Bà Hồ Thị P1', bp: 'Ông Hồ Văn Q1 & Bà Ngô Thị R1', d: '08/01/2028', ti: '10:00', v: 'Làng Sen Garden, 100/1 Nguyễn Văn Linh, Đà Nẵng' },
    { g: 'Trịnh Văn Bảo', b: 'Mai Thị Cúc', gp: 'Ông Trịnh Văn S1 & Bà Mai Thị T1', bp: 'Ông Mai Văn U1 & Bà Trịnh Thị V1', d: '22/02/2028', ti: '16:30', v: 'Nhà hàng Hoa Viên, 9 Lê Văn Sỹ, Q.3, TP.HCM' },
    { g: 'Huỳnh Văn Sang', b: 'Võ Thị Hồng', gp: 'Ông Huỳnh Văn W1 & Bà Võ Thị X1', bp: 'Ông Võ Văn Y1 & Bà Huỳnh Thị Z1', d: '10/03/2028', ti: '10:00', v: 'Trung tâm Hội nghị Riverside, 512 Hùng Vương, Cần Thơ' },
    { g: 'Kim Min Suk', b: 'Park Ji Eun', gp: 'Ông Kim Min Ho & Bà Lee Soo Jin', bp: 'Ông Park Jae Won & Bà Choi Mi Young', d: '25/04/2028', ti: '17:00', v: 'The Shilla Seoul, 249 Dongho-ro, Jung-gu, Seoul' },
    { g: 'Lee Dong Wook', b: 'Kang Soo Yeon', gp: 'Ông Lee Jae Hoon & Bà Kim Hye Sook', bp: 'Ông Kang Young Chul & Bà Yoon Mi Ra', d: '15/05/2028', ti: '10:30', v: 'Grand Walkerhill Seoul, 177 Walkerhill-ro, Gwangjin-gu' },
    { g: 'Choi Woo Hyuk', b: 'Jang Mi Na', gp: 'Ông Choi Sung Ho & Bà Bae Jung Hee', bp: 'Ông Jang Dae Hyun & Bà Oh Seung Hee', d: '30/06/2028', ti: '11:00', v: 'Paradise City, 186 Yeongjonghaeannam-ro, Jung-gu, Incheon' },
    { g: 'Hwang Ji Hoon', b: 'Yoon Seo Young', gp: 'Ông Hwang Ki Tae & Bà Seo In Sook', bp: 'Ông Yoon Sang Min & Bà Hong Jin Ae', d: '18/07/2028', ti: '16:00', v: 'Signiel Seoul, 300 Olympic-ro, Songpa-gu, Seoul' },
    { g: 'Từ Văn Quân', b: 'Thạch Thị Thơm', gp: 'Ông Từ Văn A2 & Bà Thạch Thị B2', bp: 'Ông Thạch Văn C2 & Bà Từ Thị D2', d: '08/08/2028', ti: '10:00', v: 'Nhà hàng Sen Hồng, 12 Nguyễn Đình Chiểu, Vũng Tàu' },
    { g: 'Lương Văn Hoàng', b: 'Đoàn Thị Mai', gp: 'Ông Lương Văn E2 & Bà Đoàn Thị F2', bp: 'Ông Đoàn Văn G2 & Bà Lương Thị H2', d: '20/09/2028', ti: '17:00', v: 'Saigon Opera House, 7 Công trường Lam Sơn, Q.1' },
    { g: 'Hà Văn Nhân', b: 'Trần Thị Kim', gp: 'Ông Hà Văn I2 & Bà Trần Thị J2', bp: 'Ông Trần Văn K2 & Bà Hà Thị L2', d: '10/10/2028', ti: '10:30', v: 'Nhà hàng Vườn Đào, 98 Hoàng Hoa Thám, Đà Lạt' },
    { g: 'Phùng Văn Lộc', b: 'Bạch Thị Ngà', gp: 'Ông Phùng Văn M2 & Bà Bạch Thị N2', bp: 'Ông Bạch Văn O2 & Bà Phùng Thị P2', d: '15/11/2028', ti: '11:00', v: 'White Swan Garden, 18A Cộng Hòa, Tân Bình, TP.HCM' },
  ]
  const c = couples[idx % couples.length]
    const demoLocale = detectLocale()
    const sampleMilestones: Milestone[] = [
      { date: t('milestone_month_3', demoLocale), title: t('milestone_1_title', demoLocale), desc: t('milestone_1_desc', demoLocale) },
      { date: t(idx % 2 === 0 ? 'milestone_month_7' : 'milestone_month_9', demoLocale), title: t('milestone_2_title', demoLocale), desc: t('milestone_2_desc', demoLocale) },
      { date: t('milestone_month_6', demoLocale), title: t('milestone_3_title', demoLocale), desc: t('milestone_3_desc', demoLocale) },
      { date: c.d, title: t('milestone_4_title', demoLocale), desc: t('milestone_4_desc', demoLocale) },
    ]
    demoData[tmpl.id] = {
    groom: c.g, bride: c.b, groomParent: c.gp, brideParent: c.bp,
    date: c.d, time: c.ti, venue: c.v,
    mapUrl: 'https://maps.google.com/',
    message: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi trong ngày trọng đại. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất của chúng tôi.',
    heroPhoto: '',
    gallery: [],
    template: tmpl.id,
    loveStory: sampleMilestones,
  }
}

function scheduleReminder(data: InvitationData | null) {
  if (!data || !('Notification' in window) || Notification.permission !== 'granted') return
  const [d, m, y] = data.date.split('/').map(Number)
  const target = new Date(y, m - 1, d, 8, 0, 0)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) {
    new Notification(t('reminder_title', 'vi'), {
      body: t('reminder_body', 'vi', data.groom, data.bride),
      icon: '/favicon.ico',
    })
    return
  }
  setTimeout(() => {
    new Notification(t('reminder_title', 'vi'), {
      body: t('reminder_body', 'vi', data.groom, data.bride),
      icon: '/favicon.ico',
    })
  }, Math.min(diff, 2147483647))
}

function getDday(targetDate: string, targetTime?: string): { days: number, hours: number } {
  const [d, m, y] = targetDate.split('/').map(Number)
  const [h, min] = (targetTime || '00:00').split(':').map(Number)
  const target = new Date(y, m - 1, d, h || 0, min || 0)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  }
}

function generateICS(data: InvitationData): string {
  const [d, m, y] = data.date.split('/').map(Number)
  const [hh, mm] = (data.time || '10:00').split(':').map(Number)
  const start = new Date(y, m - 1, d, hh, mm)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ThiepCuoi//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:Đám cưới ${data.groom} & ${data.bride}`,
    `LOCATION:${data.venue}`, `DESCRIPTION:${data.message}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

function SectionTitle({ icon, title, titleEn, color }: { icon: string; title: string; titleEn: string; color: string }) {
  return (
    <div className="text-center mb-8">
      <span className="text-2xl mb-2 block">{icon}</span>
      <h3 className={`text-xl font-bold ${color}`}>{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{titleEn}</p>
      <div className="w-12 h-0.5 bg-gray-200 mx-auto mt-3" />
    </div>
  )
}

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function DecorativeWaves() {
  return (
    <>
      <div className="absolute left-0 top-0 bottom-0 w-14 overflow-hidden pointer-events-none z-10 opacity-40">
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '0s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M30,0 Q15,25 30,50 Q15,75 30,100 Q15,125 30,150 Q15,175 30,200" stroke={`url(#waveGradL)`} strokeWidth="2.5" />
        </svg>
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '-2s', animationDuration: '10s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M30,5 Q12,30 28,55 Q12,80 28,105 Q12,130 28,155 Q12,180 28,200" stroke={`url(#waveGradL)`} strokeWidth="1.5" opacity="0.5" />
        </svg>
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '-4s', animationDuration: '12s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M30,10 Q18,30 30,60 Q18,90 30,110 Q18,140 30,170 Q18,190 30,200" stroke={`url(#waveGradL)`} strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-14 overflow-hidden pointer-events-none z-10 opacity-40">
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '-1s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M0,0 Q15,25 0,50 Q15,75 0,100 Q15,125 0,150 Q15,175 0,200" stroke={`url(#waveGradR)`} strokeWidth="2.5" />
        </svg>
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '-3s', animationDuration: '10s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M0,5 Q18,30 2,55 Q18,80 2,105 Q18,130 2,155 Q18,180 0,200" stroke={`url(#waveGradR)`} strokeWidth="1.5" opacity="0.5" />
        </svg>
        <svg className="absolute w-full h-full animate-wave-slide" style={{ animationDelay: '-5s', animationDuration: '12s' }} viewBox="0 0 30 200" preserveAspectRatio="none" fill="none">
          <path d="M0,10 Q12,30 0,60 Q12,90 0,110 Q12,140 0,170 Q12,190 0,200" stroke={`url(#waveGradR)`} strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <linearGradient id="waveGradL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="20%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="80%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveGradR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="20%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="80%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </>
  )
}


function parseCustomDate(dateStr: string): string {
  if (!dateStr) return 'Chưa rõ'
  if (dateStr.includes('/')) return dateStr
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(6,8)}/${dateStr.slice(4,6)}/${dateStr.slice(0,4)}`
  }
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    }
  } catch { /* fall through */ }
  return dateStr
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs text-white hover:bg-white/30 transition-colors">
        <span>{SUPPORTED_LOCALES.find(l => l.code === locale)?.flag}</span>
        <span className="text-[10px]">{SUPPORTED_LOCALES.find(l => l.code === locale)?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] z-50">
          {SUPPORTED_LOCALES.map(l => (
            <button key={l.code} onClick={() => { onChange(l.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                locale === l.code ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-600'
              }`}>
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Invitation() {
  const { slug, d: encodedData } = useParams<{ slug?: string; d?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const langParam = searchParams.get('lang') as Locale | null
  const [locale, setLocale] = useState<Locale>(langParam && SUPPORTED_LOCALES.some(l => l.code === langParam) ? langParam : detectLocale())

  const changeLocale = (l: Locale) => {
    setLocale(l)
    const params = new URLSearchParams(searchParams.toString())
    if (l !== 'vi') params.set('lang', l)
    else params.delete('lang')
    setSearchParams(params, { replace: true })
  }

  const [customData, setCustomData] = useState<InvitationData | null>(null)
  const [customLoading, setCustomLoading] = useState(true)
  const isShared = !!encodedData                      // /v/:d route — shareable URL
  const isCustom = isShared || slug === 'custom-invitation'  // free-tier (both types)

  const location = useLocation()

  useEffect(() => {
    if (isShared && encodedData) {
      // Decode text data from URL, use navigate state for photos (same device)
      const decoded = decodeShareUrl(encodedData)
      const stateData = (location.state as any)?.invitationData
      if (decoded) {
        const dateStr = typeof decoded.date === 'string' ? decoded.date : ''
        const photos = stateData || {}
        const base: InvitationData = {
          groom: '', bride: '', groomParent: '', brideParent: '',
          date: '', time: '', venue: '', mapUrl: 'https://maps.google.com/',
          message: '', heroPhoto: '/photos/hero.jpg', gallery: [], template: 'classic-red',
        }
        const ls = decoded.loveStory
        setCustomData({
          ...base,
          ...decoded,
          date: dateStr.includes('/') ? dateStr : parseCustomDate(dateStr),
          heroPhoto: photos.heroPhoto || decoded.heroPhoto || '/photos/hero.jpg',
          gallery: photos.gallery?.filter(Boolean)?.length ? photos.gallery : [],
          mapUrl: decoded.mapUrl || 'https://maps.google.com/',
          loveStory: Array.isArray(ls) && ls.length > 0 ? ls : undefined,
        })
      }
      setCustomLoading(false)
    } else if (isCustom) {
      const stateData = (location.state as any)?.invitationData
      const raw = stateData ? JSON.stringify(stateData) : localStorage.getItem('thiepcuoi_custom')
      try {
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          const dateStr = typeof parsed.date === 'string' ? parsed.date : ''
          setCustomData({
            ...parsed,
            template: parsed.template || 'classic-red',
            mapUrl: parsed.mapUrl || 'https://maps.google.com/',
            date: dateStr.includes('/') ? dateStr : parseCustomDate(dateStr),
            heroPhoto: parsed.heroPhoto || '/photos/hero.jpg',
            gallery: parsed.gallery?.filter(Boolean)?.length ? parsed.gallery : ['/photos/gallery-1.jpg', '/photos/gallery-2.jpg', '/photos/gallery-3.jpg', '/photos/gallery-4.jpg'],
          })
        }
      } catch { /* parse failed */ }
      setCustomLoading(false)
    } else {
      setCustomLoading(false)
    }
  }, [isShared, isCustom, encodedData, location.state])

  let data = isCustom ? customData : (slug ? demoData[slug] : null)
  const theme = isCustom
    ? (getTemplateById(data?.template || '') || getTemplateById('classic-red'))
    : (slug ? getTemplateById(slug) : undefined)
  const [musicOn, setMusicOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestCount, setGuestCount] = useState('1')
  const [guestMessage, setGuestMessage] = useState('')
  const [transport, setTransport] = useState('self')
  const [phone, setPhone] = useState('')
  const [rsvpSent, setRsvpSent] = useState(false)
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false)
  const [showBank, setShowBank] = useState(false)
  const [guestbook, setGuestbook] = useState<{ name: string; msg: string }[]>([])
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'granted' | 'denied' | 'scheduled'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPreview = searchParams.get('preview') === '1'

  // ── 결제 상태 ────────────────────────────────────────────────────────────
  const invitationId = encodedData ? deriveInvitationId(encodedData) : ''
  const [isPaid, setIsPaid] = useState(false)
  const [payCheckDone, setPayCheckDone] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [heroIdx, setHeroIdx] = useState(0)
  const [showQr, setShowQr] = useState(false)
  const [showShare, setShowShare] = useState(false)

  if (data && isPreview) {
    const pg = searchParams.get('groom')
    const pb = searchParams.get('bride')
    const pd = searchParams.get('date')
    if (pg || pb || pd) {
      data = { ...data, ...(pg ? { groom: pg, groomParent: '' } : {}), ...(pb ? { bride: pb, brideParent: '' } : {}), ...(pd ? { date: pd } : {}) }
    }
  }

  const heroPhotos = data ? [data.heroPhoto, ...data.gallery].filter(Boolean) : []
  const hasSlideshow = heroPhotos.length >= 2

  useEffect(() => {
    if (!hasSlideshow) return
    const timer = setInterval(() => setHeroIdx(prev => (prev + 1) % heroPhotos.length), 5000)
    return () => clearInterval(timer)
  }, [hasSlideshow, heroPhotos.length])

  const dday = data ? getDday(data.date, data.time) : { days: 0, hours: 0 }
  const lunarDateStr = useMemo(() => lunarDateFromStr(data?.date ?? ''), [data?.date])
  const colorClass = theme?.accent || 'text-red-500'
  const bgColorClass = colorClass.replace('text-', 'bg-')
  const accentStroke = theme?.accentHex ?? '#fca5a5'
  const secondaryStroke = theme?.fontColorSecondaryHex ?? '#fca5a5'
  const decorativeFontClass = theme?.fontFamily === 'serif' ? 'font-serif' : ''

  // 히어로 사진이 있으면 글자를 흰색으로 고정 (어두운 오버레이 위에서 가독성 확보)
  const hasHeroPhoto = heroPhotos.length > 0
  const heroFontColor    = hasHeroPhoto ? 'text-white drop-shadow-md' : (theme?.fontColor ?? 'text-gray-800')
  const heroSecondary    = hasHeroPhoto ? 'text-white/75'             : (theme?.fontColorSecondary ?? 'text-gray-400')
  const heroAccentStroke = hasHeroPhoto ? '#ffffff'                   : accentStroke
  const heroSecStroke    = hasHeroPhoto ? 'rgba(255,255,255,0.6)'     : secondaryStroke

  // ── 긴 텍스트 자동 축소 계산 ─────────────────────────────────────────────
  // Unicode aware length (베트남어 복합 글자 단위)
  const uniLen = (s: string) => [...s].length

  // 히어로 섹션: 표시 이름 = groom/bride 마지막 단어
  const groomDisplay = useMemo(() => (data?.groom ?? '').split(' ').pop() ?? '', [data?.groom])
  const brideDisplay = useMemo(() => (data?.bride ?? '').split(' ').pop() ?? '', [data?.bride])
  const heroDisplayLen = uniLen(groomDisplay) + uniLen(brideDisplay)

  // 히어로 이름 폰트 크기: 두 이름 합계 기준
  const heroNameFontClass = heroDisplayLen > 20 ? 'text-2xl'
    : heroDisplayLen > 14 ? 'text-3xl' : 'text-4xl'

  // 웰컴 섹션: 전체 이름 표시 → 긴 경우 폰트 축소
  const groomNameFontClass = uniLen(data?.groom ?? '') > 16 ? 'text-xl' : 'text-2xl'
  const brideNameFontClass = uniLen(data?.bride ?? '') > 16 ? 'text-xl' : 'text-2xl'

  // ── 결제 상태 조회 + ?paid=ok 폴링 ─────────────────────────────────────
  useEffect(() => {
    if (!invitationId) { setPayCheckDone(true); return }

    const check = async () => {
      const paid = await checkPaymentStatus(invitationId)
      setIsPaid(paid)
      setPayCheckDone(true)
      return paid
    }

    check().then(paid => {
      // 결제 완료 후 리다이렉트로 돌아온 경우 → 웹훅 처리 대기 후 재조회
      if (!paid && searchParams.get('paid') === 'ok') {
        let attempts = 0
        const MAX = 12
        const poll = async () => {
          attempts++
          const confirmed = await checkPaymentStatus(invitationId)
          if (confirmed) { setIsPaid(true); return }
          if (attempts < MAX) setTimeout(poll, 2500)
        }
        setTimeout(poll, 1500)
      }
    })
  }, [invitationId])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas HD 다운로드 핸들러 ─────────────────────────────────────────
  const handleDownload = async () => {
    if (!data || !theme) return
    setDownloading(true)
    try {
      await downloadInvitationCard({
        groom:    data.groom,
        bride:    data.bride,
        date:     data.date,
        time:     data.time,
        venue:    data.venue,
        heroPhoto: data.heroPhoto || '',
        accentHex:             theme.accentHex,
        fontColorHex:          theme.fontColorHex,
        fontColorSecondaryHex: theme.fontColorSecondaryHex,
      }, `thiep-cuoi-${data.groom}-${data.bride}`.replace(/\s+/g, '-'))
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  useEffect(() => {
    const audio = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/bkSejUIn16rStHrC7NHp4j4DhWGKd1ICwI5DPDvw.mp3')
    audio.loop = true
    audioRef.current = audio

    audio.play().then(() => {
      setMusicOn(true)
    }).catch(() => {
      // 브라우저 자동재생 차단 시 첫 터치/클릭에 시작
      const start = () => {
        audio.play().then(() => setMusicOn(true)).catch(() => {})
      }
      document.addEventListener('click', start, { once: true })
      document.addEventListener('touchstart', start, { once: true })
    })

    return () => { audio.pause(); audioRef.current = null }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicOn) { audioRef.current.pause(); setMusicOn(false) }
    else { audioRef.current.play().catch(() => {}); setMusicOn(true) }
  }

  const shareUrl = () => {
    if (typeof navigator.share === 'function') {
      shareNative(`Thiệp cưới - ${data?.groom} & ${data?.bride}`, window.location.href)
    } else { setShowShare(true) }
  }
  const copyUrl = () => {
    copyToClipboard(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const printInvitation = () => window.print()

  const saveToCalendar = () => {
    if (!data) return
    const ics = generateICS(data)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `wedding-${data.groom}-${data.bride}.ics`
    a.click(); URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!supabase || !data) return
    const ref = encodedData ?? slug ?? 'unknown'
    supabase.from('rsvp').select('guest_name, message').eq('invitation_ref', ref)
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data: rows }) => {
        if (rows) setGuestbook(rows.map(r => ({ name: r.guest_name, msg: r.message ?? '' })).filter(r => r.msg))
      })
  }, [data, encodedData, slug])

  const submitRsvp = async () => {
    if (!guestName) return
    setRsvpSubmitting(true)
    if (supabase) {
      await supabase.from('rsvp').insert({
        invitation_ref: encodedData ?? slug ?? 'unknown',
        groom: data?.groom ?? '',
        bride: data?.bride ?? '',
        guest_name: guestName,
        guest_count: parseInt(guestCount) || 1,
        message: guestMessage,
        transport: transport,
        phone: phone || null,
      })
    }
    setRsvpSubmitting(false)
    setRsvpSent(true)
    if (guestMessage) setGuestbook(prev => [{ name: guestName, msg: guestMessage }, ...prev])
  }

  // ── 동적 OG 메타태그 ──────────────────────────────────────────────────────
  const ogImageUrl = useMemo(() => {
    if (!SUPABASE_URL || !data) return '/og-image.png'
    const base = `${SUPABASE_URL}/functions/v1/og-image`
    if (encodedData) return `${base}?d=${encodeURIComponent(encodedData)}`
    const params = new URLSearchParams({
      groom: data.groom,
      bride: data.bride,
      date:  data.date,
      venue: data.venue,
      theme: slug || data.template || 'classic-red',
    })
    return `${base}?${params.toString()}`
  }, [encodedData, data, slug])

  useOGMeta({
    title: data
      ? `Lễ cưới ${data.groom} & ${data.bride}`
      : 'Thiệp Cưới Online',
    description: data
      ? `Trân trọng kính mời tham dự lễ cưới ngày ${data.date} tại ${data.venue}`
      : 'Tạo thiệp cưới online đẹp, sang trọng.',
    imageUrl: ogImageUrl,
  })

  if (customLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Heart className="w-10 h-10 text-red-300 animate-pulse" />
      </div>
    )
  }

  if (!data || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('not_found', locale)}</h1>
          {isCustom ? (
            <>
              <p className="text-gray-500 mb-4">{t('not_found_create', locale)}</p>
              <Link to="/create" className="inline-block px-6 py-3 bg-red-500 text-white font-bold rounded-2xl text-sm hover:bg-red-600">
                {t('create_new', locale)}
              </Link>
            </>
          ) : (
            <p className="text-gray-500 mb-4">{t('not_found_desc', locale)}</p>
          )}
          <div className="mt-4">
            <Link to="/" className="text-red-500 font-semibold text-sm hover:underline">{t('back_home', locale)}</Link>
          </div>
        </div>
      </div>
    )
  }

  const isDemo = !isCustom

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center print:bg-white">
      <AnimatedPattern id={theme.pattern} color={theme.patternColor} />

      <div className="w-full max-w-md mx-auto bg-white min-h-screen relative print:max-w-full print:shadow-none">

        {/* ── 데모 배너 ── */}
        {isDemo && (
          <div className={`${isPreview ? 'sticky bottom-0' : 'fixed bottom-0 left-0 right-0'} z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 flex items-center justify-between print-hidden`}>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">{t('demo_banner', locale)} · {theme.name}</p>
              <p className="text-xs text-gray-600">{t('demo_banner2', locale)}</p>
            </div>
            <Link to={`/create?template=${slug}`}
              className="shrink-0 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all">
              {t('use_template', locale)}
            </Link>
          </div>
        )}

        {/* ── 결제 전 배너 (미결제 공유 초대장) ── */}
        {isShared && payCheckDone && !isPaid && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-xl border-t border-red-100 px-4 py-3 print-hidden shadow-[0_-4px_24px_rgba(220,38,38,0.10)]">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                  {t('download_hd', locale)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t('download_unlock', locale)}</p>
              </div>
              <a
                href={buildCheckoutUrl(invitationId) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { if (!buildCheckoutUrl(invitationId)) e.preventDefault() }}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-200"
              >
                <Download className="w-3.5 h-3.5" />
                99.000 ₫
              </a>
            </div>
          </div>
        )}

        {/* ── 결제 완료 배너 (다운로드 버튼) ── */}
        {isShared && isPaid && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-xl border-t border-green-100 px-4 py-3 print-hidden shadow-[0_-4px_24px_rgba(34,197,94,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-500 shrink-0" />
                  {t('download_paid', locale)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t('download_hd_desc', locale)}</p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-200"
              >
                {downloading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Download className="w-3.5 h-3.5" />}
                  {downloading ? t('downloading', locale) : t('download_btn', locale)}
              </button>
            </div>
          </div>
        )}

        {/* ── 음악 버튼 (위치는 하단 배너 유무에 따라 조정) ── */}
        {!isPreview ? (
          <button onClick={toggleMusic}
            className={`fixed z-50 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all print-hidden ${(isDemo || (isShared && payCheckDone)) ? 'bottom-20 right-4' : 'bottom-6 right-6'}`}
          >
            {musicOn ? <Music2 className={`w-5 h-5 ${colorClass}`} /> : <Music className="w-5 h-5 text-gray-400" />}
          </button>
        ) : null}

        {/* ── 워터마크: 미결제 공유 초대장에만 표시 ── */}
        {isShared && payCheckDone && !isPaid && <WatermarkOverlay />}

        {/* Print styles */}
        <style>{`
          @media print {
            @page { margin: 0.5cm; size: A5 portrait; }
            .print-hidden { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-section { page-break-inside: avoid; }
          }
          @keyframes watermark-drift {
            0%   { transform: rotate(-30deg) translateY(0px) scale(1); opacity: 0.07; }
            33%  { transform: rotate(-30deg) translateY(-12px) scale(1.03); opacity: 0.10; }
            66%  { transform: rotate(-30deg) translateY(8px) scale(0.98); opacity: 0.06; }
            100% { transform: rotate(-30deg) translateY(0px) scale(1); opacity: 0.07; }
          }
          .watermark-float { animation: watermark-drift 6s ease-in-out infinite; }
          .print-watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}</style>

        {/* ===== HERO — 진짜 청첩장 스타일 ===== */}
        <div id="section-hero" className="relative h-screen flex flex-col overflow-hidden print:h-auto print:min-h-[70vh]">
          {/* Wave decorations on both sides */}
          <div className={`${colorClass}`}>
            <DecorativeWaves />
          </div>

          {/* GIF 감지 */}
          {(() => {
            const heroSrc = heroPhotos[0] || ''
            const isGif = heroSrc.startsWith('data:image/gif') || heroSrc.toLowerCase().endsWith('.gif')
            return isGif ? (
              <div className="absolute inset-0">
                <img src={heroSrc} alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
              </div>
            ) : null
          })()}

          {/* Slideshow background layers (non-GIF) */}
          {!heroPhotos[0]?.startsWith('data:image/gif') && !heroPhotos[0]?.toLowerCase().endsWith('.gif') && (
            <div className="absolute inset-0">
              {hasSlideshow ? (
                heroPhotos.map((photo, i) => (
                  <div key={i}
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                    style={{
                      backgroundImage: `url(${photo})`,
                      opacity: i === heroIdx ? 1 : 0,
                      transform: i === heroIdx ? 'scale(1)' : 'scale(1.08)',
                    }}
                  />
                ))
              ) : (
                <div className={`absolute inset-0 ${theme.cardBg}`} />
              )}
              {/* Lighter gradient for card feel */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            </div>
          )}

          {/* Photo frame overlay — for non-GIF slideshow */}
          {hasSlideshow && !heroPhotos[0]?.startsWith('data:image/gif') && !heroPhotos[0]?.toLowerCase().endsWith('.gif') && (
            <div className="absolute inset-8 top-16 bottom-20 z-10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl pointer-events-none">
              {heroPhotos.map((photo, i) => (
                <div key={i}
                  className="absolute inset-0 bg-cover bg-center transition-all"
                  style={{
                    backgroundImage: `url(${photo})`,
                    opacity: i === heroIdx ? 0.5 : 0,
                    transform: i === heroIdx ? 'scale(1)' : 'scale(1.05)',
                    transitionDuration: '1.5s',
                  }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          )}

          {/* Slideshow dot indicator (non-GIF) */}
          {hasSlideshow && !heroPhotos[0]?.startsWith('data:image/gif') && !heroPhotos[0]?.toLowerCase().endsWith('.gif') && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 print-hidden">
              {heroPhotos.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === heroIdx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 구조적 SVG 프레임 장식 (한국 라인아트 / 베트남 골드 / 서양 수채화) */}
          {theme.frameVariant && (
            <FrameDecoration
              variant={theme.frameVariant}
              color={theme.frameColor ?? '#d4af37'}
            />
          )}

          <Link to="/" className="absolute top-12 left-4 z-30 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors print-hidden">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>

          <div className="absolute top-12 right-4 z-30 flex gap-2 items-center print-hidden">
            <LanguageSwitcher locale={locale} onChange={changeLocale} />
            <button onClick={printInvitation} className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
              <Printer className="w-4 h-4 text-white" />
            </button>
            <button onClick={shareUrl} className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-20 px-8 print:py-16 print:flex print:relative">
            {/* Decorative top border */}
            <div className="flex items-center gap-3 mb-5">
              <svg className="w-12 h-3 overflow-visible" viewBox="0 0 48 8" fill="none">
                <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={heroSecStroke} strokeWidth="0.7" opacity="0.5" />
              </svg>
              <span className={`text-xs font-light tracking-[0.3em] ${heroSecondary} ${decorativeFontClass}`}>{t('hero.wedding', locale)}</span>
              <svg className="w-12 h-3 overflow-visible" viewBox="0 0 48 8" fill="none">
                <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={heroSecStroke} strokeWidth="0.7" opacity="0.5" />
              </svg>
            </div>
            <span className="text-5xl mb-4 text-white/80 drop-shadow-lg">{theme.icon}</span>
            {/* Decorative wave divider */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-16 h-4" viewBox="0 0 64 8" fill="none">
                <path d="M0,4 Q8,0 16,4 Q24,8 32,4 Q40,0 48,4 Q56,8 64,4" stroke={heroAccentStroke} strokeWidth="0.8" opacity="0.6" />
              </svg>
              <svg className="w-5 h-5 animate-float" viewBox="0 0 24 24" fill="none" stroke={heroAccentStroke} strokeWidth="1.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <svg className="w-16 h-4" viewBox="0 0 64 8" fill="none">
                <path d="M0,4 Q8,0 16,4 Q24,8 32,4 Q40,0 48,4 Q56,8 64,4" stroke={heroAccentStroke} strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
            <p className={`text-xs font-light tracking-[0.3em] ${heroSecondary} ${decorativeFontClass} mb-3`}>{t('hero.invitation', locale)}</p>
            <h1 className={`${heroNameFontClass} font-bold ${heroFontColor} ${decorativeFontClass} text-center leading-tight break-words hyphens-auto max-w-xs`}>
              {groomDisplay}
              <span className={`mx-3 ${hasHeroPhoto ? 'text-white/90' : theme.accent}`}>&</span>
              {brideDisplay}
            </h1>
            <p className={`text-sm mt-4 ${heroSecondary} opacity-80 text-center`}>{data.date}</p>
            {/* Decorative bottom border */}
            <div className="flex items-center gap-3 mt-6">
              <svg className="w-10 h-3" viewBox="0 0 40 8" fill="none">
                <path d="M0,4 Q10,0 20,4 Q30,8 40,4" stroke={heroSecStroke} strokeWidth="0.7" opacity="0.4" />
              </svg>
              <span className={`text-[8px] tracking-[0.4em] uppercase ${decorativeFontClass}`} style={{ color: heroSecStroke, opacity: 0.5 }}>{t('love', locale).toUpperCase()}</span>
              <svg className="w-10 h-3" viewBox="0 0 40 8" fill="none">
                <path d="M0,4 Q10,0 20,4 Q30,8 40,4" stroke={heroSecStroke} strokeWidth="0.7" opacity="0.4" />
              </svg>
            </div>
            <div className="absolute bottom-12 animate-bounce print-hidden">
              <ChevronDown className={`w-6 h-6 ${theme.fontColorSecondary} opacity-50`} />
            </div>
          </div>
        </div>

        {/* ===== WELCOME ===== */}
        <section id="section-welcome" className="px-6 py-16 text-center print-section">
          <AnimatedSection>
            <SectionTitle icon="💌" title={t('section.welcome', locale)} titleEn={t('section.welcome.en', locale)} color={colorClass} />
            <p className={`${groomNameFontClass} font-bold text-gray-800 mb-2 break-words hyphens-auto text-center`}>{data.groom}</p>
            {data.groomParent && <p className="text-gray-400 text-sm mb-1 break-words text-center">Con trai {data.groomParent}</p>}
            <div className="flex justify-center my-4"><Heart className="w-5 h-5 text-gray-300" /></div>
            <p className={`${brideNameFontClass} font-bold text-gray-800 mb-2 break-words hyphens-auto text-center`}>{data.bride}</p>
            {data.brideParent && <p className="text-gray-400 text-sm mb-8 break-words text-center">Con gái {data.brideParent}</p>}
            <p className="text-gray-600 leading-relaxed text-sm max-w-xs mx-auto">{data.message}</p>
          </AnimatedSection>
        </section>

        {/* ===== LOVE STORY TIMELINE ===== */}
        {data.loveStory && data.loveStory.length > 0 && (
          <section id="section-lovestory" className="px-6 py-16 bg-gray-50 print-section">
            <AnimatedSection delay={80}>
              <SectionTitle icon="💕" title="Chuyện Tình Yêu" titleEn="Love Story" color={colorClass} />
              <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
                {data.loveStory.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${bgColorClass || 'bg-red-500'}`} />
                    </div>
                    {m.photo && (
                      <img src={m.photo} alt="" className="w-full aspect-[16/9] object-cover rounded-xl mb-2" loading="lazy" />
                    )}
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{m.date}</p>
                    <p className={`font-bold text-sm mt-0.5 ${colorClass}`}>{m.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== COUNTDOWN ===== */}
        <section id="section-countdown" className="px-6 py-12 bg-gradient-to-r from-red-50 via-white to-red-50 print-section">
          <AnimatedSection delay={100}>
            <SectionTitle icon="📅" title={t('section.countdown', locale)} titleEn={t('section.countdown.en', locale)} color={colorClass} />
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${colorClass}`}>{dday.days}</div>
                <div className="text-xs text-gray-400 mt-1">{t('days', locale)}</div>
              </div>
              <div className={`text-4xl font-light ${colorClass}`}>:</div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${colorClass}`}>{dday.hours}</div>
                <div className="text-xs text-gray-400 mt-1">{t('hours', locale)}</div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {data.date} ({t('time', locale).toLowerCase()} {data.time})
            </p>
            {lunarDateStr && (
              <p className="text-center text-xs text-gray-400 mt-1 italic">
                {lunarDateStr}
              </p>
            )}
          </AnimatedSection>
        </section>

        {/* ===== DETAILS ===== */}
        <section id="section-details" className="px-6 py-16 print-section">
          <AnimatedSection delay={200}>
            <SectionTitle icon="🎊" title={t('section.details', locale)} titleEn={t('section.details.en', locale)} color={colorClass} />
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className={`w-12 h-12 ${bgColorClass || 'bg-red-100'} rounded-xl flex items-center justify-center shrink-0`}>
                  <Calendar className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('time', locale)}</p>
                  <p className="font-semibold text-gray-800">{data.date} — {data.time}</p>
                </div>
              </div>
              <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors">
                <div className={`w-12 h-12 ${bgColorClass || 'bg-red-100'} rounded-xl flex items-center justify-center shrink-0`}>
                  <MapPin className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{t('location', locale)}</p>
                  <p className="font-semibold text-gray-800 text-sm break-words">{data.venue}</p>
                </div>
              </a>
            </div>
            {/* Google Maps iframe embed */}
            <div className="mt-5 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
              <iframe
                title="Bản đồ địa điểm tổ chức"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(data.venue)}&output=embed&hl=vi&z=16`}
                className="w-full h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* Overlay nút mở full map */}
              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(data.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors print-hidden"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                {t('view_map', locale)}
              </a>
            </div>

            {/* Nút hành động */}
            <div className="mt-4 flex gap-2.5 print-hidden">
              <a
                href={`https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all ${bgColorClass || 'bg-red-500'} hover:opacity-90 flex items-center justify-center gap-2 shadow-sm`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                {t('directions', locale)}
              </a>
              <button
                onClick={saveToCalendar}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                {t('save_calendar', locale)}
              </button>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== GALLERY ===== */}
        <section id="section-gallery" className="px-6 py-16 bg-gray-50 print-section">
          <AnimatedSection delay={300}>
            <SectionTitle icon="📸" title={t('section.gallery', locale)} titleEn={t('section.gallery.en', locale)} color={colorClass} />
            <div className="grid grid-cols-2 gap-3">
              {data.gallery.length > 0 ? data.gallery.map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-2xl hover:opacity-90 transition-opacity hover:scale-[1.02] duration-500" loading="lazy" />
              )) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`aspect-[3/4] rounded-2xl ${theme.cardBg} opacity-40 flex items-center justify-center`}>
                    <Heart className={`w-8 h-8 ${theme.accent || 'text-red-300'}`} />
                  </div>
                ))
              )}
            </div>
          </AnimatedSection>
        </section>

        {/* ===== BANK ===== */}
        <section id="section-bank" className="px-6 py-16 print-section">
          <AnimatedSection delay={400}>
            <SectionTitle icon="🧧" title={t('section.bank', locale)} titleEn={t('section.bank.en', locale)} color={colorClass} />
            <p className="text-center text-sm text-gray-500 mb-4">{t('bank_thanks', locale)}</p>
            <button onClick={() => setShowBank(!showBank)}
              className={`w-full py-4 rounded-2xl font-bold text-sm border-2 transition-all ${showBank ? `${colorClass.replace('text-', 'border-') || 'border-red-500'} bg-red-50` : 'border-gray-200 text-gray-600'}`}>
              {t('bank_view', locale)} {showBank ? '▲' : '▼'}
            </button>
            {showBank && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {([
                  { side: 'Groom', label: t('bank_groom', locale), bankText: data.bankGroom, bankId: data.bankGroomId, account: data.bankGroomAccount, holderName: data.bankGroomName, parent: data.groomParent },
                  { side: 'Bride',  label: t('bank_bride', locale),  bankText: data.bankBride, bankId: data.bankBrideId, account: data.bankBrideAccount, holderName: data.bankBrideName, parent: data.brideParent },
                ]).map(({ side, label, bankText, bankId, account, holderName, parent }) => {
                  const hasQr = bankId && account && holderName
                  const displayText = bankText || (hasQr ? `${VN_BANKS.find(b=>b.id===bankId)?.short || ''}: ${account}` : 'Bank: 1234 5678 9012')
                  return (
                    <div key={side} className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 mb-2">{label}</p>
                      {hasQr && (
                        <div className="flex justify-center mb-3">
                          <img
                            src={vietQrUrl(bankId!, account!, holderName!)}
                            alt="VietQR"
                            className="w-40 h-40 object-contain rounded-xl border border-gray-100 bg-white"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      )}
                      <p className="font-bold text-gray-800 text-sm">{displayText}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{parent}</p>
                      <button onClick={() => copyToClipboard(account || displayText)} className="mt-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                        {copied ? <><Check className="w-3 h-3" /> {t('bank_copied', locale)}</> : <><Copy className="w-3 h-3" /> {t('bank_copy', locale)}</>}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </AnimatedSection>
        </section>

        {/* ===== RSVP ===== */}
        <section id="section-rsvp" className="px-6 py-16 bg-gray-50 print-section">
          <AnimatedSection delay={500}>
            <SectionTitle icon="💬" title={t('section.rsvp', locale)} titleEn={t('section.rsvp.en', locale)} color={colorClass} />
            {rsvpSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-800">{t('rsvp_sent', locale)}</p>
                <p className="text-sm text-gray-500">{t('rsvp_sent_desc', locale)}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={t('guest_name', locale)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                <div className="flex gap-3">
                  <input value={guestCount} onChange={e => setGuestCount(e.target.value)} type="number" min="1" max="10" placeholder={t('guest_count', locale)} className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                  <select value={guestCount} onChange={e => setGuestCount(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm text-gray-600">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {t('persons', locale)}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <select value={transport} onChange={e => setTransport(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm text-gray-600">
                    <option value="self">{t('transport_self', locale)}</option>
                    <option value="together">{t('transport_together', locale)}</option>
                  </select>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('phone', locale)} type="tel" className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                </div>
                {transport === 'together' && (
                  <div className="p-3 bg-amber-50 rounded-xl text-xs text-gray-600 space-y-1">
                    <p className="font-semibold">{t('pickup_info', locale)}</p>
                    <p>{t('pickup_time', locale)}: {data.pickupTime || '08:00'}</p>
                    <p>{t('pickup_location', locale)}: {data.pickupLocation || '—'}</p>
                    <p>{t('pickup_contact', locale)}: {data.pickupContact || '—'}</p>
                  </div>
                )}
                <textarea value={guestMessage} onChange={e => setGuestMessage(e.target.value)} placeholder={t('guest_message', locale)} rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm resize-none" />
                <button onClick={submitRsvp} disabled={!guestName || rsvpSubmitting}
                  className={`w-full py-4 rounded-2xl font-bold text-sm text-white transition-all disabled:bg-gray-300 ${bgColorClass || 'bg-red-500'} hover:opacity-90 flex items-center justify-center gap-2`}>
                  <MessageCircle className="w-4 h-4" /> {rsvpSubmitting ? t('sending', locale) : t('send', locale)}
                </button>
              </div>
            )}
          </AnimatedSection>
        </section>

        {/* ===== GUEST BOOK ===== */}
        <section id="section-guestbook" className="px-6 py-16 print-section">
          <AnimatedSection delay={600}>
            <SectionTitle icon="📖" title={t('section.guestbook', locale)} titleEn={t('section.guestbook.en', locale)} color={colorClass} />
            <div className="space-y-4">
              {guestbook.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">{t('guestbook_empty', locale)}</p>
              ) : guestbook.map((g, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{g.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-10">{g.msg}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ===== ACTION BUTTONS ===== */}
        <section className="px-6 py-8 bg-gray-50 print-hidden">
          <div className="grid grid-cols-3 gap-3">
            <button onClick={saveToCalendar} className="p-3 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <Calendar className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-600">{t('save_calendar', locale)}</span>
            </button>
            <button onClick={printInvitation} className="p-3 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <Printer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-600">{t('print', locale)}</span>
            </button>
            <button onClick={() => setShowShare(true)} className="p-3 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <Share2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-600">{t('share', locale)}</span>
            </button>
            <button onClick={() => setShowQr(true)} className="p-3 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <QrCode className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-gray-600">{t('qr_code', locale)}</span>
            </button>
            <button onClick={() => {
              if (!('Notification' in window)) return
              if (Notification.permission === 'granted') {
                scheduleReminder(data)
                setReminderStatus('scheduled')
              } else if (Notification.permission === 'denied') {
                setReminderStatus('denied')
              } else {
                Notification.requestPermission().then(perm => {
                  if (perm === 'granted') { scheduleReminder(data); setReminderStatus('scheduled') }
                  else setReminderStatus('denied')
                })
              }
            }} className={`p-3 bg-white rounded-2xl border transition-all text-center ${
              reminderStatus === 'scheduled' ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-amber-200'
            }`}>
              <span className={`w-5 h-5 mx-auto mb-1 flex items-center justify-center ${
                reminderStatus === 'scheduled' ? 'text-green-500' : reminderStatus === 'denied' ? 'text-gray-400' : 'text-amber-400'
              }`}>
                {reminderStatus === 'scheduled' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </span>
              <span className={`text-[10px] font-semibold ${
                reminderStatus === 'scheduled' ? 'text-green-600' : reminderStatus === 'denied' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {reminderStatus === 'scheduled' ? t('reminder_btn', locale) : reminderStatus === 'denied' ? t('reminder_denied', locale).slice(0, 12)+'…' : t('reminder_grant', locale).slice(0, 8)}
              </span>
            </button>
          </div>
        </section>

        {/* ===== QR CODE MODAL ===== */}
        {showQr && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 print-hidden" onClick={() => setShowQr(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
              <div className="w-52 h-52 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                <QRCodeSVG
                  value={window.location.href}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#111111"
                  level="M"
                />
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">{t('share_qr_desc', locale)}</p>
              {isCustom && !isShared && (
                <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                  {t('share_temporary', locale).split('\n').map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}
                </p>
              )}
              {isShared && (
                <p className="text-[11px] text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                  {t('share_permanent', locale)}
                </p>
              )}
              <p className="text-xs text-gray-400 mb-4 break-all">{window.location.href}</p>
              <button onClick={copyUrl}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                {copied ? <><Check className="w-4 h-4" /> {t('link_copied', locale)}</> : <><Copy className="w-4 h-4" /> {t('copy_link', locale)}</>}
              </button>
              {isCustom && (
                <Link to="/dat-hang" onClick={() => setShowQr(false)}
                  className="mt-2 w-full py-2.5 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-1">
                  {t('upgrade', locale)}
                </Link>
              )}
              <button onClick={() => setShowQr(false)}
                className="mt-2 w-full py-2 text-gray-500 text-sm">{t('close', locale)}</button>
            </div>
          </div>
        )}

        {/* ===== SHARE MODAL ===== */}
        {showShare && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6 print-hidden" onClick={() => setShowShare(false)}>
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
              <h3 className="font-bold text-gray-900 text-center mb-6">{t('share_card', locale)}</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button onClick={() => { shareNative(`${t('share_card', locale)} - ${data?.groom} & ${data?.bride}`, window.location.href); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">{t('share', locale)}</span>
                </button>
                <button onClick={() => { shareZalo(window.location.href, `${t('share_card', locale)} - ${data?.groom} & ${data?.bride}`); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">Zalo</span>
                </button>
                <button onClick={() => { shareFacebook(window.location.href); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#1877F2] rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">Facebook</span>
                </button>
                <button onClick={() => { shareKakaoTalk(window.location.href, `Thiệp cưới - ${data?.groom} & ${data?.bride}`); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#FEE500] rounded-2xl flex items-center justify-center">
                    <span className="text-sm font-bold text-[#391B1B]">Ka</span>
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">KakaoTalk</span>
                </button>
                <button onClick={() => { shareWhatsApp(window.location.href); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#25D366] rounded-2xl flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">WhatsApp</span>
                </button>
                <button onClick={() => { shareTwitter(window.location.href, `Thiệp cưới - ${data?.groom} & ${data?.bride}`); setShowShare(false) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <span className="text-sm font-bold text-white">X</span>
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">Twitter / X</span>
                </button>
                <button onClick={() => { copyToClipboard(window.location.href); setCopied(true); setTimeout(() => { setCopied(false); setShowShare(false) }, 1500) }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-gray-600" />}
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">{copied ? t('link_copied', locale) : t('copy_link', locale)}</span>
                </button>
              </div>
              <button onClick={() => setShowShare(false)}
                className="w-full py-3 text-gray-500 text-sm font-medium border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">{t('close', locale)}</button>
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className={`px-6 py-12 text-center ${theme.cardBg} print-section`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-3" viewBox="0 0 48 8" fill="none">
              <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={secondaryStroke} strokeWidth="0.7" opacity="0.4" />
            </svg>
            <svg className="w-4 h-4 animate-float" viewBox="0 0 24 24" fill="none" stroke={accentStroke} strokeWidth="1.5">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg className="w-12 h-3" viewBox="0 0 48 8" fill="none">
              <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={secondaryStroke} strokeWidth="0.7" opacity="0.4" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${theme.fontColor} opacity-80`}>{data.groom.split(' ').pop()} & {data.bride.split(' ').pop()}</p>
          <p className={`text-xs mt-2 ${theme.fontColorSecondary} opacity-60`}>{data.date}</p>
          {isCustom && <p className="text-[10px] mt-3 text-gray-400 italic">{t('made_by', locale)}</p>}
          <div className="mt-6 opacity-50">
            <p className={`text-[10px] ${theme.fontColorSecondary}`}>{t('powered_by', locale)}</p>
          </div>
        </footer>

        {/* ── 인쇄용 QR 코드 (프린트 시에만 표시) ── */}
        <div className="hidden print:flex print-section flex-col items-center justify-center py-8 px-6 text-center">
          <div className="w-40 h-40 mb-3">
            <QRCodeSVG
              value={window.location.href}
              size={160}
              bgColor="#ffffff"
              fgColor="#111111"
              level="M"
            />
          </div>
          <p className="text-xs text-gray-500 font-medium">{t('share_qr_desc', locale)}</p>
          <p className="text-[10px] text-gray-400 mt-1 break-all">{window.location.href}</p>
        </div>

        {/* ── Zalo / Messenger 채팅 버튼 ── */}
        <div className="fixed bottom-28 right-4 z-40 flex flex-col gap-2 print-hidden">
          <a href="https://zalo.me/0903696946" target="_blank" rel="noopener noreferrer"
            className="w-12 h-12 bg-[#0068FF] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            title={t('chat_zalo', locale)}>
            <span className="text-white font-bold text-xs">Z</span>
          </a>
          <a href="https://m.me/thesimple.vn" target="_blank" rel="noopener noreferrer"
            className="w-12 h-12 bg-[#1877F2] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            title={t('chat_messenger', locale)}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0z"/></svg>
          </a>
        </div>

      </div>
    </div>
  )
}
