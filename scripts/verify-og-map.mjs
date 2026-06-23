/**
 * verify-og-map.mjs
 * OG 메타태그 동적 업데이트 + 지도 섹션 검증
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3300'
let passed = 0, failed = 0

function ok(cond, label, got) {
  if (cond) { console.log(`  ✅ ${label}`); passed++ }
  else       { console.error(`  ❌ ${label}${got !== undefined ? ` (got: ${JSON.stringify(got)})` : ''}`); failed++ }
}

const browser = await chromium.launch({ headless: true })
const page    = await browser.newPage()

// ── 1. 데모 페이지 OG 태그 ────────────────────────────────────────────────────
console.log('\n[1] 데모 페이지 OG 메타태그 동적 주입')
await page.goto(`${BASE}/classic-red`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

const ogTitle  = await page.getAttribute('meta[property="og:title"]',  'content') ?? ''
const ogDesc   = await page.getAttribute('meta[property="og:description"]', 'content') ?? ''
const ogImg    = await page.getAttribute('meta[property="og:image"]',   'content') ?? ''
const ogW      = await page.getAttribute('meta[property="og:image:width"]',  'content') ?? ''
const ogH      = await page.getAttribute('meta[property="og:image:height"]', 'content') ?? ''
const twCard   = await page.getAttribute('meta[name="twitter:card"]',   'content') ?? ''
const twImg    = await page.getAttribute('meta[name="twitter:image"]',  'content') ?? ''
const docTitle = await page.title()

ok(ogTitle.includes('Lễ cưới') && ogTitle.includes('&'), 'og:title 신랑신부 포함', ogTitle)
ok(ogDesc.includes('kính mời') || ogDesc.includes('ngày'), 'og:description 날짜 포함', ogDesc)
ok(ogImg.includes('functions/v1/og-image'), 'og:image → Edge Function URL', ogImg)
ok(ogW === '1200', 'og:image:width = 1200', ogW)
ok(ogH === '630',  'og:image:height = 630', ogH)
ok(twCard === 'summary_large_image', 'twitter:card 설정', twCard)
ok(twImg.includes('og-image'), 'twitter:image 설정', twImg)
ok(docTitle.includes('Lễ cưới'), 'document.title 업데이트', docTitle)

// ── 2. 언마운트 시 기본값 복원 (Landing 페이지 이동 후 확인) ──────────────────
console.log('\n[2] Landing 페이지 이동 시 OG 기본값 복원')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const landingTitle = await page.title()
ok(landingTitle.includes('Thiệp Cưới Online'), '기본 title 복원', landingTitle)

// ── 3. 지도 섹션 ─────────────────────────────────────────────────────────────
console.log('\n[3] 초대장 지도 섹션')
await page.goto(`${BASE}/classic-red`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

// 지도 iframe
const mapIframe = page.locator('iframe[title="Bản đồ địa điểm tổ chức"]')
const iframeCount = await mapIframe.count()
ok(iframeCount === 1, 'Google Maps iframe 존재', iframeCount)

if (iframeCount > 0) {
  const src = (await mapIframe.getAttribute('src')) ?? ''
  ok(src.includes('maps.google.com') && src.includes('output=embed'), 'iframe src embed URL', src.slice(0, 60))
  ok(src.includes('z=16'), 'iframe 줌 레벨 z=16 포함', src.slice(0, 80))
}

// Chỉ đường 링크
const chiDuong = page.locator('a:has-text("Chỉ đường")')
ok(await chiDuong.count() > 0, '"Chỉ đường" 링크 존재')
const chiDuongHref = await chiDuong.getAttribute('href') ?? ''
ok(chiDuongHref.includes('maps.google.com/maps/dir') && chiDuongHref.includes('destination='), '"Chỉ đường" href 정확', chiDuongHref.slice(0, 60))
ok(await chiDuong.getAttribute('target') === '_blank', '"Chỉ đường" target=_blank')

// "Xem bản đồ" 링크 (iframe 위 overlay)
const xemBanDo = page.locator('a:has-text("Xem bản đồ")')
ok(await xemBanDo.count() > 0, '"Xem bản đồ" 링크 존재')

// Lưu lịch 버튼 (기존 기능 유지)
const luuLich = page.locator('button:has-text("Lưu lịch")')
ok(await luuLich.count() > 0, '"Lưu lịch" 버튼 유지')

// ── 결과 ─────────────────────────────────────────────────────────────────────
await browser.close()
console.log(`\n결과: ${passed} 통과 / ${passed + failed}개 테스트`)
if (failed > 0) { console.error(`실패: ${failed}개`); process.exitCode = 1 }
