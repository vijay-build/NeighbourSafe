import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { path: '/student', icon: 'home', label: 'Home' },
  { path: '/student/report', icon: 'emergency', label: 'Report' },
  { path: '/student/my-reports', icon: 'assignment', label: 'My Reports' },
]

export function StudentLayout({ children, title = 'Sentinel Node' }: { children: ReactNode; title?: string }) {
  const location = useLocation()
  const { profile, signOut } = useAuth()

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-low/90 backdrop-blur-xl shadow-[0_4px_20px_-2px_rgba(1,15,31,0.85)] border-b border-outline-variant/30">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">
                NeighbourSafe
              </span>
              <span className="font-label-sm text-label-sm text-secondary leading-none mt-space-xs tracking-wider uppercase">
                {title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Sign out"
              onClick={() => void signOut()}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>
            <div className="w-11 h-11 flex items-center justify-center pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-surface-container-high ring-1 ring-primary/40 flex items-center justify-center text-primary font-label-sm text-label-sm font-semibold">
                {(profile?.full_name ?? 'S').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-20 bg-surface min-h-screen">{children}</main>
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-low/95 backdrop-blur-xl shadow-[0_-8px_24px_-4px_rgba(1,15,31,0.85)] border-t border-outline-variant/30">
        <div className="h-16 px-space-sm flex items-center justify-around">
          {NAV.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-16 h-11 transition-colors ${
                  active ? 'text-primary-container font-medium' : 'text-on-surface-variant hover:text-primary-container'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm mt-0.5">{item.label}</span>
              </Link>
            )
          })}
          <Link
            to="/student/profile"
            className={`flex flex-col items-center justify-center w-16 h-11 transition-colors ${
              location.pathname === '/student/profile'
                ? 'text-primary-container font-medium'
                : 'text-on-surface-variant hover:text-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="font-label-sm text-label-sm mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
