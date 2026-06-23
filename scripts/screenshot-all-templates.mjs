/**
 * screenshot-all-templates.mjs
 *
 * 전체 21개 템플릿을 Playwright로 순회하여:
 *  1. 히어로 섹션 + 웰컴 섹션 스크린샷
 *  2. 텍스트 오버플로우 자동 검출 (여러 기법 병행)
 *  3. 결과를 report.html로 정리
 *
 * 실행: node scripts/screenshot-all-templates.mjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ── 설정 ─────────────────────────────────────────────────────────────
const BASE_URL  = 'http://localhost:3300';
const OUT_DIR   = path.resolve('verify-all');
const REPORT    = path.resolve('report.html');
const VIEWPORT  = { width: 430, height: 932 };

// 서버에서 직접 allTemplates를 import할 수 없으므로,
// 브라우저 페이지에서 템플릿 목록을 가져옴
const TEMPLATES = [
  // id, name, categoryId, fontFamily, frameVariant
  { id: 'classic-red',    name: 'Cổ Điển Đỏ',           cat: 'truyen-thong', font: 'sans',  frame: null           },
  { id: 'dong-son',       name: 'Đồng Sơn',              cat: 'truyen-thong', font: 'sans',  frame: null           },
  { id: 'hoa-sen',        name: 'Hoa Sen',               cat: 'truyen-thong', font: 'sans',  frame: null           },
  { id: 'song-hy',        name: 'Song Hỷ',               cat: 'truyen-thong', font: 'sans',  frame: 'vietnamese-gold' },
  { id: 'minimal-beige',  name: 'Beige Tinh Tế',         cat: 'hien-dai',     font: 'serif', frame: 'korean-lineart'  },
  { id: 'minimal-black',  name: 'Đen & Trắng',           cat: 'hien-dai',     font: 'serif', frame: null           },
  { id: 'sage-green',     name: 'Xanh Sage',             cat: 'hien-dai',     font: 'sans',  frame: null           },
  { id: 'romantic-pink',  name: 'Hồng Ngọt Ngào',        cat: 'lang-man',     font: 'serif', frame: 'western-watercolor' },
  { id: 'watercolor',     name: 'Màu Nước',              cat: 'lang-man',     font: 'serif', frame: null           },
  { id: 'peony-garden',   name: 'Vườn Hoa Mẫu Đơn',     cat: 'lang-man',     font: 'sans',  frame: null           },
  { id: 'gold-elegant',   name: 'Vàng Sang Trọng',       cat: 'sang-trong',   font: 'serif', frame: null           },
  { id: 'black-gold',     name: 'Đen Vàng',              cat: 'sang-trong',   font: 'serif', frame: null           },
  { id: 'rose-gold',      name: 'Hồng Ánh Kim',          cat: 'sang-trong',   font: 'sans',  frame: null           },
  { id: 'rustic-green',   name: 'Xanh Rêu',              cat: 'thien-nhien',  font: 'sans',  frame: null           },
  { id: 'earthy-beige',   name: 'Đất Nâu',               cat: 'thien-nhien',  font: 'sans',  frame: null           },
  { id: 'olive-garden',   name: 'Vườn Ô Liu',            cat: 'thien-nhien',  font: 'sans',  frame: null           },
  { id: 'vintage-gold',   name: 'Vintage Vàng',          cat: 'co-dien',      font: 'serif', frame: null           },
  { id: 'vintage-rose',   name: 'Hồng Cổ Điển',         cat: 'co-dien',      font: 'serif', frame: null           },
  { id: 'french-vintage', name: 'Pháp Cổ',              cat: 'co-dien',      font: 'serif', frame: null           },
  { id: 'ao-dai',         name: 'Áo Dài',               cat: 'van-hoa',      font: 'sans',  frame: null           },
  { id: 'non-la',         name: 'Nón Lá',               cat: 'van-hoa',      font: 'sans',  frame: null           },
  { id: 'truc-dong',      name: 'Trống Đồng',           cat: 'van-hoa',      font: 'sans',  frame: null           },
];

const CAT_LABELS = {
  'truyen-thong': '🏮 Truyền Thống',
  'hien-dai':     '✨ Hiện Đại',
  'lang-man':     '🌸 Lãng Mạn',
  'sang-trong':   '💎 Sang Trọng',
  'thien-nhien':  '🌿 Thiên Nhiên',
  'co-dien':      '🕰️ Cổ Điển',
  'van-hoa':      '🇻🇳 Văn Hóa Việt',
};

// ── 디렉토리 준비 ─────────────────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── 오버플로우 감지 함수 (브라우저 evaluate 내에서 실행) ──────────────────
/**
 * 페이지 내 텍스트 오버플로우 검출.
 * 반환: { overflows: OverflowItem[], warnings: string[] }
 */
