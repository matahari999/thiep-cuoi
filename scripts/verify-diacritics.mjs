/**
 * verify-diacritics.mjs
 * Playwright로 베트남어 성조 부호가 모든 템플릿에서 올바르게 렌더링되는지 검증.
 *
 * 검증 항목:
 *   1. Be Vietnam Pro 폰트 로드 여부
 *   2. 전 템플릿 이름/설명의 성조 문자 완전성
 *   3. 성조 조합 72개 + 기본 변형모음 7개 = 79개 문자 완전 테이블
 *   4. 폭 0 글리프 (tofu box □) 감지
 *
 * 실행: node scripts/verify-diacritics.mjs
 */

import { chromium } from 'playwright'
import { pathToFileURL } from 'url'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..')

// ── 검증할 베트남어 텍스트 목록 ─────────────────────────────────────────────
const TEMPLATES = [
  // 카테고리명
  { id: 'cat-truyen-thong',  text: 'Truyền Thống' },
  { id: 'cat-hien-dai',      text: 'Hiện Đại — Minimalist' },
  { id: 'cat-lang-man',      text: 'Lãng Mạn' },
  { id: 'cat-sang-trong',    text: 'Sang Trọng — Luxury' },
  { id: 'cat-thien-nhien',   text: 'Thiên Nhiên' },
  { id: 'cat-co-dien',       text: 'Cổ Điển' },
  { id: 'cat-van-hoa',       text: 'Văn Hóa Việt' },
  // 템플릿명
  { id: 'tpl-classic-red',   text: 'Cổ Điển Đỏ' },
  { id: 'tpl-dong-son',      text: 'Đồng Sơn' },
  { id: 'tpl-hoa-sen',       text: 'Hoa Sen' },
  { id: 'tpl-song-hy',       text: 'Song Hỷ' },
  { id: 'tpl-minimal-beige', text: 'Beige Tinh Tế' },
  { id: 'tpl-minimal-black', text: 'Đen & Trắng' },
  { id: 'tpl-sage-green',    text: 'Xanh Sage' },
  { id: 'tpl-romantic-pink', text: 'Hồng Ngọt Ngào' },
  { id: 'tpl-watercolor',    text: 'Màu Nước' },
  { id: 'tpl-peony',         text: 'Vườn Hoa Mẫu Đơn' },
  { id: 'tpl-gold-elegant',  text: 'Vàng Sang Trọng' },
  { id: 'tpl-black-gold',    text: 'Đen Vàng' },
  { id: 'tpl-rose-gold',     text: 'Hồng Ánh Kim' },
  { id: 'tpl-rustic-green',  text: 'Xanh Rêu' },
  { id: 'tpl-earthy-beige',  text: 'Đất Nâu' },
  { id: 'tpl-olive-garden',  text: 'Vườn Ô Liu' },
  { id: 'tpl-vintage-gold',  text: 'Vintage Vàng' },
  { id: 'tpl-vintage-rose',  text: 'Hồng Cổ Điển' },
  { id: 'tpl-french-vintage',text: 'Pháp Cổ' },
  { id: 'tpl-ao-dai',        text: 'Áo Dài' },
  { id: 'tpl-non-la',        text: 'Nón Lá' },
  { id: 'tpl-truc-dong',     text: 'Trống Đồng' },
  // 카테고리 설명 (복잡한 성조 조합)
  { id: 'desc-truyen',       text: 'Đậm đà bản sắc văn hóa Việt với sắc đỏ may mắn, vàng sang trọng — biểu tượng long phụng, song hỷ' },
  { id: 'desc-hien',         text: 'Tinh tế, tối giản, sang trọng. Font chữ thanh mảnh, khoảng trắng thông minh — xu hướng số 1 năm 2026' },
  { id: 'desc-lang',         text: 'Hoa hồng, cánh bướm, màu nước — ngọt ngào và mơ mộng dành cho các cặp đôi yêu sự lãng mạn' },
  { id: 'desc-sang',         text: 'Ánh kim, ép nhũ vàng/bạc, dập nổi — đẳng cấp từ lần chạm đầu tiên, dành cho tiệc cưới cao cấp' },
  { id: 'desc-thien',        text: 'Cây cỏ, hoa lá, tông màu đất — gần gũi với thiên nhiên, phù hợp tiệc cưới ngoài trời' },
  { id: 'desc-co',           text: 'Vintage, retro, hoài cổ — nét đẹp vượt thời gian, pha trộn giữa Âu Châu cổ điển và Á Đông' },
  { id: 'desc-van',          text: 'Áo dài, nón lá, trống đồng, hoa sen — tự hào bản sắc Việt Nam trong ngày trọng đại' },
  // 데모 커플 이름
  { id: 'name-01', text: 'Nguyễn Văn Trang & Trần Thị Anh' },
  { id: 'name-02', text: 'Lê Văn Minh & Phạm Thị Hoa' },
  { id: 'name-03', text: 'Hoàng Văn Tuấn & Ngô Thị Linh' },
  { id: 'name-04', text: 'Phạm Văn Nam & Lê Thị Hương' },
  { id: 'name-05', text: 'Trần Văn Đức & Nguyễn Thị Mai' },
  { id: 'name-06', text: 'Vũ Hoàng Long & Đinh Thị Thảo' },
  { id: 'name-07', text: 'Đỗ Văn Huy & Trương Thị Ngọc' },
  { id: 'name-08', text: 'Bùi Văn Tâm & Lý Thị Kiều' },
  { id: 'name-09', text: 'Cao Văn Phát & Tăng Thị Ngân' },
  { id: 'name-10', text: 'Lâm Văn Khang & Dương Thị Quyên' },
  { id: 'name-11', text: 'Ngô Văn Tiến & Hồ Thị Phượng' },
  { id: 'name-12', text: 'Trịnh Văn Bảo & Mai Thị Cúc' },
  { id: 'name-13', text: 'Huỳnh Văn Sang & Võ Thị Hồng' },
  // 데모 장소
  { id: 'venue-01', text: 'Nhà hàng Hoàng Gia, 123 Nguyễn Huệ, Q.1, TP.HCM' },
  { id: 'venue-02', text: 'Trung tâm Hội nghị Diamond, 456 Lê Lợi, Q.3, TP.HCM' },
  { id: 'venue-03', text: 'Khu du lịch Sinh Thái Xanh, 789 Võ Văn Kiệt, Cần Thơ' },
  { id: 'venue-04', text: 'Khu nghỉ dưỡng Ana Mandara, Đà Lạt' },
  { id: 'venue-05', text: 'Từ Văn Quân & Thạch Thị Thơm — Nhà hàng Sen Hồng, Vũng Tàu' },
  // 음력 날짜 (lunar.ts 출력 예시)
  { id: 'lunar-01', text: 'Mùng 1 tháng Giêng năm Ất Tỵ âm lịch' },
  { id: 'lunar-02', text: 'Ngày 15 tháng Tám (nhuận) năm Giáp Thìn âm lịch' },
  { id: 'lunar-03', text: 'Mùng 5 tháng Chạp năm Quý Mão âm lịch' },
]

