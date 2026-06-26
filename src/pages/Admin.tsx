import { useState, useEffect, useMemo } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Package, FileText, LogOut, Edit3, Eye, Users, BarChart3, TrendingUp, Clock, ExternalLink, X, MessageCircle, Check, Search, ArrowUpDown } from 'lucide-react'
import { templateCategories, getTemplateById, getCategoryForTemplate } from '../lib/templates'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

interface Order {
  id: string; groom: string; bride: string; date: string; templateId: string
  status: 'pending' | 'in_progress' | 'preview_sent' | 'approved' | 'published'
  contact: string; createdAt: string
}

interface RsvpEntry {
  id: string; guest_name: string; guest_count: string; message: string; invitation_ref: string; created_at: string
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý', in_progress: 'Đang làm', preview_sent: 'Đã gửi xem trước', approved: 'Đã duyệt', published: 'Đã xuất bản',
}
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700',
  preview_sent: 'bg-purple-100 text-purple-700', approved: 'bg-green-100 text-green-700', published: 'bg-emerald-100 text-emerald-700',
}

const mockOrders: Order[] = [
  { id: 'ORD-001', groom: 'Xuân Nam', bride: 'Kim Thơ', date: '08/08/2026', templateId: 'classic-red', status: 'published', contact: '0906.521.623', createdAt: '2026-06-20' },
  { id: 'ORD-002', groom: 'Hoàng Dương', bride: 'Trần Giang', date: '13/06/2026', templateId: 'minimal-beige', status: 'approved', contact: '0912.345.678', createdAt: '2026-06-18' },
  { id: 'ORD-003', groom: 'Văn Tài', bride: 'Trúc Linh', date: '26/07/2026', templateId: 'romantic-pink', status: 'in_progress', contact: '0934.567.890', createdAt: '2026-06-15' },
  { id: 'ORD-004', groom: 'Phúc Khải', bride: 'Khả Tú', date: '20/06/2026', templateId: 'gold-elegant', status: 'pending', contact: '0945.678.901', createdAt: '2026-06-22' },
  { id: 'ORD-005', groom: 'Nhật Trường', bride: 'Thu Ái', date: '23/07/2026', templateId: 'sage-green', status: 'published', contact: '0956.789.012', createdAt: '2026-06-10' },
  { id: 'ORD-006', groom: 'Minh Ngọc', bride: 'Cẩm Ly', date: '30/05/2026', templateId: 'french-vintage', status: 'published', contact: '0967.890.123', createdAt: '2026-05-20' },
  { id: 'ORD-007', groom: 'Đạt', bride: 'Trang', date: '27/05/2026', templateId: 'minimal-black', status: 'preview_sent', contact: '0978.901.234', createdAt: '2026-05-15' },
  { id: 'ORD-008', groom: 'Việt Anh', bride: 'Hải Yến', date: '10/05/2026', templateId: 'dong-son', status: 'pending', contact: '0989.012.345', createdAt: '2026-06-25' },
]

