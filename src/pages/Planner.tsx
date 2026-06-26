import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Sparkles, Plus, Trash2, CheckSquare, Square, ChevronLeft, PiggyBank, ListTodo, DollarSign } from 'lucide-react'

interface BudgetItem {
  id: string; category: string; item: string; budget: number; spent: number
}
interface Task {
  id: string; text: string; done: boolean; category: string
}

const budgetCats = ['Địa điểm', 'Ẩm thực', 'Nhiếp ảnh', 'Trang phục', 'Trang trí', 'Hoa', 'Âm nhạc', 'Trang sức', 'Thiệp mời', 'Khác']

function loadBudget(): BudgetItem[] {
  try { return JSON.parse(localStorage.getItem('planner_budget') || '[]') } catch { return [] }
}
function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('planner_tasks') || '[]') } catch { return [] }
}

export default function Planner() {
  const [tab, setTab] = useState<'budget' | 'checklist'>('budget')
  const [budget, setBudget] = useState<BudgetItem[]>(loadBudget)
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [newItem, setNewItem] = useState('')
  const [newCat, setNewCat] = useState(budgetCats[0])
  const [newBudget, setNewBudget] = useState('')
  const [newTask, setNewTask] = useState('')
  const [newTaskCat, setNewTaskCat] = useState('Kế hoạch')

  useEffect(() => { localStorage.setItem('planner_budget', JSON.stringify(budget)) }, [budget])
  useEffect(() => { localStorage.setItem('planner_tasks', JSON.stringify(tasks)) }, [tasks])

  const totalBudget = useMemo(() => budget.reduce((s, b) => s + b.budget, 0), [budget])
  const totalSpent = useMemo(() => budget.reduce((s, b) => s + b.spent, 0), [budget])
  const doneCount = useMemo(() => tasks.filter(t => t.done).length, [tasks])

  const addBudget = () => {
    if (!newItem.trim()) return
    setBudget(prev => [...prev, { id: Date.now().toString(), category: newCat, item: newItem.trim(), budget: +newBudget || 0, spent: 0 }])
    setNewItem(''); setNewBudget('')
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTask.trim(), done: false, category: newTaskCat }])
    setNewTask('')
  }

  const catBudget = useMemo(() => {
    const map: Record<string, { budget: number; spent: number }> = {}
    budget.forEach(b => {
      if (!map[b.category]) map[b.category] = { budget: 0, spent: 0 }
      map[b.category].budget += b.budget
      map[b.category].spent += b.spent
    })
    return map
  }, [budget])

  const catTasks = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach(t => {
      if (!map[t.category]) map[t.category] = []
      map[t.category].push(t)
    })
    return map
  }, [tasks])

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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">Kế hoạch cưới</h1>
          <p className="text-gray-400 mb-8">Lên kế hoạch ngân sách và quản lý công việc đám cưới</p>

          <div className="flex gap-2 mb-8">
            <button onClick={() => setTab('budget')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'budget' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <DollarSign className="w-4 h-4" /> Ngân sách
            </button>
            <button onClick={() => setTab('checklist')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'checklist' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <ListTodo className="w-4 h-4" /> Checklist ({doneCount}/{tasks.length})
            </button>
          </div>

          {tab === 'budget' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Tổng ngân sách', value: totalBudget.toLocaleString('vi-VN') + 'đ', icon: PiggyBank, color: 'bg-blue-500' },
                  { label: 'Đã chi', value: totalSpent.toLocaleString('vi-VN') + 'đ', icon: DollarSign, color: 'bg-red-500' },
                  { label: 'Còn lại', value: (totalBudget - totalSpent).toLocaleString('vi-VN') + 'đ', icon: PiggyBank, color: 'bg-emerald-500' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-semibold">{s.label}</span>
                      <div className={`w-7 h-7 ${s.color} rounded-lg flex items-center justify-center`}>
                        <s.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-gray-800 mb-4">Thêm khoản chi</h3>
                <div className="flex flex-wrap gap-2">
                  <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Khoản chi..."
                    className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none" />
                  <select value={newCat} onChange={e => setNewCat(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none">
                    {budgetCats.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input value={newBudget} onChange={e => setNewBudget(e.target.value)} placeholder="Ngân sách"
                    className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none" />
                  <button onClick={addBudget}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
              </div>

              {Object.entries(catBudget).map(([cat, { budget: b, spent: s }]) => {
                const pct = b > 0 ? Math.min((s / b) * 100, 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-800">{cat}</span>
                      <span className="text-xs text-gray-400">{s.toLocaleString('vi-VN')}đ / {b.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    {budget.filter(b => b.category === cat).map(b => (
                      <div key={b.id} className="flex items-center gap-3 py-2 px-3 bg-white rounded-xl border border-gray-100 mb-1.5 text-sm group">
                        <span className="flex-1 text-gray-700">{b.item}</span>
                        <input type="number" value={b.spent || ''} onChange={e => setBudget(prev => prev.map(p => p.id === b.id ? { ...p, spent: +e.target.value || 0 } : p))}
                          className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-right focus:border-gray-400 outline-none" placeholder="Đã chi" />
                        <span className="text-xs text-gray-400 w-16 text-right">/ {b.budget.toLocaleString('vi-VN')}đ</span>
                        <button onClick={() => setBudget(prev => prev.filter(p => p.id !== b.id))}
                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'checklist' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-gray-800">Tiến độ</h3>
                  <span className="text-xs font-semibold text-gray-500">{doneCount}/{tasks.length} ({tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-gray-800 mb-4">Thêm công việc</h3>
                <div className="flex flex-wrap gap-2">
                  <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Công việc..."
                    className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none" />
                  <select value={newTaskCat} onChange={e => setNewTaskCat(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 outline-none">
                    {['Kế hoạch', 'Địa điểm', 'Thiệp mời', 'Trang trí', 'Ẩm thực', 'Thời trang', 'Khách mời', 'Giải trí', 'Khác'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={addTask}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
              </div>

              {Object.entries(catTasks).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">{cat} ({items.filter(t => t.done).length}/{items.length})</h3>
                  <div className="space-y-1.5">
                    {items.map(t => (
                      <div key={t.id} className="flex items-center gap-3 py-2.5 px-4 bg-white rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                        <button onClick={() => setTasks(prev => prev.map(p => p.id === t.id ? { ...p, done: !p.done } : p))}
                          className="shrink-0">
                          {t.done ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                        </button>
                        <span className={`flex-1 text-sm ${t.done ? 'line-through text-gray-300' : 'text-gray-700'}`}>{t.text}</span>
                        <button onClick={() => setTasks(prev => prev.filter(p => p.id !== t.id))}
                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