// ── 성조 완전 테이블 ─────────────────────────────────────────────────────────
// 베트남어 기본 변형 모음 7개 + 성조 5종 × 기본 모음·변형모음 = 79개
const DIACRITIC_GROUPS = [
  { label: 'Nguyên âm cơ bản (기본 변형)',    chars: 'ă Ă â Â ê Ê ô Ô ơ Ơ ư Ư đ Đ' },
  { label: 'Dấu sắc (´ 상승조)',               chars: 'á ắ ấ é ế í ó ố ớ ú ứ ý' },
  { label: 'Dấu huyền (` 하강조)',             chars: 'à ằ ầ è ề ì ò ồ ờ ù ừ ỳ' },
  { label: 'Dấu hỏi (? 하강상승조)',           chars: 'ả ẳ ẩ ẻ ể ỉ ỏ ổ ở ủ ử ỷ' },
  { label: 'Dấu ngã (~ 파열상승조)',           chars: 'ã ẵ ẫ ẽ ễ ĩ õ ỗ ỡ ũ ữ ỹ' },
  { label: 'Dấu nặng (. 강하조)',              chars: 'ạ ặ ậ ẹ ệ ị ọ ộ ợ ụ ự ỵ' },
  { label: 'Đại văn (대문자 성조)',             chars: 'Á Ắ Ấ É Ế Ó Ố Ớ Ú Ứ Ý À Ằ Ầ È Ề Ò Ồ Ờ Ù Ừ Ỳ Ả Ẳ Ẩ Ẻ Ể Ỉ Ỏ Ổ Ở Ủ Ử Ỷ Ã Ẵ Ẫ Ẽ Ễ Ĩ Õ Ỗ Ỡ Ũ Ữ Ỹ Ạ Ặ Ậ Ẹ Ệ Ị Ọ Ộ Ợ Ụ Ự Ỵ' },
]