const mockRsvps: RsvpEntry[] = [
  { id: '1', guest_name: 'Minh Anh', guest_count: '2', message: 'Chúc mừng hạnh phúc!', invitation_ref: 'ORD-001', created_at: '2026-06-21T10:00:00' },
  { id: '2', guest_name: 'Thanh Hà', guest_count: '1', message: 'Sẽ đến tham dự ạ', invitation_ref: 'ORD-001', created_at: '2026-06-21T14:30:00' },
  { id: '3', guest_name: 'Tuấn Kiệt', guest_count: '3', message: 'Cả nhà em đều đi ạ', invitation_ref: 'ORD-005', created_at: '2026-06-22T09:15:00' },
  { id: '4', guest_name: 'Bích Loan', guest_count: '2', message: 'Chúc 2 bạn trăm năm!', invitation_ref: 'ORD-003', created_at: '2026-06-19T16:45:00' },
  { id: '5', guest_name: 'Đức Huy', guest_count: '1', message: '', invitation_ref: 'ORD-002', created_at: '2026-06-20T11:20:00' },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const links = [
    { path: '/admin', icon: BarChart3, label: 'Tổng quan' },
    { path: '/admin/orders', icon: Package, label: 'Đơn hàng' },
    { path: '/admin/invitations', icon: FileText, label: 'Thiệp đã xuất bản' },
    { path: '/admin/rsvps', icon: Users, label: 'RSVP / Khách mời' },
  ]
  return (
    <div className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <span className="font-bold text-gray-900">Admin</span>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <Link key={l.path} to={l.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === l.path ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <l.icon className="w-4 h-4" /> {l.label}
          </Link>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-gray-100 mt-4">
        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-3">Bộ sưu tập</p>
        <div className="grid grid-cols-2 gap-1.5">
          {templateCategories.map(cat => (
            <div key={cat.id} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span>{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
              <span className="text-gray-300 ml-auto">{cat.templates.length}</span>
            </div>
          ))}
        </div>
      </div>
      <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-gray-600 text-sm">
        <LogOut className="w-4 h-4" /> Về trang chủ
      </Link>
      {user && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <p className="text-[10px] text-gray-400 truncate px-3 mb-2">{user.email}</p>
          <button onClick={() => { signOut(); navigate('/login') }}
            className="flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-500 text-sm w-full rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (supabase) {
      supabase.from('orders').select('*').then(({ data }) => { if (data) setOrders(data.map(dbToOrder)) })
    } else {
      setOrders(mockOrders)
    }
  }, [])

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const published = orders.filter(o => o.status === 'published').length
    const inProgress = orders.filter(o => o.status === 'in_progress' || o.status === 'preview_sent').length
    const templateCounts: Record<string, number> = {}
    orders.forEach(o => { templateCounts[o.templateId] = (templateCounts[o.templateId] || 0) + 1 })
    const topTemplate = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])[0]
    const topTheme = topTemplate ? getTemplateById(topTemplate[0]) : null

    const now = new Date()
    const thisMonth = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return { total, pending, published, inProgress, thisMonth, topTemplate: topTheme ? `${topTheme.icon} ${topTheme.name} (${topTemplate![1]})` : '-' }
  }, [orders])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tổng quan</h1>
        <p className="text-sm text-gray-400">Dashboard quản lý thiệp cưới online</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Tổng đơn" value={String(stats.total)} color="bg-gray-900" />
        <StatCard icon={Clock} label="Chờ xử lý" value={String(stats.pending)} sub="Cần xử lý ngay" color="bg-yellow-500" />
        <StatCard icon={TrendingUp} label="Đang thực hiện" value={String(stats.inProgress)} color="bg-blue-500" />
        <StatCard icon={Check} label="Đã xuất bản" value={String(stats.published)} color="bg-emerald-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Thống kê</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">Đơn trong tháng này</span>
              <span className="font-semibold text-gray-900">{stats.thisMonth}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500">Mẫu phổ biến nhất</span>
              <span className="font-semibold text-gray-900">{stats.topTemplate}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Phân bố trạng thái</h3>
          <div className="space-y-3">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = orders.filter(o => o.status === key).length
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${key === 'published' ? 'bg-emerald-500' : key === 'pending' ? 'bg-yellow-500' : key === 'in_progress' ? 'bg-blue-500' : key === 'preview_sent' ? 'bg-purple-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function dbToOrder(o: any): Order {
  return {
    id: o.id, groom: o.groom, bride: o.bride, date: o.date ?? '', templateId: o.template_id,
    status: o.status, contact: o.contact, createdAt: o.created_at?.slice(0, 10) || '',
  }
}

