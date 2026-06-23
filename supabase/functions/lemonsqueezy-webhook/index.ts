/**
 * Lemon Squeezy 웹훅 수신 → paid_invitations 테이블 업데이트
 *
 * Supabase 대시보드 환경 변수:
 *   WEBHOOK_SECRET  Lemon Squeezy 웹훅 서명 시크릿
 *
 * 웹훅 URL (Lemon Squeezy 설정):
 *   https://<project>.supabase.co/functions/v1/lemonsqueezy-webhook
 *
 * 구독 이벤트: order_created
 * Checkout custom data: { "invitation_id": "<48-char slice of encodedData>" }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// HMAC-SHA256 서명 검증
async function verifySignature(body: string, header: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true  // 개발 환경: 시크릿 미설정 시 통과
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const sig = hexToUint8(header)
  if (!sig) return false
  return crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(body))
}

function hexToUint8(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return arr
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  const valid = await verifySignature(rawBody, signature)
  if (!valid) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const meta = payload.meta as Record<string, unknown> | undefined
  const eventName  = meta?.event_name as string | undefined
  const customData = meta?.custom_data as Record<string, unknown> | undefined

  // order_created 이벤트만 처리
  if (eventName !== 'order_created') {
    return new Response('Ignored', { status: 200 })
  }

  const invitationId = customData?.invitation_id as string | undefined
  if (!invitationId) {
    // custom_data 없이 들어온 결제는 무시 (직접 결제 등)
    return new Response('No invitation_id in custom_data', { status: 200 })
  }

  const dataObj    = payload.data as Record<string, unknown> | undefined
  const attrs      = dataObj?.attributes as Record<string, unknown> | undefined
  const orderId    = String(dataObj?.id ?? '')
  const orderNum   = attrs?.order_number as number | undefined
  const email      = attrs?.user_email as string | undefined
  const total      = attrs?.total as number | undefined
  const firstItem  = attrs?.first_order_item as Record<string, unknown> | undefined
  const variantId  = String(firstItem?.variant_id ?? '')

  // 결제 상태가 paid 인지 확인
  if (attrs?.status !== 'paid') {
    return new Response('Order not paid', { status: 200 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const { error } = await supabase
    .from('paid_invitations')
    .upsert({
      invitation_id: invitationId,
      order_id:      orderId,
      order_number:  orderNum ?? null,
      email:         email ?? null,
      variant_id:    variantId || null,
      total_usd:     total ?? null,
    }, { onConflict: 'invitation_id' })

  if (error) {
    console.error('Supabase upsert error:', error)
    return new Response('DB error', { status: 500 })
  }

  console.log(`✅ paid_invitations upserted: ${invitationId} (order ${orderId})`)
  return new Response('OK', { status: 200 })
})