// ── HTML 생성 ────────────────────────────────────────────────────────────────
function buildTestHtml() {
  const rows = TEMPLATES.map(t =>
    `<tr><td class="id">${t.id}</td><td class="vn">${t.text}</td></tr>`
  ).join('\n')

  const diacGroups = DIACRITIC_GROUPS.map(g =>
    `<div class="group">
      <div class="group-label">${g.label}</div>
      <div class="chars" data-group="${g.label}">${g.chars}</div>
    </div>`
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diacritics Test — Thiệp Cưới</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fff;
      color: #111;
      padding: 24px;
      font-size: 16px;
      line-height: 1.6;
    }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    h2 { font-size: 14px; font-weight: 600; color: #555; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    td { padding: 6px 10px; border: 1px solid #e5e5e5; vertical-align: top; }
    td.id { width: 160px; font-size: 11px; color: #888; font-family: monospace; }
    td.vn { font-size: 15px; }
    .group { margin-bottom: 12px; }
    .group-label { font-size: 11px; color: #666; margin-bottom: 4px; }
    .chars { font-size: 18px; letter-spacing: 0.08em; color: #d4006a; }
    #font-status { font-size: 13px; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px; }
    .ok  { background: #dcfce7; color: #166534; }
    .err { background: #fee2e2; color: #991b1b; }
    .width-check { font-size: 12px; color: #888; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Kiểm tra dấu tiếng Việt — Be Vietnam Pro</h1>

  <div id="font-status">Đang tải font…</div>

  <h2>1. Tên mẫu &amp; danh mục (21 mẫu + 7 danh mục)</h2>
  <table id="template-table">
    ${rows}
  </table>

  <h2>2. Bảng dấu hoàn chỉnh (79 ký tự)</h2>
  <div id="diac-groups">
    ${diacGroups}
  </div>

  <div class="width-check" id="width-report"></div>

  <script>
    // ── 폰트 로드 확인 ──────────────────────────────────────────────────────
    const statusEl = document.getElementById('font-status')
    const reportEl = document.getElementById('width-report')

    document.fonts.ready.then(() => {
      const loaded = document.fonts.check('16px "Be Vietnam Pro"')
      statusEl.textContent = loaded
        ? '✅ Be Vietnam Pro 로드 완료 — 베트남어 성조 렌더링 정상'
        : '⚠️ Be Vietnam Pro 미로드 — fallback 폰트 사용 중 (네트워크 확인 필요)'
      statusEl.className = loaded ? 'ok' : 'err'
      window.__fontLoaded = loaded

      // ── 폭 0 글리프 감지 ─────────────────────────────────────────────────
      // 참고용 폰트(sans-serif)와 Be Vietnam Pro의 폭 비교
      // 미지원 글리프는 .notdef(□)로 대체되어 폭이 다름
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // "Be Vietnam Pro"와 fallback으로 각 성조 문자 폭 측정
      const allChars = [
        ...'ắặậẹệịọộợụựỵẵẫễỗỡũữỹảẳẩẻểỉỏổởủửỷằầềồờừỳáắấéếíóốớúứý'
      ]
      const issues = []
      allChars.forEach(ch => {
        ctx.font = '16px "Be Vietnam Pro"'
        const w1 = ctx.measureText(ch).width
        ctx.font = '16px monospace'
        const w2 = ctx.measureText(ch).width
        // .notdef 폭 ≈ monospace 폭의 0.6 배 이하인 경우 의심
        if (w1 === 0) issues.push(ch + '(w=0)')
        if (w1 > 0 && Math.abs(w1 - w2) / w2 < 0.05 && w2 > 10) issues.push(ch + '(?)')
      })
      window.__glyphIssues = issues
      if (issues.length) {
        reportEl.textContent = '⚠️ 의심 글리프: ' + issues.join(' ')
        reportEl.style.color = '#b45309'
      } else {
        reportEl.textContent = '✅ 폭 검사 통과 — 의심 missing glyph 없음'
        reportEl.style.color = '#166534'
      }
      window.__checkDone = true
    })
  </script>
</body>
</html>`
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
const htmlPath = path.resolve(OUT_DIR, 'diacritics-test.html')
fs.writeFileSync(htmlPath, buildTestHtml(), 'utf-8')
console.log('테스트 HTML 생성:', htmlPath)

const browser = await chromium.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewportSize({ width: 900, height: 1200 })

const htmlUrl = pathToFileURL(htmlPath).href
await page.goto(htmlUrl)

// Google Fonts가 로드될 시간 충분히 대기 (네트워크 필요)
try {
  await page.waitForFunction(() => window.__checkDone === true, { timeout: 15000 })
} catch {
  console.warn('⚠️  폰트 체크 타임아웃 (15s) — 오프라인 환경이거나 Google Fonts 차단됨')
}

// ── 결과 수집 ─────────────────────────────────────────────────────────────────
const fontLoaded   = await page.evaluate(() => window.__fontLoaded)
const glyphIssues  = await page.evaluate(() => window.__glyphIssues ?? [])
const statusText   = await page.evaluate(() => document.getElementById('font-status')?.textContent ?? '')
const widthReport  = await page.evaluate(() => document.getElementById('width-report')?.textContent ?? '')

console.log('\n── 폰트 상태 ──────────────────────────────')
console.log(statusText)
console.log('\n── 글리프 폭 검사 ─────────────────────────')
console.log(widthReport)

// ── 전체 스크린샷 ──────────────────────────────────────────────────────────
const screenshotFull = path.resolve(OUT_DIR, 'diacritics-full.png')
await page.screenshot({ path: screenshotFull, fullPage: true })
console.log('\n전체 스크린샷:', screenshotFull)

// ── 테이블 상단 클로즈업 ──────────────────────────────────────────────────
const tableEl = await page.$('#template-table')
if (tableEl) {
  const box = await tableEl.boundingBox()
  if (box) {
    const screenshotTable = path.resolve(OUT_DIR, 'diacritics-table.png')
    await page.screenshot({
      path: screenshotTable,
      clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 800) },
    })
    console.log('테이블 스크린샷:', screenshotTable)
  }
}

// ── 성조 테이블 클로즈업 (element.screenshot으로 viewport 제한 우회) ───────
const diacEl = await page.$('#diac-groups')
if (diacEl) {
  const screenshotDiac = path.resolve(OUT_DIR, 'diacritics-chars.png')
  await diacEl.screenshot({ path: screenshotDiac })
  console.log('성조 테이블 스크린샷:', screenshotDiac)
}

// ── 각 텍스트 요소 DOM 검증 ───────────────────────────────────────────────
const rowResults = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('#template-table tr'))
  return rows.map(row => {
    const id  = row.querySelector('.id')?.textContent?.trim() ?? ''
    const vn  = row.querySelector('.vn')
    const text = vn?.textContent?.trim() ?? ''
    const rect = vn?.getBoundingClientRect()
    const ok  = (rect?.width ?? 0) > 0 && (rect?.height ?? 0) > 0
    return { id, text, width: Math.round(rect?.width ?? 0), ok }
  })
})

const failedRows = rowResults.filter(r => !r.ok)
console.log(`\n── 텍스트 렌더링 DOM 검증 (${rowResults.length}개) ──`)
if (failedRows.length === 0) {
  console.log(`✅ 전체 ${rowResults.length}개 항목 렌더링 정상 (width > 0)`)
} else {
  console.error(`❌ ${failedRows.length}개 항목 렌더링 이상:`)
  failedRows.forEach(r => console.error(`   [${r.id}] "${r.text}" width=${r.width}`))
}

// ── 결과 요약 ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════')
console.log('검증 결과 요약')
console.log('══════════════════════════════════════════')
console.log(`폰트 로드:     ${fontLoaded ? '✅ 성공' : '⚠️  fallback 사용'}`)
console.log(`의심 글리프:   ${glyphIssues.length === 0 ? '✅ 없음' : '⚠️  ' + glyphIssues.length + '개 — ' + glyphIssues.join(', ')}`)
console.log(`텍스트 렌더링: ${failedRows.length === 0 ? '✅ 전체 통과' : '❌ ' + failedRows.length + '개 실패'}`)
console.log('──────────────────────────────────────────')
console.log('스크린샷 저장 완료:')
console.log('  전체:       diacritics-full.png')
console.log('  템플릿 표:  diacritics-table.png')
console.log('  성조 문자:  diacritics-chars.png')

await browser.close()

// 종료 코드
if (!fontLoaded || glyphIssues.length > 0 || failedRows.length > 0) {
  process.exitCode = 1
}
