/**
 * verify-wedding-frame.mjs
 * Playwright로 wedding-frame.svg를 브라우저에서 렌더링하고
 * 스크린샷을 찍어 정렬을 시각적으로 확인한다.
 *
 * 실행: node scripts/verify-wedding-frame.mjs
 */

import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath    = path.resolve(__dirname, '..', 'public', 'wedding-frame.svg');
const outFull    = path.resolve(__dirname, '..', 'wedding-frame-full.png');
const outMedal   = path.resolve(__dirname, '..', 'wedding-frame-medallion.png');

const svgUrl = pathToFileURL(svgPath).href;

console.log('SVG URL:', svgUrl);

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();

// SVG 자체 크기(400×600)와 동일한 뷰포트
await page.setViewportSize({ width: 400, height: 600 });
await page.goto(svgUrl);
await page.waitForLoadState('networkidle');

// ── 1. 전체 프레임 스크린샷 ──
await page.screenshot({ path: outFull, fullPage: false });
console.log('전체 스크린샷 저장:', outFull);

// ── 2. 囍 메달리온 영역만 클로즈업 ──
// viewBox(0 0 100 150) → 400×600px 변환
// cx=50, cy=14, r=9  →  픽셀: cx=200, cy=56, r=36  (× 4)
// 여백 20px 추가
const SCALE_X = 400 / 100;
const SCALE_Y = 600 / 150;
const cx_px   = 50  * SCALE_X;  // 200
const cy_px   = 14  * SCALE_Y;  // 56
const r_px    = 9   * SCALE_X;  // 36
const pad     = 20;

await page.screenshot({
  path: outMedal,
  clip: {
    x:      cx_px - r_px - pad,
    y:      cy_px - r_px - pad,
    width:  (r_px + pad) * 2,
    height: (r_px + pad) * 2,
  },
});
console.log('메달리온 클로즈업 저장:', outMedal);

// ── 3. DOM 속성 검증 ──
// 수치 검증: 전체 SVG <circle> 요소의 cx/cy 속성으로 메달리온 위치 확인
const medallionAttrs = await page.evaluate(() => {
  const circles = Array.from(document.querySelectorAll('circle'));
  return circles.map(c => ({
    cx: c.getAttribute('cx'),
    cy: c.getAttribute('cy'),
    r:  c.getAttribute('r'),
  }));
});

console.log('\n── 囍 메달리온 circle 속성 확인 ──');
medallionAttrs.forEach((c, i) => {
  console.log(`  circle[${i}]: cx=${c.cx}, cy=${c.cy}, r=${c.r}`);
});

// cx=50, cy=14인 circle이 존재하는지 단언
const found = medallionAttrs.some(c => c.cx === '50' && c.cy === '14');
if (found) {
  console.log('\n✅ 메달리온 중심 (50, 14) 확인 — viewBox 좌표 정렬 OK');
} else {
  console.error('\n❌ 메달리온 circle을 찾을 수 없음');
  process.exitCode = 1;
}

// <g transform> 검증
const gTransform = await page.evaluate(() => {
  const gs = Array.from(document.querySelectorAll('g[transform]'));
  return gs.map(g => g.getAttribute('transform'));
});
console.log('\n── 囍 glyph transform 확인 ──');
gTransform.forEach((t, i) => console.log(`  g[${i}]: ${t}`));

const expectedTranslate = 'translate(44.42,8.42) scale(0.1116)';
const glyphOk = gTransform.some(t => t === expectedTranslate);
if (glyphOk) {
  console.log(`\n✅ 囍 글리프 transform "${expectedTranslate}" 확인 OK`);
} else {
  console.warn('\n⚠️  囍 글리프 transform 값이 예상과 다름');
}

await browser.close();
console.log('\n검증 완료. 스크린샷:');
console.log('  전체  :', outFull);
console.log('  클로즈업:', outMedal);
