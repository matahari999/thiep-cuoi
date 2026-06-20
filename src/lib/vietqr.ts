export interface VnBank {
  id: string   // BIN code
  name: string
  short: string
}

export const VN_BANKS: VnBank[] = [
  { id: '970436', name: 'Vietcombank (VCB)', short: 'VCB' },
  { id: '970407', name: 'Techcombank (TCB)', short: 'TCB' },
  { id: '970422', name: 'MBBank', short: 'MB' },
  { id: '970432', name: 'VPBank', short: 'VPB' },
  { id: '970418', name: 'BIDV', short: 'BIDV' },
  { id: '970405', name: 'Agribank', short: 'AGR' },
  { id: '970416', name: 'ACB', short: 'ACB' },
  { id: '970403', name: 'Sacombank (STB)', short: 'STB' },
  { id: '970423', name: 'TPBank', short: 'TPB' },
  { id: '970448', name: 'OCB', short: 'OCB' },
  { id: '970449', name: 'LPBank', short: 'LPB' },
  { id: '970454', name: 'Ngân hàng Bản Việt', short: 'BVB' },
  { id: '970406', name: 'DongA Bank', short: 'DAB' },
  { id: '970412', name: 'PVcomBank', short: 'PVC' },
  { id: '963388', name: 'MoMo', short: 'MOMO' },
  { id: '422589', name: 'ViettelMoney', short: 'VTM' },
  { id: '546034', name: 'ZaloPay', short: 'ZALO' },
]

export function vietQrUrl(bankId: string, account: string, holderName: string): string {
  return `https://img.vietqr.io/image/${bankId}-${account}-qr_only.png?accountName=${encodeURIComponent(holderName)}`
}

export function encodeBankDisplay(bankId: string, account: string, holderName: string): string {
  const bank = VN_BANKS.find(b => b.id === bankId)
  return bank ? `${bank.short}: ${account} — ${holderName}` : `${account} — ${holderName}`
}