const detectOverflow = () => {
  const overflows = [];
  const warnings  = [];

  // 카드 컨테이너 (max-w-md 기준 430px)
  const card = document.querySelector('.max-w-md');
  const cardRect = card?.getBoundingClientRect();
  const cardRight  = cardRect ? cardRect.right  : window.innerWidth;
  const cardLeft   = cardRect ? cardRect.left   : 0;
  const cardWidth  = cardRight - cardLeft;

  // ── 기법 1: scrollWidth vs offsetWidth ───────────────────────────
  const textEls = document.querySelectorAll(
    '#section-hero h1, #section-hero p, #section-hero span, ' +
    '#section-welcome h2, #section-welcome p, ' +
    '#section-details p, #section-details a, #section-details iframe'
  );
  textEls.forEach(el => {
    if (el.scrollWidth > el.offsetWidth + 2) { // 2px 허용 오차
      const rect = el.getBoundingClientRect();
      overflows.push({
        type:     'scroll-overflow',
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + [...el.classList].join('.') : ''),
        text:     el.textContent?.slice(0, 80).trim(),
        scrollW:  el.scrollWidth,
        offsetW:  el.offsetWidth,
        excess:   el.scrollWidth - el.offsetWidth,
        rect:     { top: Math.round(rect.top), right: Math.round(rect.right), left: Math.round(rect.left) },
      });
    }
  });

  // ── 기법 2: getBoundingClientRect — 카드 경계 초과 ────────────────
  const allVisible = document.querySelectorAll(
    '#section-hero *, #section-welcome *, #section-countdown *, #section-details *'
  );
  allVisible.forEach(el => {
    const rect = el.getBoundingClientRect();
    // 실질적 크기 없는 요소(display:none, visibility:hidden, 0×0) 제외
    if (rect.width === 0 || rect.height === 0) return;
    // 카드보다 오른쪽으로 8px 이상 벗어날 때
    if (cardRect && rect.right > cardRight + 8) {
      overflows.push({
        type:     'rect-overflow-right',
        selector: el.tagName.toLowerCase(),
        text:     el.textContent?.slice(0, 60).trim(),
        excess:   Math.round(rect.right - cardRight),
        rect:     { top: Math.round(rect.top), right: Math.round(rect.right), left: Math.round(rect.left) },
      });
    }
    // 카드보다 왼쪽으로 8px 이상 벗어날 때
    if (cardRect && rect.left < cardLeft - 8) {
      overflows.push({
        type:     'rect-overflow-left',
        selector: el.tagName.toLowerCase(),
        text:     el.textContent?.slice(0, 60).trim(),
        excess:   Math.round(cardLeft - rect.left),
        rect:     { top: Math.round(rect.top), right: Math.round(rect.right), left: Math.round(rect.left) },
      });
    }
  });

  // ── 기법 3: 히어로 h1 글자 크기 vs 컨테이너 ────────────────────────
  const h1 = document.querySelector('#section-hero h1');
  if (h1) {
    const h1Rect = h1.getBoundingClientRect();
    if (cardRect && h1Rect.width > cardWidth - 32) { // 패딩 16px×2
      warnings.push(`h1 width ${Math.round(h1Rect.width)}px ≥ card ${Math.round(cardWidth - 32)}px (padding 내 빡빡)`);
    }
  }

  // ── 기법 4: iframe map 로드 확인 ─────────────────────────────────
  const mapIframe = document.querySelector('#section-details iframe');
  if (mapIframe) {
    const mRect = mapIframe.getBoundingClientRect();
    if (mRect.width < 1) warnings.push('지도 iframe width=0 (숨김 또는 오류)');
  }

  // ── 기법 5: overflow:hidden 컨테이너에서 자식 clip 감지 ───────────
  document.querySelectorAll('#section-hero div, #section-welcome div').forEach(div => {
    const st = window.getComputedStyle(div);
    if (st.overflow !== 'hidden' && st.overflowX !== 'hidden') return;
    const dRect = div.getBoundingClientRect();
    div.querySelectorAll('span, p, h1, h2, h3').forEach(child => {
      const cRect = child.getBoundingClientRect();
      if (cRect.right > dRect.right + 4 || cRect.left < dRect.left - 4) {
        overflows.push({
          type:     'clipped-by-overflow-hidden',
          selector: child.tagName.toLowerCase(),
          text:     child.textContent?.slice(0, 60).trim(),
          excess:   Math.round(Math.max(cRect.right - dRect.right, dRect.left - cRect.left)),
          rect:     { top: Math.round(cRect.top), right: Math.round(cRect.right), left: Math.round(cRect.left) },
        });
      }
    });
  });

  // 중복 제거 (같은 text+type 조합)
  const seen = new Set();
  const unique = overflows.filter(o => {
    const key = `${o.type}|${o.text}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  return { overflows: unique, warnings };
};

// ── 메인 실행 ─────────────────────────────────────────────────────────
console.log(`총 ${TEMPLATES.length}개 템플릿 검증 시작...\n`);

const browser = await chromium.launch({ headless: true });
const results  = [];

try {
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  for (const tpl of TEMPLATES) {
    process.stdout.write(`[${tpl.id}] `);
    const start = Date.now();

    await page.goto(`${BASE_URL}/${tpl.id}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1800); // 애니메이션 안정화

    // ── 스크린샷: 히어로 (viewport) ──
    const heroFile    = path.join(OUT_DIR, `${tpl.id}-hero.png`);
    const welcomeFile = path.join(OUT_DIR, `${tpl.id}-welcome.png`);

    await page.screenshot({ path: heroFile, fullPage: false });

    // welcome 섹션 스크롤
    const welcomeEl = await page.$('#section-welcome');
    if (welcomeEl) {
      await welcomeEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: welcomeFile, fullPage: false });
      // 다시 히어로로 복귀 (카운트다운 섹션 추가 스크린샷용)
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // ── 오버플로우 감지 ──
    // 히어로 섹션을 위해 스크롤 상단으로
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const { overflows, warnings } = await page.evaluate(detectOverflow);

    const ms = Date.now() - start;
    const status = overflows.length === 0 ? '✅' : '⚠️ ';
    console.log(`${status} (${ms}ms, overflow=${overflows.length}, warn=${warnings.length})`);

    results.push({
      ...tpl,
      catLabel:   CAT_LABELS[tpl.cat] || tpl.cat,
      heroFile:   path.relative(path.dirname(REPORT), heroFile).replace(/\\/g, '/'),
      welcomeFile: path.relative(path.dirname(REPORT), welcomeFile).replace(/\\/g, '/'),
      overflows,
      warnings,
      ms,
    });
  }
} finally {
  await browser.close();
}

