import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { mockProfile } from '../lib/mockData'
import type { Profile, Role } from '../lib/types'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  demoSignIn: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_STORAGE_KEY = 'neighboursafe_demo_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('auth_user_id', userId).maybeSingle()
    setProfile(data as Profile | null)
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY)
      if (stored) {
        try {
          setProfile(JSON.parse(stored) as Profile)
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY)
        }
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  function demoSignIn(role: Role) {
    const p = mockProfile(role)
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string, role: Role) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Sign up did not return a user')

    const { data: campus } = await supabase.from('campuses').select('id').limit(1).maybeSingle()

    const { error: profileError } = await supabase.from('profiles').insert({
      auth_user_id: data.user.id,
      full_name: fullName,
      email,
      role,
      campus_id: campus?.id ?? null,
    })
    if (profileError) throw profileError
    await loadProfile(data.user.id)
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_STORAGE_KEY)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        demoMode: !isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        demoSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
