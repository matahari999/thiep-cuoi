// FrameDecoration.tsx
// 청첩장 hero 섹션에 오버레이되는 구조적 SVG 프레임 장식
//
// 좌표계 규칙 (이전 디버깅 혼란 방지용):
//   - 모든 프레임은 viewBox="0 0 100 150" (2:3 세로 비율) 고정 사용
//   - <svg preserveAspectRatio="none"> + 부모에 absolute inset-0 으로 꽉 채움
//   - 즉 viewBox 좌표는 그대로 "퍼센트 좌표"라고 생각하면 됨 (x: 0~100%, y: 0~150 → 세로는 150 unit = 100%)
//   - 囍 글자 path는 0~100 정규화된 별도 좌표계(symbol)이며, <use> 시 scale 변환을 명시적으로 거쳐 메인 좌표계에 맞춤

import type { ReactElement } from 'react'

export type FrameVariant = 'korean-lineart' | 'vietnamese-gold' | 'western-watercolor'

interface FrameDecorationProps {
  variant: FrameVariant
  color?: string
}

// fontTools로 Noto Serif CJK SC Bold에서 추출한 囍(U+56CD, song hỷ/쌍희) 글자의 정규화 path.
// 정규화 좌표계: 0~100 박스 안에 글자가 들어가도록 변환됨 (xMin~xMax, yMin~yMax 모두 0~100 범위 내),
// SVG 표준 y-down 방향으로 이미 반전 처리됨. 폰트 원본 unitsPerEm=1000, bounds=(27,-87,976,849).
const SONG_HY_PATH =
  'M20.65331928345627 0.6849315068493098V13.013698630136986H1.3698630136986303L2.2128556375131723 15.964172813487878H20.65331928345627V24.920969441517386H3.1612223393045316L4.004214963119073 27.976817702845096H47.6290832455216C49.10432033719705 27.976817702845096 50.15806111696523 27.449947312961008 50.47418335089568 26.290832455216012C46.57534246575342 22.813487881981033 40.147523709167544 17.755532139093773 40.147523709167544 17.755532139093773L34.45732349841939 24.920969441517386H32.45521601685985V15.964172813487878H49.31506849315068L50.36880927291886 15.858798735511058H66.80716543730243V24.920969441517386H51.106427818756586L51.949420442571125 27.976817702845096H95.89041095890411C97.36564805057957 27.976817702845096 98.41938883034774 27.449947312961008 98.7355110642782 26.290832455216012C94.83667017913594 22.813487881981033 88.40885142255006 17.755532139093773 88.40885142255006 17.755532139093773L82.82402528977872 24.920969441517386H78.71443624868283V15.858798735511058H97.04952581664911C98.52476290832456 15.858798735511058 99.57850368809274 15.331928345626977 99.8946259220232 14.172813487881982C95.89041095890411 10.590094836670175 89.35721812434141 5.426765015806112 89.35721812434141 5.426765015806112L83.66701791359327 12.908324552160167H78.71443624868283V4.689146469968378C81.13804004214964 4.267650158061116 81.87565858798736 3.3192834562697584 82.086406743941 1.9494204425711246L66.80716543730243 0.6849315068493098V12.908324552160167H50.5795574288725C46.68071654373024 9.536354056901999 41.62276080084299 5.532139093782931 41.62276080084299 5.532139093782931L35.93256059009484 13.013698630136986H32.45521601685985V4.689146469968378C34.98419388830348 4.267650158061116 35.61643835616438 3.3192834562697584 35.82718651211802 1.9494204425711246ZM7.37618545837724 34.088514225500525V53.16122233930453H8.851422550052687C10.1159114857745 53.16122233930453 11.380400421496313 52.95047418335089 12.539515279241307 52.63435194942044C13.80400421496312 55.47945205479452 14.436248682824028 59.48366701791359 13.90937829293994 62.961011591148576C15.17386722866175 64.33087460484721 16.649104320337194 65.06849315068493 18.01896733403583 65.27924130663857H0.0L0.842992623814542 68.33508956796628H49.209694415173864H49.52581664910432H97.15489989462593C98.63013698630138 68.33508956796628 99.68387776606956 67.8082191780822 100.00000000000001 66.64910432033719C96.31190727081139 63.171759747102215 90.20021074815597 58.219178082191775 90.20021074815597 58.219178082191775L84.72075869336145 65.27924130663857H77.87144362486829C81.03266596417282 62.43414120126449 84.51001053740781 59.16754478398314 86.8282402528978 56.63856691253951C89.14646996838779 56.74394099051633 90.30558482613279 55.79557428872497 90.62170706006323 54.53108535300316L77.13382507903057 51.159114857744996C76.60695468914648 55.3740779768177 75.86933614330876 61.16965226554267 75.23709167544784 65.27924130663857H66.59641728134879C71.86512118018967 64.33087460484721 74.81559536354058 56.42781875658588 61.74920969441518 51.791359325605896C63.435194942044255 51.159114857744996 64.59430979978926 50.42149631190727 64.59430979978926 50.0H83.14014752370917V52.21285563751317H85.14225500526871C88.72497365648051 52.21285563751317 94.5205479452055 50.21074815595363 94.62592202318231 49.578503688092724V38.30347734457323C96.31190727081139 37.98735511064278 97.47102212855638 37.249736564805055 97.99789251844047 36.61749209694415L87.35511064278188 28.714436248682823L82.19178082191782 34.088514225500525H65.12118018967335L53.74077976817703 29.55742887249736V53.16122233930453H55.21601685985247C56.48050579557429 53.16122233930453 57.85036880927292 52.95047418335089 59.11485774499473 52.63435194942044C60.379346680716544 55.47945205479452 61.01159114857745 59.48366701791359 60.48472075869336 62.961011591148576C61.74920969441518 64.33087460484721 63.22444678609062 65.06849315068493 64.59430979978926 65.27924130663857H50.5795574288725C47.10221285563751 62.01264488935722 42.571127502634354 58.42992623814541 42.571127502634354 58.42992623814541L37.302423603793464 65.27924130663857H31.296101159114855C34.45732349841939 62.5395152792413 37.82929399367755 59.27291886195995 40.147523709167544 56.74394099051633C42.465753424657535 56.84931506849315 43.73024236037935 55.90094836670179 44.0463645943098 54.636459430979976L30.558482613277135 51.26448893572181C30.031612223393047 55.3740779768177 29.1886195995785 61.16965226554267 28.5563751317176 65.27924130663857H20.021074815595362C25.395152792413064 64.33087460484721 28.240252897787144 56.42781875658588 15.279241306638566 51.791359325605896C16.859852476290833 51.159114857744996 18.01896733403583 50.42149631190727 18.01896733403583 50.0H35.61643835616438V52.21285563751317H37.5131717597471C40.99051633298209 52.21285563751317 46.46996838777661 50.31612223393045 46.57534246575342 49.578503688092724V38.30347734457323C48.366701791359326 37.98735511064278 49.52581664910432 37.249736564805055 50.05268703898841 36.61749209694415L39.620653319283456 28.925184404636454L34.66807165437302 34.088514225500525H18.545837723919917L7.37618545837724 29.55742887249736ZM64.59430979978926 46.94415173867228V37.03898840885142H83.14014752370917V46.94415173867228ZM53.84615384615385 74.13066385669126V99.31506849315069H55.32139093782929C59.74710221285564 99.31506849315069 64.59430979978926 96.89146469968388 64.59430979978926 96.04847207586934V92.8872497365648H82.50790305584827V98.1559536354057H84.51001053740781C87.9873551106428 98.1559536354057 93.67755532139094 96.04847207586934 93.78292939936776 95.41622760800843V78.66174920969442C95.57428872497367 78.34562697576396 96.94415173867229 77.50263435194942 97.47102212855638 76.76501580611169L86.72286617492098 68.75658587987355L81.55953635405692 74.13066385669126H65.12118018967335L53.84615384615385 69.81032665964173ZM64.59430979978926 89.9367755532139V77.18651211801897H82.50790305584827V89.9367755532139ZM18.01896733403583 46.94415173867228V37.03898840885142H35.61643835616438V46.94415173867228ZM7.481559536354057 74.13066385669126V99.31506849315069H8.956796628029505C13.277133825079032 99.31506849315069 18.01896733403583 96.9968387776607 18.01896733403583 96.04847207586934V92.8872497365648H36.14330874604847V98.1559536354057H37.93466807165437C41.51738672286618 98.1559536354057 46.9968387776607 96.15384615384616 47.10221285563751 95.41622760800843V78.66174920969442C48.99894625922023 78.34562697576396 50.26343519494205 77.50263435194942 50.89567966280295 76.76501580611169L40.147523709167544 68.86195995785036L35.19494204425711 74.13066385669126H18.545837723919917L7.481559536354057 69.70495258166491ZM18.01896733403583 89.83140147523709V77.18651211801897H36.14330874604847V89.83140147523709Z'

