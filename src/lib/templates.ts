/**
 * templates.ts
 *
 * 청첩장 템플릿 시스템.
 * ─ 모든 템플릿 메타데이터는 이 파일의 상단 data 섹션에서만 정의.
 * ─ 렌더링 컴포넌트(Invitation.tsx)는 TemplateTheme 필드만 참조.
 * ─ 새 템플릿 추가: templateCategories 배열에 항목 1개 추가, 코드 변경 없음.
 */

import type { PatternId } from '../components/AnimatedPattern'

// ═══════════════════════════════════════════════════════════════════
// 타입 정의
// ═══════════════════════════════════════════════════════════════════

export type FrameVariant = 'korean-lineart' | 'vietnamese-gold' | 'western-watercolor'
export type FontFamily   = 'sans' | 'serif'

/** 템플릿 하나의 완전한 테마 정의. 렌더링에 필요한 모든 정보 포함. */
export interface TemplateTheme {
  // ── 식별자 ─────────────────────────────────────────────────────
  id:         string
  categoryId: string   // 상위 카테고리 id (역조회 최적화)
  name:       string   // 베트남어 표시명
  nameEn:     string   // 영어 표시명
  icon:       string   // 이모지 아이콘

  // ── Tailwind 클래스 (JSX className 용) ─────────────────────────
  gradient:           string   // 배경 그래디언트 (Landing 미리보기용)
  cardBg:             string   // 청첩장 카드 배경
  accent:             string   // 강조색 text-* 클래스
  fontColor:          string   // 주 텍스트 text-* 클래스
  fontColorSecondary: string   // 보조 텍스트 text-* 클래스
  badgeColor:         string   // 뱃지 bg/text 클래스

  // ── Hex 컬러 (SVG 속성·인라인 스타일 용) ───────────────────────
  accentHex:             string  // accent의 hex 값
  fontColorHex:          string  // fontColor의 hex 값
  fontColorSecondaryHex: string  // fontColorSecondary의 hex 값

  // ── 폰트 테마 ──────────────────────────────────────────────────
  /** 'sans' = Be Vietnam Pro  |  'serif' = Playfair Display + Be Vietnam Pro fallback */
  fontFamily: FontFamily

  // ── 배경 패턴 ──────────────────────────────────────────────────
  pattern:      PatternId
  patternColor: string

  // ── SVG 프레임 장식 (선택) ─────────────────────────────────────
  /** 정의된 경우에만 FrameDecoration 렌더링 */
  frameVariant?: FrameVariant
  frameColor?:   string
}

export interface TemplateCategory {
  id:      string
  name:    string
  nameEn:  string
  desc:    string
  icon:    string
  templates: TemplateTheme[]
}

// ═══════════════════════════════════════════════════════════════════
// 템플릿 데이터 — 이 배열만 수정하면 전체 시스템에 반영됨
// ═══════════════════════════════════════════════════════════════════

