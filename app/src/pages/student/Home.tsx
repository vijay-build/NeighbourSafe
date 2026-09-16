import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../../layouts/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { mockReports } from '../../lib/mockData'

const CATEGORIES = [
  { icon: 'visibility', title: 'Unusual Activity', desc: 'Suspicious movements, tailgating, unauthorized presence' },
  { icon: 'nightlight', title: 'Unsafe Location', desc: 'Poor lighting, isolated corners, broken gates' },
  { icon: 'build', title: 'Infrastructure Hazard', desc: 'Water leaks, exposed wiring, broken door locks' },
  { icon: 'badge', title: 'Security Concern', desc: 'Access violation, lost keycards, perimeter tampering' },
  { icon: 'science', title: 'Environmental Issue', desc: 'Spills, fire equipment blocked, chemical air notice' },
]

export function StudentHome() {
  const { profile, demoMode } = useAuth()
  const [reportCount, setReportCount] = useState<number | null>(null)

  useEffect(() => {
    if (!profile) return
    if (demoMode) {
      setReportCount(mockReports.filter((r) => r.reporter_id === profile.id).length)
      return
    }
    supabase
      .from('community_reports')
      .select('id', { count: 'exact', head: true })
      .eq('reporter_id', profile.id)
      .then(({ count }) => setReportCount(count ?? 0))
  }, [profile, demoMode])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <StudentLayout>
      <div className="flex flex-col w-full px-4 pb-space-xl gap-space-lg">
        <section className="flex flex-col pt-space-md">
          <div className="flex items-center justify-between gap-space-sm mb-space-xs">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-high border border-outline-variant/40 text-on-surface px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#ffb95f]" />
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface">
                Campus Alert: Normal
              </span>
            </div>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold tracking-tight">
            Good afternoon, {firstName}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Help keep your campus community safe, calm, and informed.
          </p>
        </section>

        <Link to="/student/report" className="relative group">
          <div className="bg-gradient-to-r from-primary-container via-[#f97316] to-secondary-container text-on-primary shadow-[0_8px_25px_-4px_rgba(249,115,22,0.45)] border border-primary-fixed/40 rounded-xl p-space-lg flex flex-col gap-space-md transition-all active:scale-[0.99] cursor-pointer hover:shadow-[0_10px_30px_-4px_rgba(249,115,22,0.6)]">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-on-primary/20 backdrop-blur-sm border border-on-primary/30 flex items-center justify-center text-on-primary shadow-inner">
                <span className="material-symbols-outlined text-[28px]">add_alert</span>
              </div>
              <div className="flex items-center gap-space-xs bg-on-primary/15 border border-on-primary/25 px-2.5 py-1 rounded-full text-on-primary font-label-sm text-label-sm backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Encrypted &amp; Private</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-primary">
                Report Safety Issue
              </h2>
              <p className="font-body-md text-body-md text-on-primary/90 leading-snug">
                Privately flag physical hazards or safety concerns for swift human verification and dispatcher response.
              </p>
            </div>
            <div className="flex items-center justify-between pt-space-xs border-t border-on-primary/20">
              <span className="font-label-md text-label-md tracking-wider uppercase font-bold text-on-primary">
                Immediate Dispatch Assist
              </span>
              <div className="w-8 h-8 rounded-full bg-on-primary text-primary-container flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
              </div>
            </div>
          </div>
        </Link>

        <section className="grid grid-cols-2 gap-space-sm">
          <Link
            to="/student/my-reports"
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 p-space-md rounded-xl shadow-md flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary-container/30 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              </div>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-medium">My Reports</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {reportCount ?? '—'} submission{reportCount === 1 ? '' : 's'}
              </div>
            </div>
          </Link>
          <a
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 p-space-md rounded-xl shadow-md flex flex-col justify-between transition-colors"
            href="tel:4000"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-secondary/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">headset_mic</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary uppercase bg-surface-container border border-secondary/20 px-1.5 py-0.5 rounded">
                24/7
              </span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-medium">Campus Safety</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Central Security Desk</div>
              <div className="font-label-sm text-label-sm text-primary font-semibold mt-1">ext. 4000 (Dial)</div>
            </div>
          </a>
        </section>

        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-0.5">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
              Quick Flag Categories
            </span>
            <span className="font-label-sm text-label-sm text-primary font-medium">Select issue to begin</span>
          </div>
          <div className="flex flex-col gap-space-xs">
            {CATEGORIES.map((c) => (
              <Link
                key={c.title}
                to="/student/report"
                className="w-full text-left bg-surface-container hover:bg-surface-container-high border border-outline-variant/25 p-space-md rounded-xl shadow-sm flex items-center gap-space-md transition-all active:scale-[0.99] group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-medium">{c.title}</span>
                    <span className="material-symbols-outlined text-secondary text-[18px]">chevron_right</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md flex items-center justify-between text-on-surface-variant shadow-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="material-symbols-outlined text-[18px] text-primary">shield_with_heart</span>
            <span className="font-label-sm text-label-sm truncate text-on-surface">
              AI detects hazards. Campus humans verify all alerts.
            </span>
          </div>
        </section>
      </div>
    </StudentLayout>
  )
}