// 메달리온 중심 좌표 (메인 viewBox 0 0 100 150 기준)
const MEDALLION_CX = 50
const MEDALLION_CY = 14
const MEDALLION_R = 9
// 囍 글자(0~100 정규화)를 메달리온 안에 넣기 위한 스케일: 글자 한 변이 메달리온 지름의 약 62%
const SONGHY_SCALE = (MEDALLION_R * 2 * 0.62) / 100

function SongHyMedallion({ stroke, fill }: { stroke: string; fill: string }): ReactElement {
  return (
    <g>
      {/* 메달리온 외곽 이중 원 */}
      <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r={MEDALLION_R} fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.9" />
      <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r={MEDALLION_R - 1.4} fill="none" stroke={stroke} strokeWidth="0.3" opacity="0.6" />
      {/* 메달리온 배경 */}
      <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r={MEDALLION_R - 1.8} fill={fill} opacity="0.12" />
      {/* 囍 글자: 0~100 정규화 좌표 -> SONGHY_SCALE 배율로 줄여서 메달리온 중심에 배치 */}
      <g
        transform={`translate(${MEDALLION_CX - (100 * SONGHY_SCALE) / 2}, ${
          MEDALLION_CY - (100 * SONGHY_SCALE) / 2
        }) scale(${SONGHY_SCALE})`}
      >
        <path d={SONG_HY_PATH} fill={stroke} />
      </g>
    </g>
  )
}

