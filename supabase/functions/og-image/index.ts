/**
 * og-image Edge Function
 * 초대장의 신랑신부 이름·날짜를 포함한 OG 이미지(PNG 1200×630)를 동적 생성.
 *
 * URL 파라미터 (두 가지 방식 지원):
 *   ?d=<encodedData>   — /v/:d 공유 URL과 동일한 base64 인코딩
 *   ?groom=X&bride=Y&date=DD/MM/YYYY&venue=...&accent=%23dc2626
 *
 * 배포:
 *   supabase functions deploy og-image
 *   (config.toml 에 verify_jwt=false 설정됨)
 */

import * as ResvgWasm from 'npm:@resvg/resvg-wasm@2.6.2'
const { Resvg } = ResvgWasm

// WASM은 콜드 스타트당 1회만 초기화
let wasmReady = false
async function ensureWasm() {
  if (wasmReady) return
  await ResvgWasm.default(
    fetch('https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm'),
  )
  wasmReady = true
}

// ── base64url → InvitationData ────────────────────────────────────────────────

interface ShareData {
  groom?: string
  bride?: string
  date?: string
  venue?: string
  template?: string
}

function decodeShareUrl(encoded: string): ShareData | null {
  try {
    const padded =
      encoded.replace(/-/g, '+').replace(/_/g, '/') +
      '=='.slice(0, (4 - (encoded.length % 4)) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json)
  } catch { return null }
}

// ── 테마 ID → 액센트 컬러 매핑 ────────────────────────────────────────────────

const THEME_ACCENTS: Record<string, string> = {
  'classic-red':      '#dc2626',
  'cherry-blossom':   '#f43f5e',
  'pastel-garden':    '#db2777',
  'vietnam-tradition':'#b91c1c',
  'minimal-sage':     '#78716c',
  'dark-elegance':    '#d1d5db',
  'gold-luxury':      '#d97706',
  'lavender-dream':   '#9333ea',
  'ocean-breeze':     '#0ea5e9',
  'forest-wedding':   '#16a34a',
}

