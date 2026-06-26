import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Sparkles, ChevronLeft, Download, RotateCcw } from 'lucide-react'

type BadgeShape = 'circle' | 'diamond' | 'hexagon' | 'heart' | 'ring'
type FontStyle = 'serif' | 'sans' | 'script'
type ColorScheme = { name: string; primary: string; secondary: string; bg: string }

const colors: ColorScheme[] = [
  { name: 'Đỏ cổ điển', primary: '#c0392b', secondary: '#e74c3c', bg: '#fdf2f2' },
  { name: 'Hồng lãng mạn', primary: '#e84393', secondary: '#fd79a8', bg: '#fff5f7' },
  { name: 'Vàng sang trọng', primary: '#b8860b', secondary: '#daa520', bg: '#fffdf5' },
  { name: 'Xanh ngọc', primary: '#0d9488', secondary: '#14b8a6', bg: '#f0fdfa' },
  { name: 'Tím thủy chung', primary: '#7c3aed', secondary: '#a78bfa', bg: '#f5f3ff' },
  { name: 'Đen huyền bí', primary: '#1e1e1e', secondary: '#4a4a4a', bg: '#f8f8f8' },
  { name: 'Xanh dương', primary: '#1e40af', secondary: '#3b82f6', bg: '#eff6ff' },
  { name: 'Cam ấm áp', primary: '#d97706', secondary: '#f59e0b', bg: '#fffbeb' },
]

function drawLogo(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  initial1: string, initial2: string,
  shape: BadgeShape,
  fontStyle: FontStyle,
  color: ColorScheme,
) {
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.42

  ctx.save()

  // Shape
  ctx.beginPath()
  if (shape === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
  } else if (shape === 'diamond') {
    ctx.moveTo(cx, cy - r)
    ctx.lineTo(cx + r, cy)
    ctx.lineTo(cx, cy + r)
    ctx.lineTo(cx - r, cy)
    ctx.closePath()
  } else if (shape === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6
      const x = cx + r * Math.cos(a)
      const y = cy + r * Math.sin(a)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
  } else if (shape === 'heart') {
    const hr = r * 0.6
    ctx.moveTo(cx, cy + hr * 1.2)
    ctx.bezierCurveTo(cx - hr * 1.8, cy - hr * 0.4, cx - hr * 1.2, cy - hr * 1.6, cx, cy - hr * 0.8)
    ctx.bezierCurveTo(cx + hr * 1.2, cy - hr * 1.6, cx + hr * 1.8, cy - hr * 0.4, cx, cy + hr * 1.2)
  } else if (shape === 'ring') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = color.primary
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2)
  }

  if (shape !== 'ring') {
    ctx.fillStyle = color.bg
    ctx.fill()
    ctx.strokeStyle = color.primary
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // Decorative dots around the edge
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i
    const dx = cx + (r - 12) * Math.cos(a)
    const dy = cy + (r - 12) * Math.sin(a)
    ctx.beginPath()
    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = color.secondary
    ctx.fill()
  }

  // Ampersand or divider
  ctx.fillStyle = color.secondary
  ctx.font = `bold ${r * 0.15}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('&', cx, cy + r * 0.05)

  // Initial 1 (top)
  const fontSize = r * 0.55
  const fontFamily = fontStyle === 'serif' ? 'Georgia, "Playfair Display", serif'
    : fontStyle === 'script' ? '"Great Vibes", "Brush Script MT", cursive'
    : '"Be Vietnam Pro", "Inter", sans-serif'

  ctx.fillStyle = color.primary
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initial1.toUpperCase(), cx, cy - r * 0.32)

  // Initial 2 (bottom)
  ctx.fillText(initial2.toUpperCase(), cx, cy + r * 0.42)

  // Small decorative line
  ctx.strokeStyle = color.secondary
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.25, cy + r * 0.22)
  ctx.lineTo(cx + r * 0.25, cy + r * 0.22)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.25, cy - r * 0.22)
  ctx.lineTo(cx + r * 0.25, cy - r * 0.22)
  ctx.stroke()

  ctx.restore()
}

export default function WeddingLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [initial1, setInitial1] = useState('N')
  const [initial2, setInitial2] = useState('K')
  const [shape, setShape] = useState<BadgeShape>('circle')
  const [fontStyle, setFontStyle] = useState<FontStyle>('serif')
  const [colorIdx, setColorIdx] = useState(0)

  const color = colors[colorIdx]

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    drawLogo(ctx, size, size, initial1.slice(0, 2), initial2.slice(0, 2), shape, fontStyle, color)
  }, [initial1, initial2, shape, fontStyle, color])

  useEffect(() => { render() }, [render])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `wedding-logo-${initial1}-${initial2}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-serif font-bold text-lg text-gray-900">Thiệp Cưới</span>
          </Link>
          <Link to="/create"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Tạo miễn phí
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">Tạo Logo Đám Cưới</h1>
          <p className="text-gray-400 mb-10">Tạo monogram cá nhân cho đám cưới của bạn</p>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center">
                <canvas ref={canvasRef} width={400} height={400} className="w-full max-w-[400px] aspect-square" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={download}
                  className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Tải xuống PNG
                </button>
                <button onClick={render}
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tên viết tắt</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-1">Chú rể</p>
                    <input value={initial1} onChange={e => setInitial1(e.target.value.slice(0, 3))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-center focus:border-gray-400 outline-none" maxLength={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-1">Cô dâu</p>
                    <input value={initial2} onChange={e => setInitial2(e.target.value.slice(0, 3))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-center focus:border-gray-400 outline-none" maxLength={3} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kiểu khung</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['circle', 'diamond', 'hexagon', 'heart', 'ring'] as const).map(s => (
                    <button key={s} onClick={() => setShape(s)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${shape === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {s === 'circle' ? '○' : s === 'diamond' ? '◇' : s === 'hexagon' ? '⬡' : s === 'heart' ? '♥' : '◎'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Phông chữ</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['serif', 'Serif'], ['sans', 'Sans'], ['script', 'Script']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setFontStyle(key)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${fontStyle === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Màu sắc</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((c, i) => (
                    <button key={c.name} onClick={() => setColorIdx(i)}
                      className={`py-2 rounded-xl text-[10px] font-medium border transition-all ${colorIdx === i ? 'border-gray-900 ring-2 ring-gray-900/20' : 'border-gray-200'}`}>
                      <span className="block w-full h-5 rounded-lg mb-1" style={{ backgroundColor: c.primary }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
