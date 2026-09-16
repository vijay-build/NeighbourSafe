import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { path: '/security', icon: 'shield', label: 'Overview / Command' },
  { path: '/security/map', icon: 'map', label: 'Campus Map' },
  { path: '/security/community-reports', icon: 'forum', label: 'Community Reports' },
  { path: '/security/audit-logs', icon: 'history_edu', label: 'Audit Logs / History' },
]

export function SecurityLayout({ children, onSimulate }: { children: ReactNode; onSimulate?: () => void }) {
  const location = useLocation()
  const { profile, signOut } = useAuth()

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-outline-variant/30 shadow-[0_1px_12px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col">
          <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-lowest border-b border-outline-variant/20">
            <div className="w-8 h-8 rounded bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                NeighbourSafe
              </span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                Solar Sentinel Core
              </span>
            </div>
          </div>
          <div className="px-space-md pt-space-md pb-space-xs">
            <span className="px-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Intelligence Operations
            </span>
          </div>
          <nav className="flex flex-col gap-space-xs px-space-md">
            {NAV.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded transition-all border ${
                    active
                      ? 'bg-primary-container text-on-primary font-semibold border-primary-fixed/30 shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border-transparent hover:border-outline-variant/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-body-md text-body-md">{item.label}</span>
                </Link>
              )
            })}
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-space-sm px-space-md py-space-sm rounded transition-all border ${
                  location.pathname === '/admin'
                    ? 'bg-primary-container text-on-primary font-semibold border-primary-fixed/30 shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border-transparent hover:border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                <span className="font-body-md text-body-md">Admin / Governance</span>
              </Link>
            )}
          </nav>
        </div>
        <div className="p-space-md bg-surface-container-low mx-space-md mb-space-md rounded border border-outline-variant/30 flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Solar Ethical Mandate</span>
            <span className="material-symbols-outlined text-[14px] text-secondary">policy</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
            AI detects & prioritises. Humans verify & decide.
          </p>
        </div>
      </aside>
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)] z-40 px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="w-7 h-7 rounded bg-primary-container/20 border border-primary/50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[17px]">local_fire_department</span>
            </div>
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1 rounded border border-outline-variant/40">
              <span className="material-symbols-outlined text-[18px] text-secondary">domain</span>
              <span className="font-label-md text-label-md text-on-surface">Demo University — Main Campus</span>
            </div>
          </div>
          <div className="flex items-center gap-space-lg">
            {onSimulate && (
              <button
                onClick={onSimulate}
                className="h-9 px-space-md rounded-lg bg-primary-container hover:bg-inverse-primary text-white font-label-md text-label-md font-medium flex items-center gap-1.5 transition-all shadow-[0_0_18px_rgba(249,115,22,0.45)] border border-primary-fixed/30"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                Simulate Event
              </button>
            )}
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col text-right">
                <span className="font-label-md text-label-md text-on-surface font-medium leading-none">
                  {profile?.full_name ?? 'Officer'}
                </span>
                <span className="font-label-sm text-label-sm text-secondary leading-tight mt-1">
                  {profile?.role === 'admin' ? 'Administrator' : 'Shift Supervisor'}
                </span>
              </div>
              <button
                onClick={() => void signOut()}
                title="Sign out"
                type="button"
                className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 px-gutter bg-surface flex-1">{children}</main>
      </div>
    </div>
  )
}
