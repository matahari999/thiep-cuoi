import { useState, useEffect } from 'react'

export const WEDDING_TIMES = [
  '06:00','07:00','08:00','09:00',
  '10:00','10:30','11:00','11:30',
  '17:00','17:30','18:00','18:30','19:00','19:30','20:00',
]

function parseDateTriple(v: string): [string, string, string] {
  const p = v ? v.split('/') : []
  return [p[0] || '', p[1] || '', p[2] || '']
}

interface DateSelectProps {
  value: string
  onChange: (v: string) => void
  className?: string
  inputClassName?: string
}

export function DateSelect({ value, onChange, className, inputClassName }: DateSelectProps) {
  const [triple, setTriple] = useState<[string, string, string]>(() => parseDateTriple(value))
  useEffect(() => { setTriple(parseDateTriple(value)) }, [value])

  const pick = (idx: 0 | 1 | 2, v: string) => {
    const next = [...triple] as [string, string, string]
    next[idx] = v
    setTriple(next)
    if (next[0] && next[1] && next[2]) onChange(`${next[0]}/${next[1]}/${next[2]}`)
  }

  const cls = inputClassName ?? 'flex-1 px-2 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none text-sm'

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <select value={triple[0]} onChange={e => pick(0, e.target.value)} className={cls}>
        <option value="">Ngày</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select value={triple[1]} onChange={e => pick(1, e.target.value)} className={cls}>
        <option value="">Tháng</option>
        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
          <option key={m} value={m}>T.{Number(m)}</option>
        ))}
      </select>
      <select value={triple[2]} onChange={e => pick(2, e.target.value)} className={cls}>
        <option value="">Năm</option>
        {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>
  )
}

interface TimeSelectProps {
  value: string
  onChange: (v: string) => void
  className?: string
}

export function TimeSelect({ value, onChange, className }: TimeSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className ?? 'w-full px-3 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-red-400 outline-none text-sm'}
    >
      <option value="">Chọn giờ</option>
      {WEDDING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  )
}
