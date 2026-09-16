import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Role } from '../lib/types'

const ROLES: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'security', label: 'Security Dispatch' },
  { value: 'admin', label: 'Campus Admin' },
]

export function Login() {
  const { signIn, signUp, profile, demoMode, demoSignIn } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('student')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (demoMode) {
        demoSignIn(role)
      } else if (mode === 'signup') {
        await signUp(email, password, fullName, role)
      } else {
        await signIn(email, password)
      }
      const dest = role === 'security' ? '/security' : role === 'admin' ? '/admin' : '/student'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  void profile

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen flex items-center justify-center">
      <main className="w-full flex items-center justify-center">
        <div className="flex flex-col w-full min-h-[80vh] p-space-md lg:p-space-xl text-on-surface">
          {!isSupabaseConfigured && (
            <div className="max-w-[1000px] mx-auto w-full mb-space-md p-space-md rounded-xl bg-secondary-container/15 border border-secondary/40 text-secondary font-body-sm text-body-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">science</span>
              <span>
                Running in <strong>Demo Mode</strong> with sample data — pick a role and sign in instantly. Connect
                Supabase later (<code>app/.env</code>) to persist real data.
              </span>
            </div>
          )}
          <div className="w-full max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center gap-space-lg p-space-lg lg:p-space-xl bg-surface-container-lowest rounded-xl border border-primary/10 shadow-2xl">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-primary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">shield_with_heart</span>
                </div>
                <div>
                  <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                    NeighbourSafe
                  </span>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-0.5">
                    Autonomous Campus Safety Core
                  </p>
                </div>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                See the signal. <span className="text-primary font-bold">Understand the context.</span> Enable the decisive
                response.
              </h1>
              <blockquote className="font-body-md text-body-md text-on-surface-variant italic border-l-2 border-primary/30 pl-space-md">
                "AI detects and prioritises. Humans verify and decide. An ethical safety intelligence platform built for
                campus trust and transparent governance."
              </blockquote>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="w-full max-w-[480px] mx-auto bg-surface-container rounded-xl p-space-lg sm:p-space-xl shadow-2xl relative border border-primary/15">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary rounded-t-xl" />
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight mt-1">
                  Demo University Security Gateway
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Enter authorized university credentials to access live command matrices.
                </p>

                <div className="flex flex-col gap-space-xs my-space-lg">
                  <span className="font-label-sm text-label-sm uppercase text-outline font-medium tracking-wide">
                    Select Console Access Role
                  </span>
                  <div className="grid grid-cols-3 p-1 bg-surface-container-lowest rounded-lg gap-1 border border-primary/10">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`py-2 px-1 text-center font-label-sm text-label-sm rounded transition-all ${
                          role === r.value
                            ? 'font-semibold bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                  {demoMode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm uppercase text-on-surface font-medium">
                        Display Name (optional)
                      </label>
                      <input
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3 py-2 rounded-lg border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        type="text"
                        placeholder="Sarah Anderson"
                      />
                    </div>
                  )}
                  {!demoMode && mode === 'signup' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm uppercase text-on-surface font-medium">
                        Full Name
                      </label>
                      <input
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3 py-2 rounded-lg border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        type="text"
                        placeholder="Sarah Anderson"
                      />
                    </div>
                  )}
                  {!demoMode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm uppercase text-on-surface font-medium">
                        Campus Identity / University Email
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-xl">
                          badge
                        </span>
                        <input
                          className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-3 py-2 rounded-lg border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          type="email"
                          placeholder="m.vance@demouni.edu"
                        />
                      </div>
                    </div>
                  )}
                  {!demoMode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm uppercase text-on-surface font-medium">
                        Security Passcode
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-xl">
                          encrypted
                        </span>
                        <input
                          className="w-full bg-surface-container-lowest text-on-surface font-code-sm pl-10 pr-3 py-2 rounded-lg border border-transparent focus:border-primary/50 focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="text-error font-label-sm text-label-sm bg-error-container/20 border border-error/40 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    className="w-full h-11 bg-primary hover:bg-[#ea580c] text-white font-headline-sm text-headline-sm font-semibold rounded-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-space-sm transition-all disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                    ) : (
                      <span>
                        {demoMode
                          ? `Enter as ${ROLES.find((r) => r.value === role)?.label}`
                          : mode === 'signup'
                            ? 'Create Account & Sign In'
                            : 'Sign In to Operations Console'}
                      </span>
                    )}
                  </button>

                  {!demoMode && (
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="font-label-sm text-label-sm text-primary hover:text-secondary hover:underline transition-colors self-center"
                    >
                      {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
