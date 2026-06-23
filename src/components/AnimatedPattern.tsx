import { useMemo, Fragment, type ReactElement } from 'react'

export type PatternId =
  | 'waves-sine' | 'waves-ocean' | 'waves-ripple'
  | 'wood-bamboo' | 'wood-leaves' | 'wood-branch'
  | 'floral-cherry' | 'floral-rose' | 'floral-lotus'
  | 'stars-twinkle' | 'stars-shooting' | 'stars-dust'
  | 'geo-diamond' | 'geo-heart' | 'geo-circle'

const r = (min: number, max: number) => Math.random() * (max - min) + min

// ── 물결 ─────────────────────────────────────────────────────────────────────

function WavesSine({ color }: { color: string }) {
  const lines = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    id: i, yPct: 12 + i * 13, amp: r(10, 24), speed: r(10, 18), delay: r(-10, 0), opacity: r(0.05, 0.12),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
        {lines.map(l => {
          const y = l.yPct * 2, a = l.amp
          return (
            <path key={l.id} stroke="currentColor" strokeWidth="1.2" fill="none" opacity={l.opacity}
              d={`M-100,${y} Q0,${y-a} 100,${y} Q200,${y+a} 300,${y} Q400,${y-a} 500,${y} Q600,${y+a} 700,${y} Q800,${y-a} 900,${y}`}
              style={{ animation: `waveSineMove ${l.speed}s linear ${l.delay}s infinite` }} />
          )
        })}
      </svg>
    </div>
  )
}

