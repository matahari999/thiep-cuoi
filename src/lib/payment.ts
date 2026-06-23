/**
 * payment.ts — Lemon Squeezy 결제 관련 유틸리티
 *
 * invitationId 파생 규칙:
 *   /v/:d 라우트에서 encodedData의 첫 48글자를 ID로 사용.
 *   같은 URL = 같은 ID = 한 번 결제하면 모든 기기에서 다운로드 가능.
 */

import { supabase } from './supabase'

// ── ID 파생 ──────────────────────────────────────────────────────────────────

/** 공유 URL encodedData → 안정적 invitation ID */
export function deriveInvitationId(encodedData: string): string {
  return encodedData.slice(0, 48)
}

// ── Supabase 결제 상태 조회 ──────────────────────────────────────────────────

export async function checkPaymentStatus(invitationId: string): Promise<boolean> {
  if (!supabase || !invitationId) return false
  try {
    const { data } = await supabase
      .from('paid_invitations')
      .select('invitation_id')
      .eq('invitation_id', invitationId)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

// ── Lemon Squeezy 체크아웃 URL 생성 ─────────────────────────────────────────

export function buildCheckoutUrl(invitationId: string): string {
  const base = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL as string | undefined
  if (!base || base.includes('YOUR-STORE')) return ''

  // 결제 완료 후 돌아올 URL (현재 페이지 + ?paid=ok)
  const successUrl = window.location.href.split('?')[0] + '?paid=ok'

  const params = new URLSearchParams({
    'checkout[custom][invitation_id]': invitationId,
    'checkout[success_url]':          successUrl,
  })
  return `${base}?${params.toString()}`
}

// ── Canvas HD 다운로드 ────────────────────────────────────────────────────────

export interface DownloadCardData {
  groom:     string
  bride:     string
  date:      string
  time:      string
  venue:     string
  heroPhoto: string
  accentHex:             string
  fontColorHex:          string
  fontColorSecondaryHex: string
}

/**
 * 1080×1920 초대장 카드 이미지를 Canvas로 렌더링 후 PNG 다운로드.
 * 외부 라이브러리 없이 Canvas API만 사용.
 */
export async function downloadInvitationCard(card: DownloadCardData, filename: string): Promise<void> {
  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // ── 배경 그라디언트 ──
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0,   hexAlpha(card.accentHex, 0.18))
  grad.addColorStop(0.5, '#ffffff')
  grad.addColorStop(1,   hexAlpha(card.accentHex, 0.10))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── 중앙 부드러운 원형 후광 ──
  const radial = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.7)
  radial.addColorStop(0,   hexAlpha(card.accentHex, 0.09))
  radial.addColorStop(1,   'transparent')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, W, H)

  // ── 상단 장식선 ──
  drawOrnamentalLines(ctx, W, H, card.accentHex)

  // ── 히어로 사진 ──
  if (card.heroPhoto && card.heroPhoto.startsWith('data:')) {
    await drawHeroPhoto(ctx, card.heroPhoto, W, H)
  } else {
    // 사진 없을 때: 하트 플레이스홀더
    drawHeartPlaceholder(ctx, W, H, card.accentHex)
  }

  // ── WEDDING INVITATION 레이블 ──
  ctx.save()
  ctx.font = `300 ${px(36)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = hexAlpha(card.fontColorSecondaryHex, 0.6)
  ctx.letterSpacing = `${px(14)}`
  ctx.textAlign = 'center'
  ctx.fillText('WEDDING  INVITATION', W / 2, H * 0.575)
  ctx.restore()

  // ── 구분선 ──
  drawThinLine(ctx, W, H * 0.595, card.accentHex)

  // ── 커플 이름 ──
  const groomLast = card.groom.split(' ').pop() ?? card.groom
  const brideLast = card.bride.split(' ').pop() ?? card.bride
  const nameLen = [...groomLast].length + [...brideLast].length
  const nameFontSize = nameLen > 18 ? 88 : nameLen > 12 ? 108 : 128

  ctx.save()
  ctx.font = `700 ${px(nameFontSize)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = card.fontColorHex
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(groomLast, W / 2, H * 0.638)
  ctx.restore()

  // & 기호
  ctx.save()
  ctx.font = `300 ${px(60)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = card.accentHex
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('&', W / 2, H * 0.690)
  ctx.restore()

  ctx.save()
  ctx.font = `700 ${px(nameFontSize)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = card.fontColorHex
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(brideLast, W / 2, H * 0.742)
  ctx.restore()

  // ── 구분선 ──
  drawThinLine(ctx, W, H * 0.775, card.accentHex)

  // ── 날짜 ──
  ctx.save()
  ctx.font = `600 ${px(52)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = card.fontColorHex
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(formatDateDisplay(card.date), W / 2, H * 0.814)
  ctx.restore()

  // ── 시간 ──
  ctx.save()
  ctx.font = `400 ${px(38)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = hexAlpha(card.fontColorHex, 0.65)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(card.time, W / 2, H * 0.848)
  ctx.restore()

  // ── 장소 (긴 텍스트 자동 줄바꿈) ──
  ctx.save()
  ctx.font = `400 ${px(36)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = hexAlpha(card.fontColorHex, 0.55)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  wrapText(ctx, card.venue, W / 2, H * 0.885, W * 0.8, 44)
  ctx.restore()

  // ── 하단 장식 ──
  drawBottomOrnament(ctx, W, H, card.accentHex)

  // ── 다운로드 ──
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png', 1.0)
  a.download = filename + '.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ── Canvas 유틸리티 ──────────────────────────────────────────────────────────

function px(n: number): string { return `${n}px` }

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatDateDisplay(date: string): string {
  if (!date) return ''
  const [d, m, y] = date.split('/').map(Number)
  if (!d || !m || !y) return date
  const months = ['T.1','T.2','T.3','T.4','T.5','T.6','T.7','T.8','T.9','T.10','T.11','T.12']
  return `${d < 10 ? '0'+d : d} ${months[m-1] ?? ''}  ${y}`
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineH: number,
): void {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else { line = test }
  }
  if (line) lines.push(line)
  const totalH = lines.length * lineH
  lines.forEach((l, i) => ctx.fillText(l, x, y - totalH / 2 + i * lineH + lineH / 2))
}

async function drawHeroPhoto(
  ctx: CanvasRenderingContext2D,
  src: string,
  W: number,
  H: number,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const photoH = H * 0.50
      const photoW = W * 0.78
      const photoX = (W - photoW) / 2
      const photoY = H * 0.045

      // 클리핑 마스크 (둥근 상단 직사각형)
      ctx.save()
      roundedRect(ctx, photoX, photoY, photoW, photoH, 32)
      ctx.clip()

      // object-fit: cover
      const iAR = img.width / img.height
      const cAR = photoW / photoH
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (iAR > cAR) { sw = img.height * cAR; sx = (img.width - sw) / 2 }
      else            { sh = img.width / cAR;  sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH)
      ctx.restore()

      // 사진 하단 부드러운 페이드 (배경색으로)
      const fade = ctx.createLinearGradient(0, photoY + photoH * 0.65, 0, photoY + photoH)
      fade.addColorStop(0, 'rgba(255,255,255,0)')
      fade.addColorStop(1, 'rgba(255,255,255,1)')
      ctx.fillStyle = fade
      ctx.fillRect(photoX, photoY + photoH * 0.65, photoW, photoH * 0.35)

      resolve()
    }
    img.onerror = () => resolve()
    img.src = src
  })
}

function drawHeartPlaceholder(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  accentHex: string,
): void {
  const cx = W / 2, cy = H * 0.27, r = 60
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = accentHex
  ctx.beginPath()
  ctx.moveTo(cx, cy + r * 0.5)
  ctx.bezierCurveTo(cx, cy, cx - r * 1.5, cy - r * 0.5, cx - r * 1.5, cy - r * 1)
  ctx.bezierCurveTo(cx - r * 1.5, cy - r * 2, cx, cy - r * 1.5, cx, cy - r * 0.5)
  ctx.bezierCurveTo(cx, cy - r * 1.5, cx + r * 1.5, cy - r * 2, cx + r * 1.5, cy - r * 1)
  ctx.bezierCurveTo(cx + r * 1.5, cy - r * 0.5, cx, cy, cx, cy + r * 0.5)
  ctx.fill()
  ctx.restore()
}

function drawOrnamentalLines(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  accentHex: string,
): void {
  // 상단 좌우 코너 장식
  const corners: [number, number, number][] = [
    [0, 0, 0],
    [W, 0, Math.PI / 2],
    [0, H, -Math.PI / 2],
    [W, H, Math.PI],
  ]
  ctx.save()
  ctx.strokeStyle = hexAlpha(accentHex, 0.35)
  ctx.lineWidth = 2
  for (const [cx, cy, angle] of corners) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    // L-자형 장식선
    ctx.beginPath()
    ctx.moveTo(20, 80)
    ctx.lineTo(20, 20)
    ctx.lineTo(80, 20)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

function drawThinLine(ctx: CanvasRenderingContext2D, W: number, y: number, accentHex: string): void {
  const lineW = W * 0.5
  const lineX = (W - lineW) / 2
  const grad = ctx.createLinearGradient(lineX, 0, lineX + lineW, 0)
  grad.addColorStop(0,   'transparent')
  grad.addColorStop(0.5, hexAlpha(accentHex, 0.5))
  grad.addColorStop(1,   'transparent')
  ctx.save()
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(lineX, y)
  ctx.lineTo(lineX + lineW, y)
  ctx.stroke()
  ctx.restore()
}

function drawBottomOrnament(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  accentHex: string,
): void {
  ctx.save()
  ctx.font = `300 ${px(40)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = hexAlpha(accentHex, 0.5)
  ctx.textAlign = 'center'
  ctx.fillText('♥', W / 2, H * 0.960)
  ctx.restore()

  // 하단 watermark-free 표시
  ctx.save()
  ctx.font = `300 ${px(24)} "Be Vietnam Pro", sans-serif`
  ctx.fillStyle = hexAlpha('#6b7280', 0.35)
  ctx.textAlign = 'center'
  ctx.fillText('thiep-cuoi-online.com', W / 2, H * 0.982)
  ctx.restore()
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
