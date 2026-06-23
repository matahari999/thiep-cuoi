/**
 * 히어로 섹션 글자색 확인 스크린샷
 * 사진 없는 템플릿과 사진 있는 시뮬레이션 비교
 */
import { chromium } from 'playwright'
import fs from 'fs'

const BASE = 'http://localhost:3300'
const OUT  = 'scripts/screenshots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewportSize({ width: 430, height: 932 })

// classic-red (fontColor: text-white → 사진 없어도 흰색)
await page.goto(`${BASE}/classic-red`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.locator('#section-hero').screenshot({ path: `${OUT}/hero-classic-red.png` })
console.log('saved hero-classic-red.png')

// pastel-garden (fontColor: text-gray-800 → 사진 없을 땐 어두운색, 사진 있으면 흰색)
await page.goto(`${BASE}/pastel-garden`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.locator('#section-hero').screenshot({ path: `${OUT}/hero-pastel-garden.png` })
console.log('saved hero-pastel-garden.png')

// 히어로 h1 클래스 확인
const h1Class = await page.locator('#section-hero h1').getAttribute('class') ?? ''
console.log('h1 class (pastel-garden, no photo):', h1Class)

// 사진 없으면 theme.fontColor 그대로 (text-gray-800)
console.log('text-gray-800 포함?', h1Class.includes('text-gray-800') ? '✅ 사진 없을 때 기존 색' : '❌')
console.log('drop-shadow 없음?',   !h1Class.includes('drop-shadow')  ? '✅ shadow 없음' : '❌')

await browser.close()
console.log('\n스크린샷 저장 완료 →', OUT)