function WavesOcean({ color }: { color: string }) {
  const waves = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i, bottomPct: i * 9, speed: 3.5 + i * 1.5, delay: -i * 1.2, opacity: 0.05 + i * 0.018,
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {waves.map(w => (
        <div key={w.id} className="absolute left-0 right-0 h-32"
          style={{ bottom: `${w.bottomPct}%`, opacity: w.opacity, animation: `waveOceanRise ${w.speed}s ease-in-out ${w.delay}s infinite alternate` }}>
          <svg className="w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none">
            <path d="M-10,40 Q100,10 200,40 Q300,70 400,40 Q500,10 600,40 Q700,70 810,40 L810,80 L-10,80 Z" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function WavesRipple({ color }: { color: string }) {
  const ripples = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, cx: r(15, 85), cy: r(15, 85), speed: r(4, 8), delay: r(-8, 0),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {ripples.map(rp => (
        <div key={rp.id} className="absolute rounded-full"
          style={{ left: `${rp.cx}%`, top: `${rp.cy}%`, width: 8, height: 8,
            transform: 'translate(-50%,-50%)', border: '1px solid currentColor',
            animation: `waveRippleExpand ${rp.speed}s ease-out ${rp.delay}s infinite` }} />
      ))}
    </div>
  )
}

// ── 나무 ─────────────────────────────────────────────────────────────────────

function WoodBamboo({ color }: { color: string }) {
  const stalks = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: i, x: 3 + i * 11 + r(-3, 3), height: r(50, 88), width: r(4, 7),
    speed: r(3, 6), delay: r(-4, 0), opacity: r(0.08, 0.18), nodes: Math.floor(r(3, 6)),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {stalks.map(s => (
        <div key={s.id} className="absolute bottom-0"
          style={{ left: `${s.x}%`, opacity: s.opacity, transformOrigin: 'bottom center',
            animation: `bambooSway ${s.speed}s ease-in-out ${s.delay}s infinite alternate` }}>
          <div style={{ width: s.width, height: `${s.height}vh`, backgroundColor: 'currentColor', borderRadius: '3px 3px 0 0', position: 'relative' }}>
            {Array.from({ length: s.nodes }).map((_, ni) => (
              <div key={ni} style={{ position: 'absolute', left: -3, right: -3, height: 4,
                backgroundColor: 'currentColor', top: `${((ni + 1) / (s.nodes + 1)) * 100}%`, borderRadius: 2 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function WoodLeaves({ color }: { color: string }) {
  const leaves = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, left: r(0, 100), delay: r(-14, 0), speed: r(9, 17),
    size: r(12, 22), opacity: r(0.2, 0.42), initRot: r(0, 360),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {leaves.map(l => (
        <div key={l.id} className="absolute" style={{ left: `${l.left}%`, top: -30, opacity: l.opacity, animation: `leafFall ${l.speed}s linear ${l.delay}s infinite` }}>
          <svg viewBox="0 0 20 28" width={l.size} height={l.size * 1.4} fill="currentColor" style={{ transform: `rotate(${l.initRot}deg)` }}>
            <path d="M10,0 C5,4 1,10 1,16 C1,22 5.5,27 10,28 C14.5,27 19,22 19,16 C19,10 15,4 10,0Z" opacity="0.9" />
            <path d="M10,1 L10,27" stroke="white" strokeWidth="0.6" opacity="0.3" />
            <path d="M10,8 Q6,12 4,16 M10,8 Q14,12 16,16" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function WoodBranch({ color }: { color: string }) {
  const dots = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i, left: r(5, 75), top: r(5, 65), size: r(5, 13), delay: r(-8, 0), speed: r(3, 6), opacity: r(0.12, 0.3),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" opacity="0.08">
        <path d="M2,100 Q15,65 28,42 Q42,20 55,30 M28,42 Q35,22 48,12 M28,42 Q22,18 32,5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M12,100 Q30,68 44,50 Q58,32 65,38 M44,50 Q50,28 62,18 M44,50 Q38,30 48,16" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
      </svg>
      {dots.map(d => (
        <div key={d.id} className="absolute rounded-full"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size,
            backgroundColor: 'currentColor', opacity: d.opacity, animation: `blossomPulse ${d.speed}s ease-in-out ${d.delay}s infinite` }} />
      ))}
    </div>
  )
}

// ── 꽃 ───────────────────────────────────────────────────────────────────────

function FloralCherry({ color }: { color: string }) {
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i, left: r(0, 100), delay: r(-14, 0), speed: r(7, 14), size: r(8, 18), opacity: r(0.2, 0.5),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {petals.map(p => (
        <div key={p.id} className="absolute" style={{ left: `${p.left}%`, top: -24, opacity: p.opacity, animation: `petalFall ${p.speed}s linear ${p.delay}s infinite` }}>
          <svg viewBox="0 0 20 24" width={p.size} height={p.size * 1.2} fill="currentColor">
            <ellipse cx="10" cy="12" rx="7" ry="10" />
            <ellipse cx="10" cy="10" rx="3" ry="5" fill="white" opacity="0.22" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function FloralRose({ color }: { color: string }) {
  const petals = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i, left: r(0, 100), delay: r(-16, 0), speed: r(10, 18),
    size: r(14, 26), opacity: r(0.15, 0.35), rotOff: r(-60, 60),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {petals.map(p => (
        <div key={p.id} className="absolute" style={{ left: `${p.left}%`, top: -32, opacity: p.opacity, animation: `rosePetalFall ${p.speed}s ease-in-out ${p.delay}s infinite` }}>
          <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor" style={{ transform: `rotate(${p.rotOff}deg)` }}>
            <path d="M12,1 C12,1 21,7 21,14 C21,19 17,23 12,23 C7,23 3,19 3,14 C3,7 12,1 12,1Z" />
            <path d="M12,3 Q8,10 12,22" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function FloralLotus({ color }: { color: string }) {
  const rings = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ id: i, delay: -i * 2, speed: 10 })), [])
  const PETALS = 6
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {rings.map(rg => (
        <div key={rg.id} className="absolute inset-0 flex items-center justify-center"
          style={{ animation: `lotusExpand ${rg.speed}s ease-out ${rg.delay}s infinite` }}>
          <svg viewBox="0 0 100 100" width="160" height="160" fill="none" stroke="currentColor">
            {Array.from({ length: PETALS }).map((_, pi) => {
              const ang = (pi / PETALS) * Math.PI * 2
              const x1 = 50 + Math.cos(ang) * 6,  y1 = 50 + Math.sin(ang) * 6
              const x2 = 50 + Math.cos(ang) * 42, y2 = 50 + Math.sin(ang) * 42
              const cx = 50 + Math.cos(ang + 0.35) * 26, cy = 50 + Math.sin(ang + 0.35) * 26
              return <path key={pi} d={`M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`} strokeWidth="0.6" opacity="0.5" />
            })}
            <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ── 별빛 ─────────────────────────────────────────────────────────────────────

function StarsTwinkle({ color }: { color: string }) {
  const stars = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i, left: r(2, 98), top: r(2, 98), size: r(4, 9), delay: r(-6, 0), speed: r(2, 5), opacity: r(0.2, 0.6),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {stars.map(s => (
        <div key={s.id} className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%`, opacity: s.opacity, animation: `starTwinkle ${s.speed}s ease-in-out ${s.delay}s infinite` }}>
          <svg viewBox="0 0 12 12" width={s.size} height={s.size} fill="currentColor">
            <path d="M6,0 L7,5 L12,6 L7,7 L6,12 L5,7 L0,6 L5,5 Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function StarsShooting({ color }: { color: string }) {
  const stars = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, sx: r(-10, 50), sy: r(-5, 40), delay: r(-12, 0), speed: r(2.5, 5), opacity: r(0.3, 0.6), len: Math.floor(r(80, 140)),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {stars.map(s => (
        <div key={s.id} className="absolute"
          style={{ left: `${s.sx}%`, top: `${s.sy}%`, opacity: s.opacity, transform: 'rotate(45deg)', transformOrigin: 'left center', animation: `shootingStarMove ${s.speed}s ease-in ${s.delay}s infinite` }}>
          <svg viewBox={`0 0 ${s.len} 4`} width={s.len} height={4}>
            <defs>
              <linearGradient id={`ssg${s.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>
            <line x1="0" y1="2" x2={s.len - 3} y2="2" stroke={`url(#ssg${s.id})`} strokeWidth="1.5" />
            <circle cx={s.len - 2} cy="2" r="2" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function StarsDust({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i, left: r(0, 100), top: r(20, 100), size: r(2, 5), delay: r(-20, 0), speed: r(10, 22), opacity: r(0.2, 0.5),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
            backgroundColor: 'currentColor', opacity: p.opacity, animation: `dustFloat ${p.speed}s ease-in-out ${p.delay}s infinite` }} />
      ))}
    </div>
  )
}

// ── 기하학 ───────────────────────────────────────────────────────────────────

function GeoDiamond({ color }: { color: string }) {
  const items = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i, left: r(2, 98), top: r(20, 100), size: r(8, 20), delay: r(-14, 0), speed: r(7, 14), opacity: r(0.1, 0.28),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {items.map(d => (
        <div key={d.id} className="absolute" style={{ left: `${d.left}%`, top: `${d.top}%`, opacity: d.opacity, animation: `diamondFloat ${d.speed}s ease-in-out ${d.delay}s infinite` }}>
          <svg viewBox="0 0 20 20" width={d.size} height={d.size} fill="none" stroke="currentColor" strokeWidth="1.2">
            <polygon points="10,1 19,10 10,19 1,10" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function GeoHeart({ color }: { color: string }) {
  const hearts = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, left: r(2, 98), delay: r(-14, 0), speed: r(6, 12), size: r(8, 20), opacity: r(0.15, 0.4),
  })), [])
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {hearts.map(h => (
        <div key={h.id} className="absolute" style={{ left: `${h.left}%`, bottom: -24, opacity: h.opacity, animation: `heartRise ${h.speed}s ease-in-out ${h.delay}s infinite` }}>
          <svg viewBox="0 0 24 22" width={h.size} height={h.size} fill="currentColor">
            <path d="M12,21 C12,21 2,13 2,7 C2,4 4,2 7,2 C9.5,2 11,4 12,5.5 C13,4 14.5,2 17,2 C20,2 22,4 22,7 C22,13 12,21 12,21Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function GeoCircle({ color }: { color: string }) {
  const groups = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i, cx: r(20, 80), cy: r(20, 80), speed: r(5, 9), delay: r(-8, 0),
  })), [])
  const RINGS = 3
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden print-hidden" style={{ color }}>
      {groups.map(g => (
        <Fragment key={g.id}>
          {Array.from({ length: RINGS }).map((_, ri) => (
            <div key={ri} className="absolute rounded-full"
              style={{ left: `${g.cx}%`, top: `${g.cy}%`, width: 8, height: 8,
                transform: 'translate(-50%,-50%)', border: '1px solid currentColor',
                animation: `circleRingExpand ${g.speed}s ease-out ${g.delay - ri * (g.speed / RINGS)}s infinite` }} />
          ))}
        </Fragment>
      ))}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

type PC = (props: { color: string }) => ReactElement

const map: Record<PatternId, PC> = {
  'waves-sine': WavesSine, 'waves-ocean': WavesOcean, 'waves-ripple': WavesRipple,
  'wood-bamboo': WoodBamboo, 'wood-leaves': WoodLeaves, 'wood-branch': WoodBranch,
  'floral-cherry': FloralCherry, 'floral-rose': FloralRose, 'floral-lotus': FloralLotus,
  'stars-twinkle': StarsTwinkle, 'stars-shooting': StarsShooting, 'stars-dust': StarsDust,
  'geo-diamond': GeoDiamond, 'geo-heart': GeoHeart, 'geo-circle': GeoCircle,
}

export function AnimatedPattern({ id, color = '#fca5a5' }: { id: PatternId; color?: string }) {
  const C = map[id]
  return C ? <C color={color} /> : null
}
