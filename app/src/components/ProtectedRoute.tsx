import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../lib/types'

export function ProtectedRoute({ children, allow }: { children: ReactNode; allow: Role[] }) {
  const { session, profile, loading, demoMode } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Verifying session...
          </span>
        </div>
      </div>
    )
  }

  if (!demoMode && (!session || !profile)) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />
  if (!allow.includes(profile.role)) return <Navigate to="/login" replace />

  return <>{children}</>
}
