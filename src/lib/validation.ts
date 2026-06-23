/**
 * validation.ts
 *
 * 청첩장 입력 폼 유효성 검사 규칙.
 * ─ 베트남어 이름: Unicode \p{L}\p{M} 정규식 → 모든 diacritic 허용
 * ─ 날짜: DD/MM/YYYY, 실제 존재 날짜, 과거 금지
 * ─ 글자 수: 필드별 최대값 정의, 초과 즉시 오류
 */

// ── 정규식 ────────────────────────────────────────────────────────────────────

/** 베트남어 성명: 유니코드 글자 + 발음구별부호 + 공백 + 하이픈 + 아포스트로피 */
const VN_NAME_RE = /^[\p{L}\p{M}\s\-']+$/u

/**
 * 부모 이름 (확장): 이름 외에 & (Ông A & Bà B 패턴), 쉼표, 마침표, 괄호 허용.
 * 한국·영어 이름도 허용 (\p{L} 포함).
 */
const VN_PARENT_RE = /^[\p{L}\p{M}\s\-'&,\.()]+$/u

// ── 글자 수 제한 ──────────────────────────────────────────────────────────────

export const LIMITS = {
  name:        { min: 2, max: 60 },
  parentName:  { max: 80 },
  venue:       { min: 5, max: 150, warnAt: 100 },
  message:     { max: 300, warnAt: 240 },
  bankAccount: { min: 6, max: 20 },
} as const

/** Unicode-aware length (이모지·베트남어 복합 글자 단위) */
export function uniLen(s: string): number {
  return [...s].length
}

// ── 타입 ──────────────────────────────────────────────────────────────────────

/** 필드 이름 → 에러 메시지 (빈 문자열 = 오류 없음) */
export type FieldErrors = Partial<Record<string, string>>

// ── 개별 필드 검사 함수 ───────────────────────────────────────────────────────

/** 신랑/신부 이름 검사 */
export function validateName(value: string, label: string): string {
  const v = value.trim()
  if (!v) return `${label} không được để trống`
  if (uniLen(v) < LIMITS.name.min) return `${label} cần ít nhất ${LIMITS.name.min} ký tự`
  if (uniLen(v) > LIMITS.name.max) return `${label} không quá ${LIMITS.name.max} ký tự`
  if (!VN_NAME_RE.test(v)) {
    const bad = [...v].find(c => !/[\p{L}\p{M}\s\-']/u.test(c))
    return bad
      ? `${label} có ký tự không hợp lệ: "${bad}"`
      : `${label} có ký tự không hợp lệ`
  }
  return ''
}

/** 부모 이름 검사 (선택 필드) */
export function validateParentName(value: string, label: string): string {
  if (!value.trim()) return ''  // optional — empty is fine
  if (uniLen(value.trim()) > LIMITS.parentName.max)
    return `${label} không quá ${LIMITS.parentName.max} ký tự`
  if (!VN_PARENT_RE.test(value.trim())) {
    const bad = [...value.trim()].find(c => !/[\p{L}\p{M}\s\-'&,\.()]/u.test(c))
    return bad
      ? `${label} có ký tự không hợp lệ: "${bad}"`
      : `${label} có ký tự không hợp lệ`
  }
  return ''
}

/** 날짜 검사 — DateSelect는 DD/MM/YYYY (padded) 형식 */
export function validateDate(value: string): string {
  if (!value) return 'Vui lòng chọn đầy đủ ngày, tháng, năm'
  const parts = value.split('/')
  if (parts.length !== 3) return 'Ngày không hợp lệ (cần DD/MM/YYYY)'
  const d = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const y = parseInt(parts[2], 10)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return 'Ngày không hợp lệ'
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2024) return 'Ngày không hợp lệ'
  // 실제 존재 날짜 확인 (예: 2월 30일 차단)
  const date = new Date(y, m - 1, d)
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) {
    return `Ngày ${d}/${m}/${y} không tồn tại (ví dụ: tháng 2 không có ngày ${d})`
  }
  // 과거 날짜 차단
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (date < today) return 'Ngày cưới phải là hôm nay hoặc trong tương lai'
  return ''
}

/** 장소 검사 */
export function validateVenue(value: string): string {
  const v = value.trim()
  if (!v) return 'Địa điểm không được để trống'
  if (uniLen(v) < LIMITS.venue.min) return `Địa điểm cần ít nhất ${LIMITS.venue.min} ký tự`
  if (uniLen(v) > LIMITS.venue.max)
    return `Địa điểm không quá ${LIMITS.venue.max} ký tự (hiện tại: ${uniLen(v)})`
  return ''
}

/** 은행 계좌번호 검사 (선택) */
export function validateBankAccount(value: string, label: string): string {
  if (!value) return ''
  if (!/^\d+$/.test(value)) return `Số TK ${label} chỉ gồm chữ số (0–9)`
  if (value.length < LIMITS.bankAccount.min)
    return `Số TK ${label} quá ngắn (ít nhất ${LIMITS.bankAccount.min} số)`
  if (value.length > LIMITS.bankAccount.max)
    return `Số TK ${label} quá dài (tối đa ${LIMITS.bankAccount.max} số)`
  return ''
}

/** 예금주명 검사 (VietQR: 대문자 + 숫자 + 공백) */
export function validateBankName(value: string, label: string): string {
  if (!value) return ''
  if (!/^[A-Z0-9\s]+$/.test(value))
    return `Tên TK ${label} phải IN HOA, không dấu, không ký tự đặc biệt`
  return ''
}

// ── Step 1 전체 검사 ──────────────────────────────────────────────────────────

export interface Step1FormSubset {
  groom: string
  bride: string
  groomParent: string
  brideParent: string
  date: string
  venue: string
  bankGroomAccount: string
  bankGroomName: string
  bankBrideAccount: string
  bankBrideName: string
}

/**
 * Step 1 전체 필드 검사.
 * 반환값: 오류가 있는 필드만 포함. 모두 통과 시 빈 객체.
 */
export function validateStep1(form: Step1FormSubset): FieldErrors {
  const raw: Record<string, string> = {
    groom:            validateName(form.groom, 'Tên chú rể'),
    bride:            validateName(form.bride, 'Tên cô dâu'),
    groomParent:      validateParentName(form.groomParent, 'Tên bố mẹ chú rể'),
    brideParent:      validateParentName(form.brideParent, 'Tên bố mẹ cô dâu'),
    date:             validateDate(form.date),
    venue:            validateVenue(form.venue),
    bankGroomAccount: validateBankAccount(form.bankGroomAccount, 'nhà trai'),
    bankGroomName:    validateBankName(form.bankGroomName, 'nhà trai'),
    bankBrideAccount: validateBankAccount(form.bankBrideAccount, 'nhà gái'),
    bankBrideName:    validateBankName(form.bankBrideName, 'nhà gái'),
  }
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ''))
}
