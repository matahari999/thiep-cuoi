/**
 * verify-templates-refactor.mjs
 * 리팩터링된 템플릿 시스템 검증:
 *   - 각 카테고리별 대표 템플릿 렌더링 확인
 *   - frameVariant 있는 템플릿(song-hy, minimal-beige, romantic-pink)
 *   - serif fontFamily 템플릿(minimal-beige, gold-elegant)
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:3300';

const TESTS = [
  { id: 'classic-red',   label: '전통/sans/no-frame',           expect: { frame: false, serif: false } },
  { id: 'song-hy',       label: '전통/sans/vietnamese-gold',    expect: { frame: true,  serif: false } },
  { id: 'minimal-beige', label: '현대/serif/korean-lineart',    expect: { frame: true,  serif: true  } },
  { id: 'romantic-pink', label: '낭만/serif/western-watercolor', expect: { frame: true,  serif: true  } },
  { id: 'gold-elegant',  label: '럭셔리/serif/no-frame',        expect: { frame: false, serif: true  } },
  { id: 'vintage-rose',  label: '클래식/serif/no-frame',        expect: { frame: false, serif: true  } },
  { id: 'french-vintage',label: '클래식/serif/no-frame',        expect: { frame: false, serif: true  } },
  { id: 'truc-dong',     label: '문화/sans/no-frame',           expect: { frame: false, serif: false } },
];

const OUT_DIR = 'D:/thiep-cuoi/verify-screenshots';

const browser = await chromium.launch({ headless: true });
let passed = 0;
let failed = 0;

try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 430, height: 932 });

  for (const test of TESTS) {
    const url = `${BASE}/${test.id}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // ── 스크린샷 ──
    const outPath = `D:/thiep-cuoi/verify-${test.id}.png`;
    await page.screenshot({ path: outPath, fullPage: false });

    // ── 히어로 섹션 DOM 확인 ──
    const checks = await page.evaluate(() => {
      const hero = document.querySelector('#section-hero');

      // FrameDecoration SVG 존재 여부 (vietnamese-gold / korean-lineart / western-watercolor 는 SVG)
      const frameSvg = hero?.querySelector('svg[viewBox="0 0 100 150"]');

      // font-serif 클래스 (WEDDING INVITATION 레이블 또는 h1)
      const serifEl = hero?.querySelector('.font-serif');

      // accentHex/secondaryStroke가 실제 hex 값으로 SVG stroke 설정됐는지
      // (Tailwind 클래스가 아닌 '#' 시작 값이어야 함)
      const paths = hero?.querySelectorAll('svg path[stroke]') ?? [];
      const hasInvalidStroke = Array.from(paths).some(p => {
        const s = p.getAttribute('stroke');
        return s && !s.startsWith('#') && s !== 'currentColor' && s !== 'none' && !s.startsWith('url(');
      });

      return {
        hasFrameSvg: !!frameSvg,
        hasSerifEl:  !!serifEl,
        hasInvalidStroke,
      };
    });

    const frameOk   = checks.hasFrameSvg === test.expect.frame;
    const serifOk   = checks.hasSerifEl  === test.expect.serif;
    const strokeOk  = !checks.hasInvalidStroke;
    const ok = frameOk && serifOk && strokeOk;

    if (ok) {
      console.log(`✅ [${test.id}] ${test.label}`);
      passed++;
    } else {
      console.error(`❌ [${test.id}] ${test.label}`);
      if (!frameOk) console.error(`   frame: expected=${test.expect.frame} got=${checks.hasFrameSvg}`);
      if (!serifOk) console.error(`   serif: expected=${test.expect.serif} got=${checks.hasSerifEl}`);
      if (!strokeOk) console.error(`   SVG stroke에 잘못된 Tailwind 클래스 감지`);
      failed++;
    }
    console.log(`   → 스크린샷: ${outPath}`);
  }
} finally {
  await browser.close();
}

console.log(`\n결과: ${passed}/${TESTS.length} 통과, ${failed} 실패`);
if (failed > 0) process.exitCode = 1;