function OrderRow({ order, onSelect }: { order: Order; onSelect: (o: Order) => void }) {
  const [status, setStatus] = useState(order.status)
  const template = getTemplateById(order.templateId)
  const cat = getCategoryForTemplate(order.templateId)

  const advance = async () => {
    const flow: Record<string, string> = { pending: 'in_progress', in_progress: 'preview_sent', preview_sent: 'approved', approved: 'published' }
    const next = flow[status]
    if (!next) return
    if (supabase) await supabase.from('orders').update({ status: next }).eq('id', order.id)
    setStatus(next as Order['status'])
  }
  const nextLabel: Record<string, string> = { pending: 'Bắt đầu làm', in_progress: 'Gửi xem trước', preview_sent: 'Duyệt', approved: 'Xuất bản' }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => onSelect(order)} className="shrink-0 hover:opacity-80 transition-opacity">
            {template ? (
              <div className={`w-10 h-10 ${template.cardBg} rounded-xl flex items-center justify-center`}>
                <span className="text-lg">{template.icon}</span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </button>
          <div className="min-w-0">
            <button onClick={() => onSelect(order)} className="hover:underline text-left">
              <h3 className="font-bold text-gray-900">{order.groom} & {order.bride}</h3>
            </button>
            <p className="text-sm text-gray-400 truncate">{order.id} — {order.date}</p>
            {cat && <p className="text-[10px] text-gray-400">{cat.icon} {cat.name} / {template?.name}</p>}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 truncate">{order.contact}</span>
        <div className="flex items-center gap-2 shrink-0">
          {status !== 'published' && nextLabel[status] && (
            <button onClick={advance} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors">
              {nextLabel[status]}
            </button>
          )}
          {status === 'published' && (
            <Link to={`/${order.templateId}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
              <Eye className="w-3 h-3" /> Xem
            </Link>
          )}
          <button onClick={() => onSelect(order)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const template = getTemplateById(order.templateId)
  const cat = getCategoryForTemplate(order.templateId)
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-gray-900">Chi tiết đơn hàng</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {template && <div className={`w-14 h-14 ${template.cardBg} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>{template.icon}</div>}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{order.groom} & {order.bride}</h3>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-2xl p-4">
            {[
              { l: 'Mã đơn', v: order.id }, { l: 'Ngày cưới', v: order.date },
              { l: 'Liên hệ', v: order.contact }, { l: 'Ngày tạo', v: order.createdAt },
              { l: 'Mẫu thiệp', v: template ? `${template.icon} ${template.name}` : '-' },
              { l: 'Danh mục', v: cat ? `${cat.icon} ${cat.name}` : '-' },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-gray-400 text-xs">{l}</p>
                <p className="font-semibold text-gray-800">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {template && (
              <Link to={`/template-preview/${order.templateId}`}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-center rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                <Eye className="w-4 h-4" /> Xem mẫu
              </Link>
            )}
            {order.status === 'published' && (
              <Link to={`/${order.templateId}`}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white text-center rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                <ExternalLink className="w-4 h-4" /> Xem thiệp
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    if (supabase) {
      supabase.from('orders').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setOrders(data.map(dbToOrder)); setLoading(false) })
    } else {
      setOrders(mockOrders); setLoading(false)
    }
  }, [])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter(o => o.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o => `${o.groom} ${o.bride} ${o.id} ${o.contact}`.toLowerCase().includes(q))
    }
    if (sortAsc) list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    return list
  }, [orders, filter, search, sortAsc])

  const statusCounts = useMemo(() =>
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {} as Record<string, number>),
    [orders]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-sm text-gray-400">Tổng: {orders.length} đơn</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm đơn hàng..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none" />
        </div>
        <button onClick={() => setSortAsc(!sortAsc)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${sortAsc ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
          <ArrowUpDown className="w-3.5 h-3.5" /> {sortAsc ? 'Cũ nhất' : 'Mới nhất'}
        </button>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {['all', ...Object.keys(statusLabels)].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? `Tất cả (${orders.length})` : `${statusLabels[f]} (${statusCounts[f] || 0})`}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Không có đơn hàng nào.</div>
        ) : (
          filtered.map(o => <OrderRow key={o.id} order={o} onSelect={setSelected} />)
        )}
      </div>
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function PublishedInvitations() {
  const [published, setPublished] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase) {
      supabase.from('orders').select('*').eq('status', 'published').order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setPublished(data.map(dbToOrder)); setLoading(false) })
    } else {
      setPublished(mockOrders.filter(o => o.status === 'published')); setLoading(false)
    }
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thiệp đã xuất bản</h1>
        <p className="text-sm text-gray-400">{published.length} thiệp</p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
      ) : published.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Chưa có thiệp nào được xuất bản.</div>
      ) : (
        <div className="space-y-4">
          {published.map(o => {
            const template = getTemplateById(o.templateId)
            const cat = getCategoryForTemplate(o.templateId)
            return (
              <div key={o.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {template ? (
                      <div className={`w-12 h-12 ${template.cardBg} rounded-xl flex items-center justify-center shrink-0`}>
                        <span className="text-xl">{template.icon}</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900">{o.groom} & {o.bride}</h3>
                      <p className="text-sm text-gray-400">{o.date}</p>
                      {template && cat && <p className="text-xs text-gray-400">{cat.icon} {template.name}</p>}
                    </div>
                  </div>
                  <Link to={`/${o.templateId}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0">
                    <Eye className="w-4 h-4" /> Xem thiệp
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RsvpList() {
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase) {
      supabase.from('rsvp').select('*').order('created_at', { ascending: false }).limit(50)
        .then(({ data }) => { if (data) setRsvps(data as RsvpEntry[]); setLoading(false) })
    } else {
      setRsvps(mockRsvps); setLoading(false)
    }
  }, [])

  const totalGuests = rsvps.reduce((sum, r) => sum + parseInt(r.guest_count || '1'), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RSVP / Khách mời</h1>
        <p className="text-sm text-gray-400">{rsvps.length} lượt xác nhận · {totalGuests} khách</p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
      ) : rsvps.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Chưa có khách mời nào xác nhận.</div>
      ) : (
        <div className="space-y-3">
          {rsvps.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{r.guest_name}</h3>
                    <p className="text-xs text-gray-400">{r.guest_count} khách · {r.invitation_ref}</p>
                    {r.message && <p className="text-sm text-gray-500 mt-2 flex items-start gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />{r.message}</p>}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{r.created_at?.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="invitations" element={<PublishedInvitations />} />
          <Route path="rsvps" element={<RsvpList />} />
        </Routes>
      </div>
    </div>
  )
}