// ── 요약 통계 ─────────────────────────────────────────────────────────
const totalOverflow = results.reduce((s, r) => s + r.overflows.length, 0);
const problematic   = results.filter(r => r.overflows.length > 0);
console.log(`\n결과: 오버플로우 있음 ${problematic.length}개 템플릿 (총 ${totalOverflow}건)`);

// ── HTML 리포트 생성 ──────────────────────────────────────────────────
const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

// 카테고리별 그룹화
const byCategory = {};
for (const r of results) {
  if (!byCategory[r.cat]) byCategory[r.cat] = [];
  byCategory[r.cat].push(r);
}

const overflowBadge = (n) => n === 0
  ? `<span class="badge ok">overflow 없음</span>`
  : `<span class="badge warn">${n}건 오버플로우</span>`;

const warnBadge = (n) => n === 0 ? '' : `<span class="badge info">${n}개 경고</span>`;

const fontBadge = (f) => f === 'serif'
  ? `<span class="badge serif">serif</span>`
  : `<span class="badge sans">sans</span>`;

const frameBadge = (f) => f
  ? `<span class="badge frame">${f}</span>`
  : `<span class="badge noframe">프레임 없음</span>`;

const overflowTable = (overflows) => {
  if (overflows.length === 0) return '<p class="no-issues">오버플로우 없음 ✓</p>';
  return `
    <table class="ov-table">
      <thead><tr><th>유형</th><th>요소</th><th>텍스트</th><th>초과(px)</th></tr></thead>
      <tbody>
        ${overflows.map(o => `
          <tr class="${o.type.includes('scroll') ? 'row-scroll' : 'row-rect'}">
            <td><code>${o.type}</code></td>
            <td><code>${o.selector?.slice(0, 40)}</code></td>
            <td>${(o.text || '').slice(0, 50)}</td>
            <td class="excess">+${o.excess}px</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
};

