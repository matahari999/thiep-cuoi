import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatedPattern } from '../components/AnimatedPattern'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, Heart, ArrowLeft, Music, Music2, ChevronDown, Share2, Copy, Check, MessageCircle, Users, Printer, Play, Pause, QrCode, MessageSquare } from 'lucide-react'
import { getTemplateById, allTemplates } from '../lib/templates'

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
}

const demoData: Record<string, InvitationData> = {}

for (const t of allTemplates) {
  const idx = allTemplates.indexOf(t)
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
  demoData[t.id] = {
    groom: c.g, bride: c.b, groomParent: c.gp, brideParent: c.bp,
    date: c.d, time: c.ti, venue: c.v,
    mapUrl: 'https://maps.google.com/',
    message: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi trong ngày trọng đại. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất của chúng tôi.',
    heroPhoto: '',
    gallery: [],
    template: t.id
  }
}

function getDday(targetDate: string): { days: number, hours: number } {
  const [d, m, y] = targetDate.split('/').map(Number)
  const target = new Date(y, m - 1, d)
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

const sectionIds = ['hero', 'welcome', 'countdown', 'details', 'gallery', 'bank', 'rsvp', 'guestbook']

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
  try {
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
  } catch { return dateStr }
}

export default function Invitation() {
  const { slug } = useParams<{ slug: string }>()

  const [customData, setCustomData] = useState<InvitationData | null>(null)
  const isCustom = slug === 'custom-invitation'

  useEffect(() => {
    if (isCustom) {
      try {
        const raw = localStorage.getItem('thiepcuoi_custom')
        if (raw) {
          const parsed = JSON.parse(raw)
          setCustomData({
            ...parsed,
            mapUrl: parsed.mapUrl || 'https://maps.google.com/',
            date: parsed.date.includes('/') ? parsed.date : parseCustomDate(parsed.date),
            heroPhoto: parsed.heroPhoto || '/photos/hero.jpg',
            gallery: parsed.gallery?.filter(Boolean)?.length ? parsed.gallery : ['/photos/gallery-1.jpg', '/photos/gallery-2.jpg', '/photos/gallery-3.jpg', '/photos/gallery-4.jpg'],
          })
        }
      } catch {}
    }
  }, [isCustom])

  const data = isCustom ? customData : (slug ? demoData[slug] : null)
  const theme = data?.template ? (getTemplateById(data.template) || getTemplateById(isCustom ? 'classic-tropical' : '')) : (slug ? getTemplateById(slug) : undefined)
  const [musicOn, setMusicOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestCount, setGuestCount] = useState('1')
  const [guestMessage, setGuestMessage] = useState('')
  const [rsvpSent, setRsvpSent] = useState(false)
  const [showBank, setShowBank] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [autoScrolling, setAutoScrolling] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const isProgrammatic = useRef(false)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [heroIdx, setHeroIdx] = useState(0)
  const [showQr, setShowQr] = useState(false)
  const heroPhotos = data ? [data.heroPhoto, ...data.gallery].filter(Boolean) : []
  const hasSlideshow = heroPhotos.length >= 2

  useEffect(() => {
    if (!hasSlideshow) return
    const timer = setInterval(() => setHeroIdx(prev => (prev + 1) % heroPhotos.length), 5000)
    return () => clearInterval(timer)
  }, [hasSlideshow, heroPhotos.length])

  const dday = data ? getDday(data.date) : { days: 0, hours: 0 }
  const isKorean = false
  const colorClass = theme?.accent || 'text-red-500'
  const bgColorClass = colorClass.replace('text-', 'bg-')
  const accentStroke = theme?.accent?.includes('yellow') ? '#fde047' : theme?.accent?.includes('white') ? '#fff' : '#fca5a5'

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

  const scrollToSection = useCallback((idx: number) => {
    isProgrammatic.current = true
    const el = document.getElementById(`section-${sectionIds[idx]}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentIdx(idx)
    setTimeout(() => { isProgrammatic.current = false }, 800)
  }, [])

  useEffect(() => {
    if (!autoScrolling || !data) return
    const timer = setInterval(() => {
      setCurrentIdx(prev => {
        const next = (prev + 1) % sectionIds.length
        scrollToSection(next)
        return next
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [autoScrolling, data, scrollToSection])

  const pauseAutoScroll = useCallback(() => {
    if (isProgrammatic.current) return
    setAutoScrolling(false)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => setAutoScrolling(true), 12000)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammatic.current) return
      const scrollY = window.scrollY
      let activeIdx = 0
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sectionIds[i]}`)
        if (el && el.offsetTop <= scrollY + 200) { activeIdx = i; break }
      }
      setCurrentIdx(activeIdx)
      pauseAutoScroll()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pauseAutoScroll])

  const toggleAutoScroll = () => {
    if (autoScrolling) {
      setAutoScrolling(false)
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
    } else {
      setAutoScrolling(true)
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
    }
  }

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicOn) { audioRef.current.pause(); setMusicOn(false) }
    else { audioRef.current.play().catch(() => {}); setMusicOn(true) }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const copyUrl = () => copyToClipboard(window.location.href)

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({ title: `Thiệp cưới - ${data?.groom} & ${data?.bride}`, url: window.location.href })
    } else { copyUrl() }
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

  const shareZalo = () => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(`Thiệp cưới - ${data?.groom} & ${data?.bride}`)
    window.open(`https://zalo.me/share?url=${url}&title=${title}`, '_blank')
  }

  if (!data || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy thiệp cưới</h1>
          <p className="text-gray-500 mb-4">Thiệp không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="text-red-500 font-semibold text-sm hover:underline">← Về trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center print:bg-white">
      <AnimatedPattern id={theme.pattern} color={theme.patternColor} />

      <div className="w-full max-w-md mx-auto bg-white min-h-screen relative print:max-w-full print:shadow-none">

        {/* ===== SECTION PROGRESS INDICATOR ===== */}
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2.5 print-hidden">
          {sectionIds.map((id, i) => (
            <button key={id} onClick={() => { setAutoScrolling(false); scrollToSection(i) }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIdx === i
                  ? `${bgColorClass || 'bg-red-500'} w-3 h-3 shadow-lg ${bgColorClass?.replace('bg-', 'shadow-') || 'shadow-red-300'}`
                  : 'bg-gray-300 hover:bg-gray-400'
              }`} />
          ))}
          <button onClick={toggleAutoScroll}
            className={`mt-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              autoScrolling ? `${bgColorClass || 'bg-red-500'} text-white` : 'bg-gray-200 text-gray-500'
            }`}>
            {autoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>

        {/* Music button */}
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all print-hidden">
          {musicOn ? <Music2 className={`w-5 h-5 ${colorClass}`} /> : <Music className="w-5 h-5 text-gray-400" />}
        </button>

        {/* Print styles */}
        <style>{`
          @media print {
            @page { margin: 0.5cm; size: A5 portrait; }
            .print-hidden { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-section { page-break-inside: avoid; }
          }
        `}</style>

        {/* ===== HERO — 진짜 청첩장 스타일 ===== */}
        <div id="section-hero" className="relative h-screen flex flex-col overflow-hidden print:h-auto print:min-h-[70vh]">
          {/* Wave decorations on both sides */}
          <div className={`${colorClass}`}>
            <DecorativeWaves />
          </div>

          {/* Slideshow background layers */}
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

          {/* Photo frame overlay — 진짜 청첩장 사진 느낌 */}
          {hasSlideshow && (
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

          {/* Slideshow dot indicator */}
          {hasSlideshow && (
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

          <Link to="/" className="absolute top-12 left-4 z-30 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors print-hidden">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>

          <div className="absolute top-12 right-4 z-30 flex gap-2 print-hidden">
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
                <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.5" />
              </svg>
              <span className={`text-xs font-light tracking-[0.3em] ${theme.fontColorSecondary}`}>WEDDING</span>
              <svg className="w-12 h-3 overflow-visible" viewBox="0 0 48 8" fill="none">
                <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.5" />
              </svg>
            </div>
            <span className="text-5xl mb-4 text-white/80 drop-shadow-lg">{theme.icon}</span>
            {/* Decorative wave divider instead of heart */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-16 h-4" viewBox="0 0 64 8" fill="none">
                <path d="M0,4 Q8,0 16,4 Q24,8 32,4 Q40,0 48,4 Q56,8 64,4" stroke={accentStroke} strokeWidth="0.8" opacity="0.6" />
              </svg>
              <svg className="w-5 h-5 animate-float" viewBox="0 0 24 24" fill="none" stroke={accentStroke} strokeWidth="1.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <svg className="w-16 h-4" viewBox="0 0 64 8" fill="none">
                <path d="M0,4 Q8,0 16,4 Q24,8 32,4 Q40,0 48,4 Q56,8 64,4" stroke={accentStroke} strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
            <p className={`text-xs font-light tracking-[0.3em] ${theme.fontColorSecondary} mb-3`}>WEDDING INVITATION</p>
            <h1 className={`text-4xl font-bold ${theme.fontColor} text-center leading-tight`}>
              {data.groom.split(' ').pop()}
              <span className={`mx-3 ${theme.accent}`}>&</span>
              {data.bride.split(' ').pop()}
            </h1>
            <p className={`text-sm mt-4 ${theme.fontColorSecondary} opacity-80 text-center`}>{data.date}</p>
            {/* Decorative bottom border */}
            <div className="flex items-center gap-3 mt-6">
              <svg className="w-10 h-3" viewBox="0 0 40 8" fill="none">
                <path d="M0,4 Q10,0 20,4 Q30,8 40,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.4" />
              </svg>
              <span className="text-[8px] tracking-[0.4em] uppercase" style={{ color: theme.fontColorSecondary, opacity: 0.5 }}>Love</span>
              <svg className="w-10 h-3" viewBox="0 0 40 8" fill="none">
                <path d="M0,4 Q10,0 20,4 Q30,8 40,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.4" />
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
            <SectionTitle icon="💌" title={isKorean ? '초대합니다' : 'Thân mời'} titleEn="Welcome" color={colorClass} />
            <p className="text-2xl font-bold text-gray-800 mb-2">{data.groom}</p>
            {data.groomParent && <p className="text-gray-400 text-sm mb-1">
              {isKorean ? `${data.groomParent.split('&')[0]?.trim() || ''}의 아들` : `Con trai ${data.groomParent}`}
            </p>}
            <div className="flex justify-center my-4"><Heart className="w-5 h-5 text-gray-300" /></div>
            <p className="text-2xl font-bold text-gray-800 mb-2">{data.bride}</p>
            {data.brideParent && <p className="text-gray-400 text-sm mb-8">
              {isKorean ? `${data.brideParent.split('&')[0]?.trim() || ''}의 딸` : `Con gái ${data.brideParent}`}
            </p>}
            <p className="text-gray-600 leading-relaxed text-sm max-w-xs mx-auto">{data.message}</p>
          </AnimatedSection>
        </section>

        {/* ===== COUNTDOWN ===== */}
        <section id="section-countdown" className="px-6 py-12 bg-gradient-to-r from-red-50 via-white to-red-50 print-section">
          <AnimatedSection delay={100}>
            <SectionTitle icon="📅" title={isKorean ? 'D-DAY' : 'Ngày cưới'} titleEn="Countdown" color={colorClass} />
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${colorClass}`}>{dday.days}</div>
                <div className="text-xs text-gray-400 mt-1">{isKorean ? '일' : 'Ngày'}</div>
              </div>
              <div className={`text-4xl font-light ${colorClass}`}>:</div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${colorClass}`}>{dday.hours}</div>
                <div className="text-xs text-gray-400 mt-1">{isKorean ? '시간' : 'Giờ'}</div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {data.date} ({isKorean ? '오전' : 'giờ'} {data.time})
            </p>
          </AnimatedSection>
        </section>

        {/* ===== DETAILS ===== */}
        <section id="section-details" className="px-6 py-16 print-section">
          <AnimatedSection delay={200}>
            <SectionTitle icon="🎊" title={isKorean ? '예식 정보' : 'Thông tin'} titleEn="Wedding Details" color={colorClass} />
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className={`w-12 h-12 ${bgColorClass || 'bg-red-100'} rounded-xl flex items-center justify-center shrink-0`}>
                  <Calendar className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{isKorean ? '일시' : 'Thời gian'}</p>
                  <p className="font-semibold text-gray-800">{data.date} — {data.time}</p>
                </div>
              </div>
              <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors">
                <div className={`w-12 h-12 ${bgColorClass || 'bg-red-100'} rounded-xl flex items-center justify-center shrink-0`}>
                  <MapPin className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{isKorean ? '장소' : 'Địa điểm'}</p>
                  <p className="font-semibold text-gray-800 text-sm">{data.venue}</p>
                </div>
              </a>
            </div>
            <div className="mt-6">
              <iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.venue)}&output=embed`}
                className="w-full h-48 rounded-2xl" loading="lazy" />
            </div>
            <div className="mt-4 flex gap-3 print-hidden">
              <button onClick={() => window.open(`https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.venue)}`)}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all ${bgColorClass || 'bg-red-500'} hover:opacity-90 flex items-center justify-center gap-2`}>
                <MapPin className="w-4 h-4" /> {isKorean ? '길찾기' : 'Chỉ đường'}
              </button>
              <button onClick={saveToCalendar}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all ${bgColorClass || 'bg-red-500'} hover:opacity-90 flex items-center justify-center gap-2`}>
                <Calendar className="w-4 h-4" /> {isKorean ? '일정 저장' : 'Lưu lịch'}
              </button>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== GALLERY ===== */}
        <section id="section-gallery" className="px-6 py-16 bg-gray-50 print-section">
          <AnimatedSection delay={300}>
            <SectionTitle icon="📸" title={isKorean ? '갤러리' : 'Album ảnh'} titleEn="Photo Gallery" color={colorClass} />
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
            <SectionTitle icon="🧧" title={isKorean ? '마음 전하실 곳' : 'Tiền mừng cưới'} titleEn="Wedding Gifts" color={colorClass} />
            <p className="text-center text-sm text-gray-500 mb-4">
              {isKorean ? '축복해 주시는 마음 감사합니다' : 'Cảm ơn tấm lòng của quý khách'}
            </p>
            <button onClick={() => setShowBank(!showBank)}
              className={`w-full py-4 rounded-2xl font-bold text-sm border-2 transition-all ${showBank ? `${colorClass.replace('text-', 'border-') || 'border-red-500'} bg-red-50` : 'border-gray-200 text-gray-600'}`}>
              {isKorean ? '계좌번호 보기' : 'Xem tài khoản'} {showBank ? '▲' : '▼'}
            </button>
            {showBank && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">{isKorean ? '신랑측' : 'Nhà trai'}</p>
                  <p className="font-bold text-gray-800">{data.bankGroom || 'Bank: 1234 5678 9012'}</p>
                  <p className="text-sm text-gray-500">{data.groomParent}</p>
                  <button onClick={() => copyToClipboard(data.bankGroom || 'Bank: 1234 5678 9012')} className="mt-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                    {copied ? <><Check className="w-3 h-3" /> {isKorean ? '복사됨' : 'Đã sao chép'}</> : <><Copy className="w-3 h-3" /> {isKorean ? '복사' : 'Sao chép'}</>}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">{isKorean ? '신부측' : 'Nhà gái'}</p>
                  <p className="font-bold text-gray-800">{data.bankBride || 'Bank: 9876 5432 1098'}</p>
                  <p className="text-sm text-gray-500">{data.brideParent}</p>
                  <button onClick={() => copyToClipboard(data.bankBride || 'Bank: 9876 5432 1098')} className="mt-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                    {copied ? <><Check className="w-3 h-3" /> {isKorean ? '복사됨' : 'Đã sao chép'}</> : <><Copy className="w-3 h-3" /> {isKorean ? '복사' : 'Sao chép'}</>}
                  </button>
                </div>
              </div>
            )}
          </AnimatedSection>
        </section>

        {/* ===== RSVP ===== */}
        <section id="section-rsvp" className="px-6 py-16 bg-gray-50 print-section">
          <AnimatedSection delay={500}>
            <SectionTitle icon="💬" title={isKorean ? '참석 여부' : 'Xác nhận tham dự'} titleEn="RSVP" color={colorClass} />
            {rsvpSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-800">{isKorean ? '감사합니다!' : 'Cảm ơn bạn!'}</p>
                <p className="text-sm text-gray-500">{isKorean ? '응답이 전송되었습니다' : 'Phản hồi đã được gửi'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={isKorean ? '이름' : 'Tên của bạn'} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                <div className="flex gap-3">
                  <input value={guestCount} onChange={e => setGuestCount(e.target.value)} type="number" min="1" max="10" placeholder={isKorean ? '인원' : 'Số người'} className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm" />
                  <select value={guestCount} onChange={e => setGuestCount(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm text-gray-600">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{isKorean ? `${n}명 참석` : `${n} người`}</option>)}
                  </select>
                </div>
                <textarea value={guestMessage} onChange={e => setGuestMessage(e.target.value)} placeholder={isKorean ? '축하 메시지' : 'Lời chúc'} rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all text-sm resize-none" />
                <button onClick={() => guestName && setRsvpSent(true)} disabled={!guestName}
                  className={`w-full py-4 rounded-2xl font-bold text-sm text-white transition-all disabled:bg-gray-300 ${bgColorClass || 'bg-red-500'} hover:opacity-90 flex items-center justify-center gap-2`}>
                  <MessageCircle className="w-4 h-4" /> {isKorean ? '전송하기' : 'Gửi phản hồi'}
                </button>
              </div>
            )}
          </AnimatedSection>
        </section>

        {/* ===== GUEST BOOK ===== */}
        <section id="section-guestbook" className="px-6 py-16 print-section">
          <AnimatedSection delay={600}>
            <SectionTitle icon="📖" title={isKorean ? '방명록' : 'Sổ lưu bút'} titleEn="Guest Book" color={colorClass} />
            <div className="space-y-4">
              {[
                { name: 'Minh Anh', msg: 'Chúc hai bạn trăm năm hạnh phúc! 💕' },
                { name: 'Quốc Bảo', msg: 'Mong chờ ngày vui của các bạn. Yêu thương!' },
                { name: 'Thanh Thảo', msg: 'Hạnh phúc ngập tràn nhé các bạn! 🌸' },
                ...(isKorean ? [
                  { name: '김지영', msg: '결혼 진심으로 축하드립니다! 🎉' },
                  { name: '박민수', msg: '두 분의 앞날에 행복이 가득하길 바랍니다 🙏' },
                ] : []),
              ].map((g, i) => (
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
          <div className="grid grid-cols-2 gap-3">
            <button onClick={saveToCalendar} className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <Calendar className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-gray-600">Lưu lịch</span>
            </button>
            <button onClick={printInvitation} className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <Printer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-gray-600">In thiệp</span>
            </button>
            <button onClick={shareZalo} className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <MessageSquare className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-gray-600">Chia sẻ Zalo</span>
            </button>
            <button onClick={() => setShowQr(true)} className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-center">
              <QrCode className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-gray-600">Mã QR</span>
            </button>
          </div>
        </section>

        {/* ===== QR CODE MODAL ===== */}
        {showQr && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 print-hidden" onClick={() => setShowQr(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code" className="w-full h-full object-contain" />
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">Chia sẻ qua mã QR</p>
              <p className="text-xs text-gray-400 mb-4 break-all">{window.location.href}</p>
              <button onClick={copyUrl}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                {copied ? <><Check className="w-4 h-4" /> Đã sao chép</> : <><Copy className="w-4 h-4" /> Sao chép link</>}
              </button>
              <button onClick={() => setShowQr(false)}
                className="mt-2 w-full py-2 text-gray-500 text-sm">Đóng</button>
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className={`px-6 py-12 text-center ${theme.cardBg} print-section`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-3" viewBox="0 0 48 8" fill="none">
              <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.4" />
            </svg>
            <svg className="w-4 h-4 animate-float" viewBox="0 0 24 24" fill="none" stroke={accentStroke} strokeWidth="1.5">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg className="w-12 h-3" viewBox="0 0 48 8" fill="none">
              <path d="M0,4 Q12,0 24,4 Q36,8 48,4" stroke={theme.fontColorSecondary} strokeWidth="0.7" opacity="0.4" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${theme.fontColor} opacity-80`}>{data.groom.split(' ').pop()} & {data.bride.split(' ').pop()}</p>
          <p className={`text-xs mt-2 ${theme.fontColorSecondary} opacity-60`}>{data.date}</p>
          {isCustom && <p className="text-[10px] mt-3 text-gray-400 italic">Được tạo bởi Thiệp Cưới Online</p>}
          <div className="mt-6 opacity-50">
            <p className={`text-[10px] ${theme.fontColorSecondary}`}>Powered by Thiệp Cưới Online</p>
          </div>
        </footer>

      </div>
    </div>
  )
}
