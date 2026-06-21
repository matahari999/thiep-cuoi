import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Heart, Package, FileText, LogOut, Edit3, Eye } from 'lucide-react'
import { templateCategories, getTemplateById, getCategoryForTemplate } from '../lib/templates'
import { supabase } from '../lib/supabase'

interface Order {
  id: string
  groom: string
  bride: string
  date: string
  templateId: string
  status: 'pending' | 'in_progress' | 'preview_sent' | 'approved' | 'published'
  contact: string
  createdAt: string
}

function dbToOrder(o: any): Order {
  return {
    id: o.id,
    groom: o.groom,
    bride: o.bride,
    date: o.date ?? '',
    templateId: o.template_id,
    status: o.status,
    contact: o.contact,
    createdAt: o.created_at ? o.created_at.slice(0, 10) : '',
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang làm',
  preview_sent: 'Đã gửi xem trước',
  approved: 'Đã duyệt',
  published: 'Đã xuất bản'
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  preview_sent: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  published: 'bg-emerald-100 text-emerald-700'
}

function Sidebar() {
  const location = useLocation()
  const links = [
    { path: '/admin', icon: Package, label: 'Đơn hàng' },
    { path: '/admin/invitations', icon: FileText, label: 'Thiệp đã xuất bản' },
  ]
  return (
    <div className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <span className="font-bold text-gray-900">Admin</span>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <Link
            key={l.path}
            to={l.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === l.path ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <l.icon className="w-4 h-4" />
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 px-2">
        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Danh mục</p>
        {templateCategories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2 text-xs text-gray-500">
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="text-gray-300">({cat.templates.length})</span>
          </div>
        ))}
      </div>
      <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-gray-600 text-sm mt-4">
        <LogOut className="w-4 h-4" /> Về trang chủ
      </Link>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status)
  const nextStatus = { pending: 'in_progress', in_progress: 'preview_sent', preview_sent: 'approved', approved: 'published' } as const
  const nextLabel = { pending: 'Bắt đầu làm', in_progress: 'Gửi xem trước', preview_sent: 'Duyệt', approved: 'Xuất bản' } as const
  const template = getTemplateById(order.templateId)
  const cat = getCategoryForTemplate(order.templateId)

  const advance = async () => {
    const next = nextStatus[status as keyof typeof nextStatus]
    if (!next) return
    if (supabase) await supabase.from('orders').update({ status: next }).eq('id', order.id)
    setStatus(next as Order['status'])
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {template && (
            <div className={`w-10 h-10 ${template.cardBg} rounded-xl flex items-center justify-center shrink-0`}>
              <span className="text-lg">{template.icon}</span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{order.groom} & {order.bride}</h3>
            <p className="text-sm text-gray-400">{order.id} — {order.date}</p>
            {cat && <p className="text-[10px] text-gray-400">{cat.icon} {cat.name} / {template?.name}</p>}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          <span>{order.contact}</span>
        </div>
        <div className="flex items-center gap-2">
          {status !== 'published' && (
            <button onClick={advance} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors">
              {nextLabel[status as keyof typeof nextLabel]}
            </button>
          )}
          {status === 'published' && (
            <Link to={`/${order.templateId}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
              <Eye className="w-3 h-3" /> Xem
            </Link>
          )}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(dbToOrder))
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-sm text-gray-400">Tổng: {orders.length} đơn</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {['all', 'pending', 'in_progress', 'preview_sent', 'approved', 'published'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
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
          filtered.map(o => <OrderRow key={o.id} order={o} />)
        )}
      </div>
    </div>
  )
}

function PublishedInvitations() {
  const [published, setPublished] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.from('orders').select('*').eq('status', 'published').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPublished(data.map(dbToOrder))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thiệp đã xuất bản</h1>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
      ) : published.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Chưa có thiệp nào được xuất bản.</div>
      ) : published.map(o => {
        const template = getTemplateById(o.templateId)
        const cat = getCategoryForTemplate(o.templateId)
        return (
          <div key={o.id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {template && (
                  <div className={`w-12 h-12 ${template.cardBg} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">{template.icon}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{o.groom} & {o.bride}</h3>
                  <p className="text-sm text-gray-400">{o.date}</p>
                  {template && cat && <p className="text-xs text-gray-400">{cat.icon} {template.name}</p>}
                </div>
              </div>
              <Link
                to={`/${o.templateId}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Xem thiệp
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route index element={<OrderList />} />
          <Route path="invitations" element={<PublishedInvitations />} />
        </Routes>
      </div>
    </div>
  )
}
