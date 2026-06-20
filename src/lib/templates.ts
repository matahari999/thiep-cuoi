import type { PatternId } from '../components/AnimatedPattern'

export interface TemplateTheme {
  id: string
  name: string
  nameEn: string
  gradient: string
  cardBg: string
  accent: string
  fontColor: string
  fontColorSecondary: string
  icon: string
  badgeColor: string
  pattern: PatternId
  patternColor: string
}

export interface TemplateCategory {
  id: string
  name: string
  nameEn: string
  desc: string
  icon: string
  templates: TemplateTheme[]
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'truyen-thong',
    name: 'Truyền Thống',
    nameEn: 'Traditional',
    desc: 'Đậm đà bản sắc văn hóa Việt với sắc đỏ may mắn, vàng sang trọng — biểu tượng long phụng, song hỷ',
    icon: '🏮',
    templates: [
      { id: 'classic-red', name: 'Cổ Điển Đỏ', nameEn: 'Classic Red', gradient: 'from-red-700 via-red-600 to-yellow-500', cardBg: 'bg-gradient-to-br from-red-700 via-red-600 to-yellow-500', accent: 'text-yellow-300', fontColor: 'text-white', fontColorSecondary: 'text-red-100', icon: '🎊', badgeColor: 'bg-red-100 text-red-700', pattern: 'geo-heart',    patternColor: '#fbbf24' },
      { id: 'dong-son', name: 'Đồng Sơn', nameEn: 'Dong Son', gradient: 'from-amber-800 via-amber-600 to-yellow-400', cardBg: 'bg-gradient-to-br from-amber-900 via-amber-700 to-yellow-400', accent: 'text-yellow-200', fontColor: 'text-white', fontColorSecondary: 'text-amber-200', icon: '🥁', badgeColor: 'bg-amber-100 text-amber-700', pattern: 'waves-ripple', patternColor: '#fde68a' },
      { id: 'hoa-sen', name: 'Hoa Sen', nameEn: 'Lotus', gradient: 'from-pink-300 via-pink-200 to-white', cardBg: 'bg-gradient-to-br from-pink-300 via-pink-100 to-white', accent: 'text-pink-600', fontColor: 'text-gray-800', fontColorSecondary: 'text-pink-500', icon: '🪷', badgeColor: 'bg-pink-100 text-pink-700', pattern: 'floral-lotus',  patternColor: '#f9a8d4' },
      { id: 'song-hy', name: 'Song Hỷ', nameEn: 'Double Happiness', gradient: 'from-red-600 via-rose-600 to-red-500', cardBg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-500', accent: 'text-yellow-300', fontColor: 'text-white', fontColorSecondary: 'text-red-200', icon: '🎎', badgeColor: 'bg-rose-100 text-rose-700', pattern: 'geo-diamond',  patternColor: '#fde047' },
    ]
  },
  {
    id: 'hien-dai',
    name: 'Hiện Đại — Minimalist',
    nameEn: 'Modern Minimalist',
    desc: 'Tinh tế, tối giản, sang trọng. Font chữ thanh mảnh, khoảng trắng thông minh — xu hướng số 1 năm 2026',
    icon: '✨',
    templates: [
      { id: 'minimal-beige', name: 'Beige Tinh Tế', nameEn: 'Elegant Beige', gradient: 'from-stone-100 via-stone-50 to-white', cardBg: 'bg-gradient-to-br from-stone-100 via-stone-50 to-white', accent: 'text-stone-500', fontColor: 'text-stone-800', fontColorSecondary: 'text-stone-400', icon: '🤍', badgeColor: 'bg-stone-100 text-stone-700', pattern: 'stars-dust',    patternColor: '#d6d3d1' },
      { id: 'minimal-black', name: 'Đen & Trắng', nameEn: 'Black & White', gradient: 'from-gray-900 via-gray-800 to-gray-700', cardBg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700', accent: 'text-gray-300', fontColor: 'text-white', fontColorSecondary: 'text-gray-400', icon: '⚫', badgeColor: 'bg-gray-100 text-gray-700', pattern: 'geo-diamond',  patternColor: '#6b7280' },
      { id: 'sage-green', name: 'Xanh Sage', nameEn: 'Sage Green', gradient: 'from-emerald-100 via-green-50 to-white', cardBg: 'bg-gradient-to-br from-emerald-100 via-green-50 to-white', accent: 'text-emerald-600', fontColor: 'text-gray-800', fontColorSecondary: 'text-emerald-500', icon: '🌿', badgeColor: 'bg-emerald-100 text-emerald-700', pattern: 'wood-leaves',   patternColor: '#6ee7b7' },
    ]
  },
  {
    id: 'lang-man',
    name: 'Lãng Mạn',
    nameEn: 'Romantic',
    desc: 'Hoa hồng, cánh bướm, màu nước — ngọt ngào và mơ mộng dành cho các cặp đôi yêu sự lãng mạn',
    icon: '🌸',
    templates: [
      { id: 'romantic-pink', name: 'Hồng Ngọt Ngào', nameEn: 'Sweet Pink', gradient: 'from-pink-400 via-rose-300 to-pink-200', cardBg: 'bg-gradient-to-br from-pink-400 via-rose-300 to-pink-200', accent: 'text-rose-600', fontColor: 'text-white', fontColorSecondary: 'text-pink-200', icon: '🌹', badgeColor: 'bg-pink-100 text-pink-700', pattern: 'floral-rose',   patternColor: '#fda4af' },
      { id: 'watercolor', name: 'Màu Nước', nameEn: 'Watercolor', gradient: 'from-sky-200 via-rose-200 to-yellow-100', cardBg: 'bg-gradient-to-br from-sky-200 via-rose-200 to-yellow-100', accent: 'text-rose-500', fontColor: 'text-gray-700', fontColorSecondary: 'text-rose-400', icon: '🎨', badgeColor: 'bg-sky-100 text-sky-700', pattern: 'floral-cherry', patternColor: '#fda4af' },
      { id: 'peony-garden', name: 'Vườn Hoa Mẫu Đơn', nameEn: 'Peony Garden', gradient: 'from-fuchsia-300 via-pink-400 to-rose-300', cardBg: 'bg-gradient-to-br from-fuchsia-300 via-pink-400 to-rose-300', accent: 'text-fuchsia-700', fontColor: 'text-white', fontColorSecondary: 'text-pink-200', icon: '🌷', badgeColor: 'bg-fuchsia-100 text-fuchsia-700', pattern: 'floral-cherry', patternColor: '#e879f9' },
    ]
  },
  {
    id: 'sang-trong',
    name: 'Sang Trọng — Luxury',
    nameEn: 'Luxury Metallic',
    desc: 'Ánh kim, ép nhũ vàng/bạc, dập nổi — đẳng cấp từ lần chạm đầu tiên, dành cho tiệc cưới cao cấp',
    icon: '💎',
    templates: [
      { id: 'gold-elegant', name: 'Vàng Sang Trọng', nameEn: 'Gold Elegance', gradient: 'from-amber-800 via-amber-600 to-yellow-400', cardBg: 'bg-gradient-to-br from-amber-800 via-amber-600 to-yellow-400', accent: 'text-yellow-200', fontColor: 'text-white', fontColorSecondary: 'text-amber-200', icon: '🌟', badgeColor: 'bg-amber-100 text-amber-700', pattern: 'stars-shooting', patternColor: '#fde68a' },
      { id: 'black-gold', name: 'Đen Vàng', nameEn: 'Black & Gold', gradient: 'from-gray-950 via-gray-900 to-amber-700', cardBg: 'bg-gradient-to-br from-gray-950 via-gray-900 to-amber-700', accent: 'text-yellow-300', fontColor: 'text-white', fontColorSecondary: 'text-amber-300', icon: '🖤', badgeColor: 'bg-gray-100 text-gray-700', pattern: 'stars-shooting', patternColor: '#fbbf24' },
      { id: 'rose-gold', name: 'Hồng Ánh Kim', nameEn: 'Rose Gold', gradient: 'from-rose-400 via-amber-300 to-yellow-200', cardBg: 'bg-gradient-to-br from-rose-400 via-amber-300 to-yellow-200', accent: 'text-rose-700', fontColor: 'text-gray-800', fontColorSecondary: 'text-rose-500', icon: '💗', badgeColor: 'bg-rose-100 text-rose-700', pattern: 'stars-dust',    patternColor: '#fda4af' },
    ]
  },
  {
    id: 'thien-nhien',
    name: 'Thiên Nhiên',
    nameEn: 'Nature & Earth',
    desc: 'Cây cỏ, hoa lá, tông màu đất — gần gũi với thiên nhiên, phù hợp tiệc cưới ngoài trời',
    icon: '🌿',
    templates: [
      { id: 'rustic-green', name: 'Xanh Rêu', nameEn: 'Rustic Green', gradient: 'from-lime-900 via-green-800 to-emerald-700', cardBg: 'bg-gradient-to-br from-lime-900 via-green-800 to-emerald-700', accent: 'text-lime-300', fontColor: 'text-white', fontColorSecondary: 'text-lime-200', icon: '🍃', badgeColor: 'bg-green-100 text-green-700', pattern: 'wood-bamboo',  patternColor: '#86efac' },
      { id: 'earthy-beige', name: 'Đất Nâu', nameEn: 'Earth Tone', gradient: 'from-amber-900 via-stone-700 to-stone-500', cardBg: 'bg-gradient-to-br from-amber-900 via-stone-700 to-stone-500', accent: 'text-amber-300', fontColor: 'text-white', fontColorSecondary: 'text-stone-300', icon: '🤎', badgeColor: 'bg-stone-100 text-stone-700', pattern: 'wood-leaves',   patternColor: '#a3a07a' },
      { id: 'olive-garden', name: 'Vườn Ô Liu', nameEn: 'Olive Garden', gradient: 'from-green-700 via-emerald-600 to-teal-500', cardBg: 'bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500', accent: 'text-green-300', fontColor: 'text-white', fontColorSecondary: 'text-emerald-200', icon: '🫒', badgeColor: 'bg-emerald-100 text-emerald-700', pattern: 'wood-branch',   patternColor: '#86efac' },
    ]
  },
  {
    id: 'co-dien',
    name: 'Cổ Điển',
    nameEn: 'Vintage Classic',
    desc: 'Vintage, retro, hoài cổ — nét đẹp vượt thời gian, pha trộn giữa Âu Châu cổ điển và Á Đông',
    icon: '🕰️',
    templates: [
      { id: 'vintage-gold', name: 'Vintage Vàng', nameEn: 'Vintage Gold', gradient: 'from-yellow-700 via-amber-500 to-yellow-300', cardBg: 'bg-gradient-to-br from-yellow-700 via-amber-500 to-yellow-300', accent: 'text-amber-900', fontColor: 'text-white', fontColorSecondary: 'text-yellow-200', icon: '📜', badgeColor: 'bg-yellow-100 text-yellow-700', pattern: 'waves-sine',   patternColor: '#fde68a' },
      { id: 'vintage-rose', name: 'Hồng Cổ Điển', nameEn: 'Vintage Rose', gradient: 'from-rose-800 via-rose-600 to-pink-400', cardBg: 'bg-gradient-to-br from-rose-800 via-rose-600 to-pink-400', accent: 'text-rose-300', fontColor: 'text-white', fontColorSecondary: 'text-pink-300', icon: '🥀', badgeColor: 'bg-rose-100 text-rose-700', pattern: 'floral-rose',   patternColor: '#fda4af' },
      { id: 'french-vintage', name: 'Pháp Cổ', nameEn: 'French Vintage', gradient: 'from-blue-800 via-indigo-600 to-slate-400', cardBg: 'bg-gradient-to-br from-blue-800 via-indigo-600 to-slate-400', accent: 'text-blue-300', fontColor: 'text-white', fontColorSecondary: 'text-indigo-200', icon: '🗼', badgeColor: 'bg-blue-100 text-blue-700', pattern: 'geo-circle',   patternColor: '#93c5fd' },
    ]
  },
  {
    id: 'van-hoa',
    name: 'Văn Hóa Việt',
    nameEn: 'Vietnamese Culture',
    desc: 'Áo dài, nón lá, trống đồng, hoa sen — tự hào bản sắc Việt Nam trong ngày trọng đại',
    icon: '🇻🇳',
    templates: [
      { id: 'ao-dai', name: 'Áo Dài', nameEn: 'Ao Dai', gradient: 'from-red-500 via-yellow-400 to-red-500', cardBg: 'bg-gradient-to-br from-red-500 via-yellow-400 to-red-500', accent: 'text-yellow-200', fontColor: 'text-white', fontColorSecondary: 'text-red-100', icon: '👘', badgeColor: 'bg-red-100 text-red-700', pattern: 'floral-lotus',  patternColor: '#fde047' },
      { id: 'non-la', name: 'Nón Lá', nameEn: 'Conical Hat', gradient: 'from-yellow-600 via-amber-500 to-stone-400', cardBg: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-stone-400', accent: 'text-stone-200', fontColor: 'text-white', fontColorSecondary: 'text-amber-200', icon: '🍂', badgeColor: 'bg-amber-100 text-amber-700', pattern: 'wood-branch',   patternColor: '#fde68a' },
      { id: 'truc-dong', name: 'Trống Đồng', nameEn: 'Bronze Drum', gradient: 'from-teal-800 via-emerald-700 to-amber-600', cardBg: 'bg-gradient-to-br from-teal-800 via-emerald-700 to-amber-600', accent: 'text-amber-300', fontColor: 'text-white', fontColorSecondary: 'text-teal-200', icon: '🪘', badgeColor: 'bg-teal-100 text-teal-700', pattern: 'waves-ripple', patternColor: '#6ee7b7' },
    ]
  },
]

export function getTemplateById(id: string): TemplateTheme | undefined {
  for (const cat of templateCategories) {
    const t = cat.templates.find(t => t.id === id)
    if (t) return t
  }
  return undefined
}

export function getCategoryForTemplate(id: string): TemplateCategory | undefined {
  for (const cat of templateCategories) {
    if (cat.templates.find(t => t.id === id)) return cat
  }
  return undefined
}

export const allTemplates = templateCategories.flatMap(c => c.templates)
