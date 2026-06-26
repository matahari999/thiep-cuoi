import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
      <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