export const templateCategories: TemplateCategory[] = [
  // ── 1. Truyền Thống ────────────────────────────────────────────
  {
    id: 'truyen-thong',
    name: 'Truyền Thống',
    nameEn: 'Traditional',
    desc: 'Đậm đà bản sắc văn hóa Việt với sắc đỏ may mắn, vàng sang trọng — biểu tượng long phụng, song hỷ',
    icon: '🏮',
    templates: [
      {
        id: 'classic-red', categoryId: 'truyen-thong',
        name: 'Cổ Điển Đỏ', nameEn: 'Classic Red', icon: '🎊',
        gradient: 'from-red-700 via-red-600 to-yellow-500',
        cardBg: 'bg-gradient-to-br from-red-700 via-red-600 to-yellow-500',
        accent: 'text-yellow-300', accentHex: '#fde047',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-red-100', fontColorSecondaryHex: '#fee2e2',
        badgeColor: 'bg-red-100 text-red-700',
        fontFamily: 'sans',
        pattern: 'geo-heart', patternColor: '#fbbf24',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'dong-son', categoryId: 'truyen-thong',
        name: 'Đồng Sơn', nameEn: 'Dong Son', icon: '🥁',
        gradient: 'from-amber-800 via-amber-600 to-yellow-400',
        cardBg: 'bg-gradient-to-br from-amber-900 via-amber-700 to-yellow-400',
        accent: 'text-yellow-200', accentHex: '#fef08a',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-amber-200', fontColorSecondaryHex: '#fde68a',
        badgeColor: 'bg-amber-100 text-amber-700',
        fontFamily: 'sans',
        pattern: 'waves-ripple', patternColor: '#fde68a',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'hoa-sen', categoryId: 'truyen-thong',
        name: 'Hoa Sen', nameEn: 'Lotus', icon: '🪷',
        gradient: 'from-pink-300 via-pink-200 to-white',
        cardBg: 'bg-gradient-to-br from-pink-300 via-pink-100 to-white',
        accent: 'text-pink-600', accentHex: '#db2777',
        fontColor: 'text-gray-800', fontColorHex: '#1f2937',
        fontColorSecondary: 'text-pink-500', fontColorSecondaryHex: '#ec4899',
        badgeColor: 'bg-pink-100 text-pink-700',
        fontFamily: 'sans',
        pattern: 'floral-lotus', patternColor: '#f9a8d4',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'song-hy', categoryId: 'truyen-thong',
        name: 'Song Hỷ', nameEn: 'Double Happiness', icon: '🎎',
        gradient: 'from-red-600 via-rose-600 to-red-500',
        cardBg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-500',
        accent: 'text-yellow-300', accentHex: '#fde047',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-red-200', fontColorSecondaryHex: '#fecaca',
        badgeColor: 'bg-rose-100 text-rose-700',
        fontFamily: 'sans',
        pattern: 'geo-diamond', patternColor: '#fde047',
        frameVariant: 'vietnamese-gold', frameColor: '#f0d488',
      },
    ],
  },

  // ── 2. Hiện Đại ────────────────────────────────────────────────
  {
    id: 'hien-dai',
    name: 'Hiện Đại — Minimalist',
    nameEn: 'Modern Minimalist',
    desc: 'Tinh tế, tối giản, sang trọng. Font chữ thanh mảnh, khoảng trắng thông minh — xu hướng số 1 năm 2026',
    icon: '✨',
    templates: [
      {
        id: 'minimal-beige', categoryId: 'hien-dai',
        name: 'Beige Tinh Tế', nameEn: 'Elegant Beige', icon: '🤍',
        gradient: 'from-stone-100 via-stone-50 to-white',
        cardBg: 'bg-gradient-to-br from-stone-100 via-stone-50 to-white',
        accent: 'text-stone-500', accentHex: '#78716c',
        fontColor: 'text-stone-800', fontColorHex: '#292524',
        fontColorSecondary: 'text-stone-400', fontColorSecondaryHex: '#a8a29e',
        badgeColor: 'bg-stone-100 text-stone-700',
        fontFamily: 'serif',
        pattern: 'stars-dust', patternColor: '#d6d3d1',
        frameVariant: 'korean-lineart', frameColor: '#e7e2d8',
      },
      {
        id: 'minimal-black', categoryId: 'hien-dai',
        name: 'Đen & Trắng', nameEn: 'Black & White', icon: '⚫',
        gradient: 'from-gray-900 via-gray-800 to-gray-700',
        cardBg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700',
        accent: 'text-gray-300', accentHex: '#d1d5db',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-gray-400', fontColorSecondaryHex: '#9ca3af',
        badgeColor: 'bg-gray-100 text-gray-700',
        fontFamily: 'serif',
        pattern: 'geo-diamond', patternColor: '#6b7280',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'sage-green', categoryId: 'hien-dai',
        name: 'Xanh Sage', nameEn: 'Sage Green', icon: '🌿',
        gradient: 'from-emerald-100 via-green-50 to-white',
        cardBg: 'bg-gradient-to-br from-emerald-100 via-green-50 to-white',
        accent: 'text-emerald-600', accentHex: '#059669',
        fontColor: 'text-gray-800', fontColorHex: '#1f2937',
        fontColorSecondary: 'text-emerald-500', fontColorSecondaryHex: '#10b981',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        fontFamily: 'sans',
        pattern: 'wood-leaves', patternColor: '#6ee7b7',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },

  // ── 3. Lãng Mạn ────────────────────────────────────────────────
  {
    id: 'lang-man',
    name: 'Lãng Mạn',
    nameEn: 'Romantic',
    desc: 'Hoa hồng, cánh bướm, màu nước — ngọt ngào và mơ mộng dành cho các cặp đôi yêu sự lãng mạn',
    icon: '🌸',
    templates: [
      {
        id: 'romantic-pink', categoryId: 'lang-man',
        name: 'Hồng Ngọt Ngào', nameEn: 'Sweet Pink', icon: '🌹',
        gradient: 'from-pink-400 via-rose-300 to-pink-200',
        cardBg: 'bg-gradient-to-br from-pink-400 via-rose-300 to-pink-200',
        accent: 'text-rose-600', accentHex: '#e11d48',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-pink-200', fontColorSecondaryHex: '#fbcfe8',
        badgeColor: 'bg-pink-100 text-pink-700',
        fontFamily: 'serif',
        pattern: 'floral-rose', patternColor: '#fda4af',
        frameVariant: 'western-watercolor', frameColor: '#fbcfe8',
      },
      {
        id: 'watercolor', categoryId: 'lang-man',
        name: 'Màu Nước', nameEn: 'Watercolor', icon: '🎨',
        gradient: 'from-sky-200 via-rose-200 to-yellow-100',
        cardBg: 'bg-gradient-to-br from-sky-200 via-rose-200 to-yellow-100',
        accent: 'text-rose-500', accentHex: '#f43f5e',
        fontColor: 'text-gray-700', fontColorHex: '#374151',
        fontColorSecondary: 'text-rose-400', fontColorSecondaryHex: '#fb7185',
        badgeColor: 'bg-sky-100 text-sky-700',
        fontFamily: 'serif',
        pattern: 'floral-cherry', patternColor: '#fda4af',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'peony-garden', categoryId: 'lang-man',
        name: 'Vườn Hoa Mẫu Đơn', nameEn: 'Peony Garden', icon: '🌷',
        gradient: 'from-fuchsia-300 via-pink-400 to-rose-300',
        cardBg: 'bg-gradient-to-br from-fuchsia-300 via-pink-400 to-rose-300',
        accent: 'text-fuchsia-700', accentHex: '#a21caf',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-pink-200', fontColorSecondaryHex: '#fbcfe8',
        badgeColor: 'bg-fuchsia-100 text-fuchsia-700',
        fontFamily: 'sans',
        pattern: 'floral-cherry', patternColor: '#e879f9',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },

  // ── 4. Sang Trọng ──────────────────────────────────────────────
  {
    id: 'sang-trong',
    name: 'Sang Trọng — Luxury',
    nameEn: 'Luxury Metallic',
    desc: 'Ánh kim, ép nhũ vàng/bạc, dập nổi — đẳng cấp từ lần chạm đầu tiên, dành cho tiệc cưới cao cấp',
    icon: '💎',
    templates: [
      {
        id: 'gold-elegant', categoryId: 'sang-trong',
        name: 'Vàng Sang Trọng', nameEn: 'Gold Elegance', icon: '🌟',
        gradient: 'from-amber-800 via-amber-600 to-yellow-400',
        cardBg: 'bg-gradient-to-br from-amber-800 via-amber-600 to-yellow-400',
        accent: 'text-yellow-200', accentHex: '#fef08a',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-amber-200', fontColorSecondaryHex: '#fde68a',
        badgeColor: 'bg-amber-100 text-amber-700',
        fontFamily: 'serif',
        pattern: 'stars-shooting', patternColor: '#fde68a',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'black-gold', categoryId: 'sang-trong',
        name: 'Đen Vàng', nameEn: 'Black & Gold', icon: '🖤',
        gradient: 'from-gray-950 via-gray-900 to-amber-700',
        cardBg: 'bg-gradient-to-br from-gray-950 via-gray-900 to-amber-700',
        accent: 'text-yellow-300', accentHex: '#fde047',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-amber-300', fontColorSecondaryHex: '#fcd34d',
        badgeColor: 'bg-gray-100 text-gray-700',
        fontFamily: 'serif',
        pattern: 'stars-shooting', patternColor: '#fbbf24',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'rose-gold', categoryId: 'sang-trong',
        name: 'Hồng Ánh Kim', nameEn: 'Rose Gold', icon: '💗',
        gradient: 'from-rose-400 via-amber-300 to-yellow-200',
        cardBg: 'bg-gradient-to-br from-rose-400 via-amber-300 to-yellow-200',
        accent: 'text-rose-700', accentHex: '#be123c',
        fontColor: 'text-gray-800', fontColorHex: '#1f2937',
        fontColorSecondary: 'text-rose-500', fontColorSecondaryHex: '#f43f5e',
        badgeColor: 'bg-rose-100 text-rose-700',
        fontFamily: 'sans',
        pattern: 'stars-dust', patternColor: '#fda4af',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },

  // ── 5. Thiên Nhiên ─────────────────────────────────────────────
  {
    id: 'thien-nhien',
    name: 'Thiên Nhiên',
    nameEn: 'Nature & Earth',
    desc: 'Cây cỏ, hoa lá, tông màu đất — gần gũi với thiên nhiên, phù hợp tiệc cưới ngoài trời',
    icon: '🌿',
    templates: [
      {
        id: 'rustic-green', categoryId: 'thien-nhien',
        name: 'Xanh Rêu', nameEn: 'Rustic Green', icon: '🍃',
        gradient: 'from-lime-900 via-green-800 to-emerald-700',
        cardBg: 'bg-gradient-to-br from-lime-900 via-green-800 to-emerald-700',
        accent: 'text-lime-300', accentHex: '#bef264',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-lime-200', fontColorSecondaryHex: '#d9f99d',
        badgeColor: 'bg-green-100 text-green-700',
        fontFamily: 'sans',
        pattern: 'wood-bamboo', patternColor: '#86efac',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'earthy-beige', categoryId: 'thien-nhien',
        name: 'Đất Nâu', nameEn: 'Earth Tone', icon: '🤎',
        gradient: 'from-amber-900 via-stone-700 to-stone-500',
        cardBg: 'bg-gradient-to-br from-amber-900 via-stone-700 to-stone-500',
        accent: 'text-amber-300', accentHex: '#fcd34d',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-stone-300', fontColorSecondaryHex: '#d6d3d1',
        badgeColor: 'bg-stone-100 text-stone-700',
        fontFamily: 'sans',
        pattern: 'wood-leaves', patternColor: '#a3a07a',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'olive-garden', categoryId: 'thien-nhien',
        name: 'Vườn Ô Liu', nameEn: 'Olive Garden', icon: '🫒',
        gradient: 'from-green-700 via-emerald-600 to-teal-500',
        cardBg: 'bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500',
        accent: 'text-green-300', accentHex: '#86efac',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-emerald-200', fontColorSecondaryHex: '#a7f3d0',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        fontFamily: 'sans',
        pattern: 'wood-branch', patternColor: '#86efac',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },

  // ── 6. Cổ Điển ─────────────────────────────────────────────────
  {
    id: 'co-dien',
    name: 'Cổ Điển',
    nameEn: 'Vintage Classic',
    desc: 'Vintage, retro, hoài cổ — nét đẹp vượt thời gian, pha trộn giữa Âu Châu cổ điển và Á Đông',
    icon: '🕰️',
    templates: [
      {
        id: 'vintage-gold', categoryId: 'co-dien',
        name: 'Vintage Vàng', nameEn: 'Vintage Gold', icon: '📜',
        gradient: 'from-yellow-700 via-amber-500 to-yellow-300',
        cardBg: 'bg-gradient-to-br from-yellow-700 via-amber-500 to-yellow-300',
        accent: 'text-amber-900', accentHex: '#78350f',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-yellow-200', fontColorSecondaryHex: '#fef08a',
        badgeColor: 'bg-yellow-100 text-yellow-700',
        fontFamily: 'serif',
        pattern: 'waves-sine', patternColor: '#fde68a',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'vintage-rose', categoryId: 'co-dien',
        name: 'Hồng Cổ Điển', nameEn: 'Vintage Rose', icon: '🥀',
        gradient: 'from-rose-800 via-rose-600 to-pink-400',
        cardBg: 'bg-gradient-to-br from-rose-800 via-rose-600 to-pink-400',
        accent: 'text-rose-300', accentHex: '#fda4af',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-pink-300', fontColorSecondaryHex: '#f9a8d4',
        badgeColor: 'bg-rose-100 text-rose-700',
        fontFamily: 'serif',
        pattern: 'floral-rose', patternColor: '#fda4af',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'french-vintage', categoryId: 'co-dien',
        name: 'Pháp Cổ', nameEn: 'French Vintage', icon: '🗼',
        gradient: 'from-blue-800 via-indigo-600 to-slate-400',
        cardBg: 'bg-gradient-to-br from-blue-800 via-indigo-600 to-slate-400',
        accent: 'text-blue-300', accentHex: '#93c5fd',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-indigo-200', fontColorSecondaryHex: '#c7d2fe',
        badgeColor: 'bg-blue-100 text-blue-700',
        fontFamily: 'serif',
        pattern: 'geo-circle', patternColor: '#93c5fd',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },

  // ── 7. Văn Hóa Việt ────────────────────────────────────────────
  {
    id: 'van-hoa',
    name: 'Văn Hóa Việt',
    nameEn: 'Vietnamese Culture',
    desc: 'Áo dài, nón lá, trống đồng, hoa sen — tự hào bản sắc Việt Nam trong ngày trọng đại',
    icon: '🇻🇳',
    templates: [
      {
        id: 'ao-dai', categoryId: 'van-hoa',
        name: 'Áo Dài', nameEn: 'Ao Dai', icon: '👘',
        gradient: 'from-red-500 via-yellow-400 to-red-500',
        cardBg: 'bg-gradient-to-br from-red-500 via-yellow-400 to-red-500',
        accent: 'text-yellow-200', accentHex: '#fef08a',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-red-100', fontColorSecondaryHex: '#fee2e2',
        badgeColor: 'bg-red-100 text-red-700',
        fontFamily: 'sans',
        pattern: 'floral-lotus', patternColor: '#fde047',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'non-la', categoryId: 'van-hoa',
        name: 'Nón Lá', nameEn: 'Conical Hat', icon: '🍂',
        gradient: 'from-yellow-600 via-amber-500 to-stone-400',
        cardBg: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-stone-400',
        accent: 'text-stone-200', accentHex: '#e7e5e4',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-amber-200', fontColorSecondaryHex: '#fde68a',
        badgeColor: 'bg-amber-100 text-amber-700',
        fontFamily: 'sans',
        pattern: 'wood-branch', patternColor: '#fde68a',
        frameVariant: undefined, frameColor: undefined,
      },
      {
        id: 'truc-dong', categoryId: 'van-hoa',
        name: 'Trống Đồng', nameEn: 'Bronze Drum', icon: '🪘',
        gradient: 'from-teal-800 via-emerald-700 to-amber-600',
        cardBg: 'bg-gradient-to-br from-teal-800 via-emerald-700 to-amber-600',
        accent: 'text-amber-300', accentHex: '#fcd34d',
        fontColor: 'text-white', fontColorHex: '#ffffff',
        fontColorSecondary: 'text-teal-200', fontColorSecondaryHex: '#99f6e4',
        badgeColor: 'bg-teal-100 text-teal-700',
        fontFamily: 'sans',
        pattern: 'waves-ripple', patternColor: '#6ee7b7',
        frameVariant: undefined, frameColor: undefined,
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
// 유틸리티 함수 — 이 이하는 데이터를 수정하지 않음
// ═══════════════════════════════════════════════════════════════════

/** 모든 템플릿의 flat 배열 */
export const allTemplates: TemplateTheme[] = templateCategories.flatMap(c => c.templates)

/** id로 템플릿 조회 */
export function getTemplateById(id: string): TemplateTheme | undefined {
  return allTemplates.find(t => t.id === id)
}

/** 템플릿이 속한 카테고리 조회 */
export function getCategoryForTemplate(id: string): TemplateCategory | undefined {
  return templateCategories.find(c => c.templates.some(t => t.id === id))
}

/**
 * TemplateTheme에서 Tailwind accent 클래스를 배경색 클래스로 변환.
 * 예: 'text-yellow-300' → 'bg-yellow-300'
 */
export function accentToBg(accent: string): string {
  return accent.replace('text-', 'bg-')
}
