/**
 * Âm Lịch Việt Nam — Vietnamese Lunar Calendar
 *
 * Hồ Ngọc Đức 알고리즘 TypeScript 완전 포팅.
 * 원본: https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html
 *
 * Jean Meeus, "Astronomical Algorithms" (Willmann-Bell, 1998) 기반.
 * 1900~2100년 범위, 베트남 표준시 UTC+7 기준으로 정확.
 *
 * 단순 근사(Metonic 19년 주기 등) 미사용.
 * 실제 천문학적 계산: 태양 황경 + 삭망월 시각 → 음력 변환.
 */

const PI = Math.PI
export const VN_TZ = 7  // Indochina Time: UTC+7

function INT(d: number): number {
  return Math.floor(d)
}

// ── 율리우스 날짜 ───────────────────────────────────────────────────────────

/** 양력 → 율리우스 날짜 (JD) */
function jdFromDate(dd: number, mm: number, yyyy: number): number {
  const a = INT((14 - mm) / 12)
  const y = yyyy + 4800 - a
  const m = mm + 12 * a - 3
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y
    + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083
  }
  return jd
}

/** 율리우스 날짜 → 양력 [day, month, year] */
function jdToDate(jd: number): [number, number, number] {
  let a, b, c: number
  if (jd > 2299160) {
    a = jd + 32044
    b = INT((4 * a + 3) / 146097)
    c = a - INT((b * 146097) / 4)
  } else {
    b = 0
    c = jd + 32082
  }
  const d     = INT((4 * c + 3) / 1461)
  const e     = c - INT((1461 * d) / 4)
  const m     = INT((5 * e + 2) / 153)
  const day   = e - INT((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * INT(m / 10)
  const year  = b * 100 + d - 4800 + INT(m / 10)
  return [day, month, year]
}

// ── 천문 계산 ───────────────────────────────────────────────────────────────

/**
 * 율리우스 날짜 jdn에서 태양의 황경(라디안, 0~2π).
 * Jean Meeus Chapter 25 기반 간소화 공식.
 */
function sunLongitude(jdn: number): number {
  const T  = (jdn - 2451545.0) / 36525   // J2000.0 기준 율리우스 세기
  const T2 = T * T
  const dr = PI / 180
  const M  = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2
  const DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
           + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M)
           + 0.00029 * Math.sin(dr * 3 * M)
  let L = (L0 + DL) * dr
  L -= PI * 2 * INT(L / (PI * 2))
  return L
}

/**
 * 1900년 1월 1일 이후 k번째 삭(새벽달) JDE.
 * Jean Meeus Chapter 49 기반 (Duc 버전 보정항 포함).
 */
function newMoon(k: number): number {
  const T  = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = PI / 180
  let Jde = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
  Jde += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M   = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F   = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
  C1 -= 0.4068 * Math.sin(Mpr * dr) - 0.0161 * Math.sin(dr * 2 * Mpr)
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr)
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr))
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) - 0.0004 * Math.sin(dr * (2 * F + M))
  C1 += 0.0004 * Math.sin(dr * (2 * F - M)) + 0.0006 * Math.sin(dr * (2 * F + Mpr))
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M))
  const deltat = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2
  return Jde + C1 - deltat
}

// ── 음력 보조 함수 ──────────────────────────────────────────────────────────

/**
 * dayNum 날짜의 태양 중기(中氣) 인덱스 (0~11).
 * 인덱스 9 = 동지(冬至 Đông Chí), 태양 황경 270°.
 */
function getSunLongitude(dayNum: number, tz: number): number {
  return INT(sunLongitude(dayNum - 0.5 - tz / 24.0) / PI * 6)
}

/** k번째 삭(새벽달)의 날짜 JD (정수, 시간대 tz 기준) */
function getNewMoonDay(k: number, tz: number): number {
  return INT(newMoon(k) + 0.5 + tz / 24.0)
}

/**
 * 연도 yyyy의 음력 11월(동지 포함 월)을 시작하는 삭일(朔日) JD.
 * 11월은 반드시 동지(태양 황경 270°, 섹터 인덱스 9)를 포함.
 */
function getLunarMonth11(yyyy: number, tz: number): number {
  const off   = jdFromDate(31, 12, yyyy) - 2415021.076998695
  const k     = INT(off / 29.530588853)
  let nm      = getNewMoonDay(k, tz)
  const sunLng = getSunLongitude(nm + 1, tz)
  // 삭 다음날 태양이 이미 270°+ → 동지가 이전 월에 있음 → 한 달 앞으로
  if (sunLng >= 9) nm = getNewMoonDay(k - 1, tz)
  return nm
}

/**
 * a11(11월 삭일) 이후 윤달의 위치 오프셋.
 * 중기(中氣)가 없는 첫 번째 달 = 윤달.
 */
