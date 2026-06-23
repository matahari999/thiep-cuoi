-- paid_invitations: Lemon Squeezy 결제 완료된 초대장 ID 목록
-- invitation_id = 공유 URL의 encodedData 앞 48글자 (클라이언트와 동일하게 파생)

CREATE TABLE IF NOT EXISTS public.paid_invitations (
  invitation_id  TEXT        PRIMARY KEY,
  order_id       TEXT        NOT NULL,
  order_number   INT,
  email          TEXT,
  variant_id     TEXT,
  total_usd      INT,          -- cents
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.paid_invitations ENABLE ROW LEVEL SECURITY;

-- 누구나 자신의 invitation_id 결제 여부를 조회 가능 (SELECT)
CREATE POLICY "public_read_paid_invitations"
  ON public.paid_invitations
  FOR SELECT
  USING (true);

-- INSERT 는 service_role(Edge Function)만 허용 — 별도 정책 없음 (기본 deny)