// trầu cau (빈랑 잎/심장형 잎) 덩굴 모티프 — 모서리를 타고 올라가는 곡선 줄기 + 잎
function BetelLeafVine({ stroke, corner }: { stroke: string; corner: 'tl' | 'tr' | 'bl' | 'br' }): ReactElement {
  const flipX = corner === 'tr' || corner === 'br' ? -1 : 1
  const flipY = corner === 'bl' || corner === 'br' ? -1 : 1
  const tx = corner === 'tr' || corner === 'br' ? 100 : 0
  const ty = corner === 'bl' || corner === 'br' ? 150 : 0

  // 심장형 빈랑잎 하나 (로컬 좌표, 줄기 위 한 지점에 배치됨)
  const leaf = (x: number, y: number, scale: number, rot: number) => (
    <path
      d="M0,0 C-3,-4 -7,-4 -8,0 C-9,4 -4,8 0,12 C4,8 9,4 8,0 C7,-4 3,-4 0,0 Z"
      transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`}
      fill={stroke}
      opacity="0.85"
    />
  )

  return (
    <g transform={`translate(${tx},${ty}) scale(${flipX},${flipY})`}>
      {/* 곡선 줄기 — 모서리에서 안쪽으로 타고 들어옴 */}
      <path
        d="M2,2 C8,10 6,22 14,28 C22,34 20,44 28,48"
        fill="none"
        stroke={stroke}
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {leaf(6, 7, 0.55, 25)}
      {leaf(12, 22, 0.7, -10)}
      {leaf(21, 33, 0.5, 40)}
      {leaf(27, 46, 0.6, 5)}
    </g>
  )
}

function KoreanLineartFrame({ color }: { color: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* 한국 전통 단청/창살 느낌의 모서리 라인아트 — 가늘고 정적인 직선+호 조합 */}
      {/* 상단 모서리 */}
      <path d="M4,2 L4,12 M4,2 L14,2" fill="none" stroke={color} strokeWidth="0.6" opacity="0.95" />
      <path d="M96,2 L96,12 M96,2 L86,2" fill="none" stroke={color} strokeWidth="0.6" opacity="0.95" />
      <path d="M4,148 L4,138 M4,148 L14,148" fill="none" stroke={color} strokeWidth="0.6" opacity="0.95" />
      <path d="M96,148 L96,138 M96,148 L86,148" fill="none" stroke={color} strokeWidth="0.6" opacity="0.95" />

      {/* 상단 가로 띠 — 분합문 창살 패턴 단순화 */}
      <g opacity="0.85">
        <line x1="16" y1="3.2" x2="40" y2="3.2" stroke={color} strokeWidth="0.45" />
        <line x1="60" y1="3.2" x2="84" y2="3.2" stroke={color} strokeWidth="0.45" />
        {[18, 23, 28, 33, 38, 62, 67, 72, 77, 82].map((x) => (
          <line key={x} x1={x} y1="1.4" x2={x} y2="5.0" stroke={color} strokeWidth="0.4" />
        ))}
      </g>

      {/* 하단 가로 띠 */}
      <g opacity="0.8">
        <line x1="10" y1="146.8" x2="44" y2="146.8" stroke={color} strokeWidth="0.45" />
        <line x1="56" y1="146.8" x2="90" y2="146.8" stroke={color} strokeWidth="0.45" />
      </g>

      {/* 메달리온 — 매화(梅花) 문양: 5장 꽃잎 + 중심, 한국 전통 자수/단청에서 흔한 구도 */}
      <g>
        <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r={MEDALLION_R} fill="none" stroke={color} strokeWidth="0.5" opacity="0.55" />
        <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r={MEDALLION_R - 1.6} fill="none" stroke={color} strokeWidth="0.7" opacity="0.95" />
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180)
          const px = MEDALLION_CX + (MEDALLION_R - 4.2) * Math.cos(angle)
          const py = MEDALLION_CY + (MEDALLION_R - 4.2) * Math.sin(angle)
          // 꽃잎 — 타원 장축을 중심에서 바깥으로 향하는 방사 방향에 맞춰 회전 (매화잎이 중심에서 펴지는 모양)
          const rotDeg = i * 72 - 90 + 90
          return (
            <ellipse
              key={i}
              cx={px}
              cy={py}
              rx="1.4"
              ry="2.3"
              fill={color}
              opacity="0.9"
              transform={`rotate(${rotDeg}, ${px}, ${py})`}
            />
          )
        })}
        <circle cx={MEDALLION_CX} cy={MEDALLION_CY} r="1.3" fill={color} opacity="1" />
        {/* 꽃잎 사이를 잇는 가지 — 매화 가지가 메달리온을 가로지르는 느낌 */}
        <path
          d={`M${MEDALLION_CX - MEDALLION_R - 6},${MEDALLION_CY + 2} Q${MEDALLION_CX - 4},${MEDALLION_CY - 6} ${MEDALLION_CX + MEDALLION_R + 6},${MEDALLION_CY + 1}`}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.6"
        />
      </g>

      {/* 좌우 세로 가는 선 (병풍 느낌) */}
      <line x1="4" y1="16" x2="4" y2="134" stroke={color} strokeWidth="0.4" opacity="0.55" />
      <line x1="96" y1="16" x2="96" y2="134" stroke={color} strokeWidth="0.4" opacity="0.55" />
    </svg>
  )
}

function VietnameseGoldFrame({ color }: { color: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <defs>
        <linearGradient id="vn-gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 네 모서리 코너 장식 (베트남 골드 — 곡선형 코너 + trầu cau 덩굴) */}
      <g stroke="url(#vn-gold-grad)" fill="none">
        <path d="M2,16 C2,8 8,2 16,2" strokeWidth="0.8" />
        <path d="M4,16 C4,10 10,4 16,4" strokeWidth="0.4" opacity="0.6" />
      </g>
      <g stroke="url(#vn-gold-grad)" fill="none" transform="translate(100,0) scale(-1,1)">
        <path d="M2,16 C2,8 8,2 16,2" strokeWidth="0.8" />
        <path d="M4,16 C4,10 10,4 16,4" strokeWidth="0.4" opacity="0.6" />
      </g>
      <g stroke="url(#vn-gold-grad)" fill="none" transform="translate(0,150) scale(1,-1)">
        <path d="M2,16 C2,8 8,2 16,2" strokeWidth="0.8" />
        <path d="M4,16 C4,10 10,4 16,4" strokeWidth="0.4" opacity="0.6" />
      </g>
      <g stroke="url(#vn-gold-grad)" fill="none" transform="translate(100,150) scale(-1,-1)">
        <path d="M2,16 C2,8 8,2 16,2" strokeWidth="0.8" />
        <path d="M4,16 C4,10 10,4 16,4" strokeWidth="0.4" opacity="0.6" />
      </g>

      {/* trầu cau 빈랑잎 덩굴 — 네 모서리 */}
      <BetelLeafVine stroke={color} corner="tl" />
      <BetelLeafVine stroke={color} corner="tr" />
      <BetelLeafVine stroke={color} corner="bl" />
      <BetelLeafVine stroke={color} corner="br" />

      {/* 상단 중앙 囍 메달리온 */}
      <SongHyMedallion stroke={color} fill={color} />

      {/* 메달리온에서 좌우로 뻗는 가는 골드 라인 */}
      <line x1={MEDALLION_CX - MEDALLION_R} y1={MEDALLION_CY} x2="20" y2={MEDALLION_CY} stroke={color} strokeWidth="0.35" opacity="0.5" />
      <line x1={MEDALLION_CX + MEDALLION_R} y1={MEDALLION_CY} x2="80" y2={MEDALLION_CY} stroke={color} strokeWidth="0.35" opacity="0.5" />
    </svg>
  )
}

function WesternWatercolorFrame({ color }: { color: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <defs>
        <filter id="wc-blur">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* 수채화풍 모서리 꽃다발 — 불규칙한 둥근 얼룩 + 가지 형태 */}
      {[
        { x: 6, y: 8, s: 1 },
        { x: 94, y: 10, s: -1 },
        { x: 8, y: 142, s: 1 },
        { x: 92, y: 140, s: -1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y}) scale(${c.s},1)`} opacity="0.7">
          <circle cx="0" cy="0" r="3.2" fill={color} opacity="0.25" filter="url(#wc-blur)" />
          <circle cx="3" cy="-2" r="2.1" fill={color} opacity="0.3" filter="url(#wc-blur)" />
          <circle cx="-2" cy="3" r="1.6" fill={color} opacity="0.35" filter="url(#wc-blur)" />
          <path d="M0,0 C4,3 6,9 5,14" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5" />
        </g>
      ))}

      {/* 상단 중앙 — 부드러운 아치형 꽃 가지 (메달리온 대신 가지 아치) */}
      <path
        d="M30,8 C40,2 60,2 70,8"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.55"
      />
      {[35, 42, 50, 58, 65].map((x, i) => (
        <circle key={x} cx={x} cy={8 - Math.sin((i / 4) * Math.PI) * 4} r="1.3" fill={color} opacity="0.4" filter="url(#wc-blur)" />
      ))}
    </svg>
  )
}

export default function FrameDecoration({ variant, color = '#d4af37' }: FrameDecorationProps): ReactElement {
  if (variant === 'korean-lineart') return <KoreanLineartFrame color={color} />
  if (variant === 'western-watercolor') return <WesternWatercolorFrame color={color} />
  return <VietnameseGoldFrame color={color} />
}