const warningList = (warnings) => {
  if (warnings.length === 0) return '';
  return `<ul class="warn-list">${warnings.map(w => `<li>⚠️ ${w}</li>`).join('')}</ul>`;
};

let categorySections = '';
for (const [catId, catResults] of Object.entries(byCategory)) {
  const label = CAT_LABELS[catId] || catId;
  const catOverflows = catResults.reduce((s, r) => s + r.overflows.length, 0);
  const catStatus = catOverflows === 0 ? '✅' : '⚠️';

  const cards = catResults.map(r => `
    <div class="card ${r.overflows.length > 0 ? 'has-overflow' : ''}">
      <div class="card-header">
        <div class="card-title">
          <strong>${r.name}</strong>
          <code class="tpl-id">${r.id}</code>
        </div>
        <div class="card-badges">
          ${overflowBadge(r.overflows.length)}
          ${warnBadge(r.warnings.length)}
          ${fontBadge(r.font)}
          ${frameBadge(r.frame)}
          <span class="badge time">${r.ms}ms</span>
        </div>
      </div>
      <div class="screenshots">
        <figure>
          <figcaption>Hero (viewport)</figcaption>
          <img src="${r.heroFile}" loading="lazy" />
        </figure>
        <figure>
          <figcaption>Welcome section</figcaption>
          <img src="${r.welcomeFile}" loading="lazy" />
        </figure>
      </div>
      ${overflowTable(r.overflows)}
      ${warningList(r.warnings)}
    </div>`).join('');

  categorySections += `
    <section class="category">
      <h2>${catStatus} ${label}</h2>
      <div class="card-grid">${cards}</div>
    </section>`;
}

