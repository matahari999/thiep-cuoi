import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LogIn, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
      <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
    </div>
  )

  if (user) {
    navigate('/admin', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const msg = isSignUp ? await signUp(email, password) : await signIn(email, password)
    setSubmitting(false)
    if (msg) setError(msg)
    else if (!isSignUp) navigate('/admin', { replace: true })
    else {
      setError('가입 성공! 이메일을 확인해주세요.')
      setIsSignUp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isSignUp ? 'Tạo tài khoản để quản lý thiệp cưới' : 'Đăng nhập để quản lý thiệp cưới'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 outline-none text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className={`text-sm text-center ${error.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting || !email || !password}
            className="w-full py-3 bg-gradient-to-r from-red-400 to-rose-400 text-white rounded-xl font-semibold hover:from-red-500 hover:to-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {submitting ? 'Đang xử lý...' : isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-sm text-red-400 hover:text-red-500 transition-colors">
            {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            Bản quyền © 2026 Thiệp Cưới Online. Phiên bản Beta.
          </p>
        </div>
      </div>
    </div>
  )
}