function getLeapMonthOffset(a11: number, tz: number): number {
  const k   = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5)
  let last  = 0
  let i     = 1
  let arc   = getSunLongitude(getNewMoonDay(k + i, tz), tz)
  do {
    last = arc
    i++
    arc = getSunLongitude(getNewMoonDay(k + i, tz), tz)
  } while (arc !== last && i < 14)
  return i - 1
}

// ── 공개 API ────────────────────────────────────────────────────────────────

export interface LunarDate {
  day:   number
  month: number
  year:  number
  leap:  boolean   // 윤달 여부 (tháng nhuận)
}

/**
 * 양력 → 베트남 음력 변환 (Hồ Ngọc Đức 알고리즘).
 * @param dd   양력 일
 * @param mm   양력 월
 * @param yyyy 양력 연도
 * @param tz   시간대 (기본값: VN_TZ = 7, UTC+7)
 */
export function solarToLunar(dd: number, mm: number, yyyy: number, tz = VN_TZ): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yyyy)
  const k         = INT((dayNumber - 2415021.076998695) / 29.530588853)
  let monthStart  = getNewMoonDay(k + 1, tz)
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz)

  let a11 = getLunarMonth11(yyyy, tz)
  let b11 = a11
  let lunarYear: number

  if (a11 >= monthStart) {
    // monthStart 이전에 올해 11월 삭이 있음 → 아직 올해 음력년
    lunarYear = yyyy
    a11 = getLunarMonth11(yyyy - 1, tz)
  } else {
    // monthStart 이후에 올해 11월 삭 → 음력년은 내년
    lunarYear = yyyy + 1
    b11 = getLunarMonth11(yyyy + 1, tz)
  }

  const lunarDay  = dayNumber - monthStart + 1
  const diff      = INT((monthStart - a11) / 29)
  let lunarLeap   = false
  let lunarMonth  = diff + 11

  if (b11 - a11 > 365) {
    // 이 음력년에 윤달이 있음
    const leapMonthDiff = getLeapMonthOffset(a11, tz)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) lunarLeap = true
    }
  }

  if (lunarMonth > 12) lunarMonth -= 12
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1

  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap }
}

/**
 * 음력 → 양력 변환 (역변환).
 * @param lunarDay   음력 일
 * @param lunarMonth 음력 월
 * @param lunarYear  음력 연도
 * @param lunarLeap  윤달 여부
 */
export function lunarToSolar(
  lunarDay: number, lunarMonth: number, lunarYear: number,
  lunarLeap: boolean, tz = VN_TZ
): [number, number, number] {
  let a11: number, b11: number
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, tz)
    b11 = getLunarMonth11(lunarYear, tz)
  } else {
    a11 = getLunarMonth11(lunarYear, tz)
    b11 = getLunarMonth11(lunarYear + 1, tz)
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853)
  let off = lunarMonth - 11
  if (off < 0) off += 12
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, tz)
    let leapMonth = leapOff - 2
    if (leapMonth < 0) leapMonth += 12
    if (lunarLeap && lunarMonth !== leapMonth) return [0, 0, 0]
    if (lunarLeap || off >= leapOff) off++
  }
  const monthStart = getNewMoonDay(k + off, tz)
  return jdToDate(monthStart + lunarDay - 1)
}

// ── 베트남어 날짜 포맷 ──────────────────────────────────────────────────────

const CAN  = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'] as const
const CHI  = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'] as const
const THANG = [
  'Giêng','Hai','Ba','Tư','Năm','Sáu',
  'Bảy','Tám','Chín','Mười','Mười Một','Chạp',
] as const

/** 연도의 천간지지 (Can Chi) 반환. 예: "Giáp Thìn" (2024) */
export function canChiYear(year: number): string {
  return `${CAN[(year + 6) % 10]} ${CHI[(year + 8) % 12]}`
}

/**
 * 음력 날짜를 베트남어로 포맷.
 * 예: "Mùng 1 tháng Giêng năm Ất Tỵ âm lịch"
 *     "Ngày 15 tháng Tám năm Giáp Thìn âm lịch"
 */
export function formatLunarDate(lunar: LunarDate): string {
  const dayStr  = lunar.day <= 10 ? `Mùng ${lunar.day}` : `Ngày ${lunar.day}`
  const thang   = THANG[lunar.month - 1]
  const nhuanStr = lunar.leap ? ' (nhuận)' : ''
  const canChi  = canChiYear(lunar.year)
  return `${dayStr} tháng ${thang}${nhuanStr} năm ${canChi} âm lịch`
}

/**
 * "DD/MM/YYYY" 문자열을 입력받아 음력 날짜 문자열 반환.
 * 파싱 실패 또는 범위 초과 시 빈 문자열.
 */
export function lunarDateFromStr(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts.map(Number)
  if (!d || !m || !y || y < 1900 || y > 2100) return ''
  try {
    return formatLunarDate(solarToLunar(d, m, y))
  } catch {
    return ''
  }
}