const summaryRows = results.map(r => `
  <tr class="${r.overflows.length > 0 ? 'tr-warn' : ''}">
    <td>${CAT_LABELS[r.cat] || r.cat}</td>
    <td><code>${r.id}</code></td>
    <td>${r.name}</td>
    <td>${fontBadge(r.font)}</td>
    <td>${frameBadge(r.frame)}</td>
    <td class="${r.overflows.length > 0 ? 'cell-warn' : 'cell-ok'}">${r.overflows.length}</td>
    <td>${r.warnings.length}</td>
    <td>${r.ms}ms</td>
  </tr>`).join('');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thiệp Cưới — Template Overflow Report</title>
  <style>
    :root {
      --ok:    #16a34a;
      --warn:  #d97706;
      --err:   #dc2626;
      --info:  #2563eb;
      --gray:  #6b7280;
      --border: #e5e7eb;
      --bg:    #f9fafb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: #111; padding: 24px; }

    header { background: linear-gradient(135deg, #be123c, #7c3aed); color: #fff; border-radius: 16px; padding: 28px 32px; margin-bottom: 32px; }
    header h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
    header .meta { margin-top: 8px; font-size: 0.85rem; opacity: 0.85; }
    header .summary-chips { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    header .chip { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 0.8rem; font-weight: 600; }
    header .chip.danger { background: rgba(220,38,38,0.7); }

    .toc { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .toc h3 { font-size: 0.9rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .toc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
    .toc-item { display: flex; align-items: center; gap-8px; gap: 8px; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; }
    .toc-item.has-issues { border-color: #fbbf24; background: #fffbeb; }
    .toc-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ok); flex-shrink: 0; }
    .toc-dot.warn { background: var(--warn); }

    .summary-table { width: 100%; background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 40px; }
    .summary-table table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .summary-table thead { background: #f3f4f6; }
    .summary-table th { padding: 10px 12px; text-align: left; font-weight: 600; color: var(--gray); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .summary-table td { padding: 9px 12px; border-top: 1px solid var(--border); }
    .summary-table tr.tr-warn td { background: #fffbeb; }
    .cell-ok { color: var(--ok); font-weight: 700; }
    .cell-warn { color: var(--err); font-weight: 700; }

    .category { margin-bottom: 48px; }
    .category h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid var(--border); }

    .card-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 900px) { .card-grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1400px) { .card-grid { grid-template-columns: 1fr 1fr 1fr; } }

    .card { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
    .card.has-overflow { border-color: #fbbf24; box-shadow: 0 0 0 2px #fef08a; }

    .card-header { padding: 14px 16px; border-bottom: 1px solid var(--border); background: #fafafa; }
    .card-title { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
    .card-title strong { font-size: 0.95rem; }
    .tpl-id { font-size: 0.7rem; color: var(--gray); background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    .card-badges { display: flex; flex-wrap: wrap; gap: 4px; }

    .badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .badge.ok     { background: #dcfce7; color: var(--ok); }
    .badge.warn   { background: #fef9c3; color: #92400e; }
    .badge.info   { background: #dbeafe; color: var(--info); }
    .badge.serif  { background: #ede9fe; color: #6d28d9; }
    .badge.sans   { background: #e0f2fe; color: #0369a1; }
    .badge.frame  { background: #fce7f3; color: #9d174d; }
    .badge.noframe{ background: #f3f4f6; color: var(--gray); }
    .badge.time   { background: #f3f4f6; color: var(--gray); }

    .screenshots { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
    .screenshots figure { flex: 1; display: flex; flex-direction: column; }
    .screenshots figure:not(:last-child) { border-right: 1px solid var(--border); }
    figcaption { font-size: 0.7rem; color: var(--gray); padding: 6px 10px; background: #fafafa; border-bottom: 1px solid var(--border); }
    .screenshots img { width: 100%; height: auto; display: block; }

    .no-issues { padding: 10px 16px; font-size: 0.82rem; color: var(--ok); font-weight: 500; }
    .ov-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
    .ov-table th { padding: 6px 12px; background: #fef9c3; text-align: left; font-weight: 600; color: #92400e; border-bottom: 1px solid #fde68a; }
    .ov-table td { padding: 5px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
    .ov-table tr.row-scroll { background: #fff7ed; }
    .ov-table tr.row-rect   { background: #fff1f2; }
    .ov-table .excess { font-weight: 700; color: var(--err); }
    .warn-list { list-style: none; padding: 8px 16px; font-size: 0.8rem; color: var(--warn); background: #fffbeb; border-top: 1px solid #fde68a; }
    .warn-list li { padding: 2px 0; }

    footer { text-align: center; color: var(--gray); font-size: 0.8rem; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--border); }
  </style>
</head>
<body>

<header>
  <h1>🎊 Thiệp Cưới — Template Visual Report</h1>
  <div class="meta">생성일: ${now} · 총 ${TEMPLATES.length}개 템플릿 · Playwright 자동 검증</div>
  <div class="summary-chips">
    <div class="chip">전체: ${results.length}개</div>
    <div class="chip ${problematic.length > 0 ? 'danger' : ''}">오버플로우: ${problematic.length}개 템플릿</div>
    <div class="chip">총 오버플로우: ${totalOverflow}건</div>
    <div class="chip">serif: ${results.filter(r=>r.font==='serif').length}개</div>
    <div class="chip">frame: ${results.filter(r=>r.frame).length}개</div>
  </div>
</header>

<div class="toc">
  <h3>목차</h3>
  <div class="toc-grid">
    ${results.map(r => `
      <div class="toc-item ${r.overflows.length > 0 ? 'has-issues' : ''}">
        <span class="toc-dot ${r.overflows.length > 0 ? 'warn' : ''}"></span>
        <span>${r.name} <code style="font-size:0.65rem;color:#9ca3af">${r.id}</code></span>
        ${r.overflows.length > 0 ? `<span style="margin-left:auto;color:#d97706;font-size:0.7rem;font-weight:700">+${r.overflows.length}</span>` : ''}
      </div>`).join('')}
  </div>
</div>

<div class="summary-table">
  <table>
    <thead>
      <tr>
        <th>카테고리</th><th>ID</th><th>이름</th><th>폰트</th><th>프레임</th>
        <th>오버플로우</th><th>경고</th><th>응답</th>
      </tr>
    </thead>
    <tbody>${summaryRows}</tbody>
  </table>
</div>

${categorySections}

<footer>
  Thiệp Cưới Template Report · Playwright ${TEMPLATES.length} templates · ${now}
</footer>

</body>
</html>`;

fs.writeFileSync(REPORT, html, 'utf-8');
console.log(`\n📄 리포트 저장: ${REPORT}`);

// 종료 코드
if (totalOverflow > 0) {
  console.log(`\n⚠️  ${problematic.length}개 템플릿에서 오버플로우 감지:`);
  problematic.forEach(r => {
    console.log(`   ${r.id}: ${r.overflows.length}건`);
    r.overflows.forEach(o => console.log(`     · [${o.type}] "${(o.text||'').slice(0,50)}" +${o.excess}px`));
  });
}
