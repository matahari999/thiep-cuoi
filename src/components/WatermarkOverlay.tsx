/**
 * WatermarkOverlay
 * 결제 전 미리보기에 표시되는 반투명 반복 패턴 워터마크.
 * pointer-events-none + user-select-none → 사용자 상호작용 방해 없음.
 */

export default function WatermarkOverlay() {
  // SVG 텍스트 패턴을 data URL로 인코딩해 CSS background로 사용
  const text = 'THIỆP CƯỚI ONLINE · CHƯA THANH TOÁN'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="200">
    <text
      x="50%" y="50%"
      dominant-baseline="middle"
      text-anchor="middle"
      font-family="Be Vietnam Pro, sans-serif"
      font-size="22"
      font-weight="600"
      fill="rgba(220,38,38,0.22)"
      transform="rotate(-32, 210, 100)"
      letter-spacing="2"
    >${text}</text>
  </svg>`
  const encoded = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-30"
      style={{
        backgroundImage: encoded,
        backgroundRepeat: 'repeat',
        backgroundSize: '420px 200px',
      }}
    />
  )
}
