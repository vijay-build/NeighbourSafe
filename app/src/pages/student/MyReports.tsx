import { useEffect, useState } from 'react'
import { StudentLayout } from '../../layouts/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { mockAuditLogs, mockReports } from '../../lib/mockData'
import type { AuditLog, CommunityReport, ReportStatus } from '../../lib/types'

const STATUS_LABEL: Record<ReportStatus, string> = {
  submitted: 'Submitted',
  reviewing: 'Under Review',
  converted_to_incident: 'Converted to Incident',
  resolved: 'Resolved',
}

const STATUS_COLOR: Record<ReportStatus, string> = {
  submitted: 'bg-primary-container',
  reviewing: 'bg-secondary',
  converted_to_incident: 'bg-secondary-container',
  resolved: 'bg-tertiary',
}

const FILTERS: { key: 'all' | ReportStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'reviewing', label: 'Under Review' },
  { key: 'resolved', label: 'Resolved' },
]

export function StudentMyReports() {
  const { profile, demoMode } = useAuth()
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [filter, setFilter] = useState<'all' | ReportStatus>('all')
  const [selected, setSelected] = useState<CommunityReport | null>(null)
  const [timeline, setTimeline] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!profile) return
    if (demoMode) {
      setReports(mockReports.filter((r) => r.reporter_id === profile.id))
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('community_reports')
      .select('*, zone:zones(*)')
      .eq('reporter_id', profile.id)
      .order('created_at', { ascending: false })
    setReports((data as CommunityReport[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    if (!profile || demoMode) return
    const channel = supabase
      .channel('my-reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_reports', filter: `reporter_id=eq.${profile.id}` },
        () => load(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function openTimeline(report: CommunityReport) {
    setSelected(report)
    if (demoMode) {
      setTimeline(mockAuditLogs.filter((l) => l.entity_type === 'community_report' && l.entity_id === report.id))
      return
    }
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'community_report')
      .eq('entity_id', report.id)
      .order('created_at', { ascending: false })
    setTimeline((data as AuditLog[]) ?? [])
  }

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <StudentLayout title="My Reports">
      <div className="flex flex-col w-full px-4 pb-space-xl">
        <div className="flex flex-col gap-space-xs mb-space-lg">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface">My Reports</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-primary-container/30">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Live Sync
              </span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track real-time status and campus security updates on your submissions
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-space-sm mb-space-md">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 border flex items-center gap-1.5 ${
                filter === f.key
                  ? 'bg-primary-container text-on-primary font-semibold shadow-[0_0_14px_rgba(249,115,22,0.45)] border-primary-container'
                  : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:text-on-surface'
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-on-surface-variant font-body-sm text-body-sm">Loading your reports...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg text-center">
            No reports yet. Submit a safety report to see it tracked here.
          </div>
        )}

        <div className="flex flex-col gap-space-md">
          {filtered.map((r) => (
            <article
              key={r.id}
              onClick={() => openTimeline(r)}
              className="relative overflow-hidden rounded-xl bg-surface-container-low border border-surface-container-high shadow-sm flex flex-col cursor-pointer hover:border-primary-container/40 transition-transform active:scale-[0.99]"
            >
              <div className={`h-1 w-full ${STATUS_COLOR[r.status]}`} />
              <div className="p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-surface-container-highest text-primary font-medium tracking-wide uppercase border border-outline-variant/30">
                      {r.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/25 text-secondary border border-secondary/40">
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">
                    {r.title}
                  </h2>
                  <div className="flex items-center gap-1 text-on-surface-variant mt-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary-container">location_on</span>
                    <span className="font-body-sm text-body-sm truncate">{r.zone?.name ?? 'Unspecified zone'}</span>
                  </div>
                </div>
                <div className="mt-space-xs pt-space-sm bg-surface-container/60 border-t border-surface-container-high -mx-space-md px-space-md -mb-space-md pb-space-md flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
                    <span className="font-label-sm text-label-sm">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary-container hover:text-primary transition-colors">
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Timeline</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-surface-container-lowest/85 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full bg-surface-container-low border-t border-primary-container/30 rounded-t-2xl p-space-lg shadow-2xl flex flex-col max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-space-md" />
            <div className="flex items-center justify-between pb-space-sm">
              <div>
                <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wider uppercase">
                  Audit Trail
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">{selected.title}</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface"
                onClick={() => setSelected(null)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-space-md relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
              <div className="relative flex flex-col gap-0.5">
                <span className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-primary-container ring-4 ring-surface-container-low" />
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Status: {STATUS_LABEL[selected.status]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Priority: {selected.priority}
                </span>
              </div>
              {timeline.length === 0 && (
                <span className="font-label-sm text-label-sm text-outline">
                  No additional audit entries yet — your report is queued for dispatcher review.
                </span>
              )}
              {timeline.map((t) => (
                <div key={t.id} className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-outline ring-4 ring-surface-container-low" />
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {t.action.replace(/_/g, ' ')}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}