// ── SVG OG 이미지 생성 ─────────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
  return [...text].length > max ? [...text].slice(0, max).join('') + '…' : text
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildSvg(
  groom: string,
  bride: string,
  date: string,
  venue: string,
  accentHex: string,
): string {
  const W = 1200, H = 630

  // 이름 길이에 따른 폰트 크기 조절
  const groomLast = escapeXml(groom.split(' ').pop() ?? groom)
  const brideLast = escapeXml(bride.split(' ').pop() ?? bride)
  const nameLen = [...groomLast].length + [...brideLast].length
  const nameFontSize = nameLen > 20 ? 72 : nameLen > 14 ? 88 : 100

  const accentR = parseInt(accentHex.replace('#', '').slice(0, 2), 16)
  const accentG = parseInt(accentHex.replace('#', '').slice(2, 4), 16)
  const accentB = parseInt(accentHex.replace('#', '').slice(4, 6), 16)
  const accentLight = `rgba(${accentR},${accentG},${accentB},0.08)`
  const accentMed   = `rgba(${accentR},${accentG},${accentB},0.40)`

  const venueText = venue ? escapeXml(truncate(venue, 55)) : ''
  const dateText  = escapeXml(date)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"  stop-color="${accentLight}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${accentLight}"/>
    </linearGradient>
    <linearGradient id="vline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="transparent"/>
      <stop offset="50%"  stop-color="${accentMed}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 외곽 보더 -->
  <rect x="28" y="28" width="${W-56}" height="${H-56}"
    fill="none" stroke="${accentHex}" stroke-width="1.5" stroke-opacity="0.2" rx="8"/>
  <rect x="40" y="40" width="${W-80}" height="${H-80}"
    fill="none" stroke="${accentHex}" stroke-width="0.75" stroke-opacity="0.12" rx="4"/>

  <!-- 코너 장식 (L자) -->
  ${['0,0,0', `${W},0,90`, `0,${H},270`, `${W},${H},180`].map(pt => {
    const [cx, cy, rot] = pt.split(',')
    return `<g transform="translate(${cx},${cy}) rotate(${rot})">
      <path d="M52,110 L52,52 L110,52" fill="none" stroke="${accentHex}" stroke-width="2" stroke-opacity="0.35"/>
    </g>`
  }).join('\n  ')}

  <!-- 상단 "WEDDING INVITATION" -->
  <text x="${W/2}" y="135" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="22" font-weight="400" letter-spacing="10"
    fill="${accentHex}" fill-opacity="0.55">WEDDING INVITATION</text>

  <!-- 구분선 상단 -->
  <line x1="${W*0.3}" y1="162" x2="${W*0.7}" y2="162"
    stroke="url(#vline)" stroke-width="1.2"/>

  <!-- 신랑 이름 -->
  <text x="${W/2}" y="${228 + (100 - nameFontSize) * 0.3}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${nameFontSize}" font-weight="700"
    fill="#1f2937">${groomLast}</text>

  <!-- & 기호 -->
  <text x="${W/2}" y="${310 + (100 - nameFontSize) * 0.15}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="52" font-weight="300"
    fill="${accentHex}" fill-opacity="0.8">&amp;</text>

  <!-- 신부 이름 -->
  <text x="${W/2}" y="${385 + (100 - nameFontSize) * 0.0}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${nameFontSize}" font-weight="700"
    fill="#1f2937">${brideLast}</text>

  <!-- 구분선 하단 / 날짜 / 장소 — y-offset 조정 (이름 길면 +10) -->
  ${(() => {
    const yo = nameLen > 20 ? 10 : 0
    return `
  <line x1="${W*0.3}" y1="${450+yo}" x2="${W*0.7}" y2="${450+yo}" stroke="url(#vline)" stroke-width="1.2"/>
  <text x="${W/2}" y="${490+yo}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="30" font-weight="600" letter-spacing="3" fill="#374151">${dateText}</text>
  ${venueText ? `<text x="${W/2}" y="${530+yo}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="22" fill="#6b7280" fill-opacity="0.8">${venueText}</text>` : ''}`
  })()}

  <!-- 하단 하트 + 도메인 -->
  <text x="${W/2}" y="${H-52}" text-anchor="middle"
    font-family="Georgia, serif" font-size="22"
    fill="${accentHex}" fill-opacity="0.45">♥</text>
  <text x="${W/2}" y="${H-24}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="18" fill="#9ca3af">thiep-cuoi-online.com</text>
</svg>`
}

// ── 요청 처리 ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    })
  }
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const url    = new URL(req.url)
  const params = url.searchParams

  // URL 파라미터 파싱
  let groom  = params.get('groom')  ?? ''
  let bride  = params.get('bride')  ?? ''
  let date   = params.get('date')   ?? ''
  let venue  = params.get('venue')  ?? ''
  let accent = params.get('accent') ?? '#dc2626'
  let theme  = params.get('theme')  ?? ''

  // base64 인코딩된 전체 데이터가 있으면 우선 디코딩
  const d = params.get('d')
  if (d) {
    const decoded = decodeShareUrl(d)
    if (decoded) {
      groom  = decoded.groom  || groom
      bride  = decoded.bride  || bride
      date   = decoded.date   || date
      venue  = decoded.venue  || venue
      theme  = decoded.template || theme
    }
  }

  // 테마 ID → 액센트 컬러
  if (theme && THEME_ACCENTS[theme]) {
    accent = THEME_ACCENTS[theme]
  }

  // 최소한 이름이 있어야 함
  if (!groom && !bride) {
    groom = 'Chú rể'; bride = 'Cô dâu'
  }

  const svgStr = buildSvg(groom, bride, date, venue, accent)

  // PNG 변환 시도, 실패 시 SVG 반환
  try {
    await ensureWasm()
    const resvg = new Resvg(svgStr, {
      fitTo: { mode: 'width', value: 1200 },
      font:  { loadSystemFonts: true },
    })
    const rendered = resvg.render()
    const png      = rendered.asPng()

    return new Response(png, {
      headers: {
        'Content-Type':  'image/png',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('resvg failed, falling back to SVG:', err)
    return new Response(svgStr, {
      headers: {
        'Content-Type':  'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
