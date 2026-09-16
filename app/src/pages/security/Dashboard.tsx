import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { mockIncidents, mockReports, mockZones } from '../../lib/mockData'
import { SimulateEventModal } from './SimulateEventModal'
import type { Incident, Priority, Zone } from '../../lib/types'

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, attention: 2, normal: 3 }

const PRIORITY_STYLE: Record<Priority, { border: string; text: string; bg: string; label: string }> = {
  critical: { border: 'border-error/50', text: 'text-error', bg: 'bg-error', label: 'CRITICAL' },
  high: { border: 'border-secondary/40', text: 'text-secondary', bg: 'bg-secondary', label: 'HIGH' },
  attention: { border: 'border-outline-variant/40', text: 'text-secondary-container', bg: 'bg-secondary-container', label: 'ATTENTION' },
  normal: { border: 'border-outline-variant/40', text: 'text-on-surface-variant', bg: 'bg-outline-variant', label: 'NORMAL' },
}

export function SecurityDashboard() {
  const { profile, demoMode } = useAuth()
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [reportCount, setReportCount] = useState(0)
  const [zones, setZones] = useState<Zone[]>([])
  const [showSimulate, setShowSimulate] = useState(false)

  async function loadIncidents() {
    if (!profile?.campus_id) return
    if (demoMode) {
      setIncidents([...mockIncidents].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]))
      return
    }
    const { data } = await supabase
      .from('incidents')
      .select('*, zone:zones(*)')
      .eq('campus_id', profile.campus_id)
      .order('created_at', { ascending: false })
    const sorted = ((data as Incident[]) ?? []).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    setIncidents(sorted)
  }

  async function loadReportCount() {
    if (!profile?.campus_id) return
    if (demoMode) {
      setReportCount(mockReports.length)
      return
    }
    const { count } = await supabase
      .from('community_reports')
      .select('id', { count: 'exact', head: true })
      .eq('campus_id', profile.campus_id)
    setReportCount(count ?? 0)
  }

  useEffect(() => {
    if (!profile?.campus_id) return
    loadIncidents()
    loadReportCount()

    if (demoMode) {
      setZones(mockZones)
      return
    }

    supabase
      .from('zones')
      .select('*')
      .eq('campus_id', profile.campus_id)
      .then(({ data }) => setZones((data as Zone[]) ?? []))

    const channel = supabase
      .channel('security-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => loadIncidents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reports' }, () => loadReportCount())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, demoMode])

  const active = incidents.filter((i) => i.status !== 'resolved')
  const critical = active.filter((i) => i.priority === 'critical')
  const high = active.filter((i) => i.priority === 'high')

  return (
    <SecurityLayout onSimulate={() => setShowSimulate(true)}>
      <div className="flex flex-col w-full gap-space-lg pb-space-xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md pt-space-xs">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Security Command</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Monitor incidents in real time and focus operational attention on high-priority signals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <StatCard label="Active Incidents" value={active.length} icon="notifications_active" accent="bg-primary-container" />
          <StatCard label="Critical Priority" value={critical.length} icon="fmd_bad" accent="bg-error" tone="text-error" />
          <StatCard label="High Priority" value={high.length} icon="priority_high" accent="bg-secondary" tone="text-secondary" />
          <StatCard label="Community Reports" value={reportCount} icon="groups" accent="bg-secondary-container" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-sm">
            <div className="rounded-xl bg-surface-container-low border border-outline-variant/50 overflow-hidden shadow-xl p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">satellite_alt</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Zone Status Overview</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-space-sm">
                {zones.map((z) => {
                  const zoneIncidents = active.filter((i) => i.zone_id === z.id)
                  const worst = zoneIncidents.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])[0]
                  return (
                    <div
                      key={z.id}
                      className={`rounded-lg p-space-sm border ${
                        worst ? PRIORITY_STYLE[worst.priority].border : 'border-outline-variant/30'
                      } bg-surface-container-lowest flex flex-col gap-1`}
                    >
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{z.name}</span>
                      <span className="font-label-sm text-label-sm text-outline uppercase">{z.zone_type}</span>
                      <span
                        className={`font-label-sm text-label-sm font-semibold uppercase ${
                          worst ? PRIORITY_STYLE[worst.priority].text : 'text-tertiary'
                        }`}
                      >
                        {worst ? PRIORITY_STYLE[worst.priority].label : 'Secure'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-on-surface">Active Operational Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-error-container border border-error/50 text-error font-code-xs text-code-xs font-semibold">
                  {active.length} active
                </span>
              </div>
            </div>

            {active.length === 0 && (
              <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-space-lg text-center text-on-surface-variant font-body-sm text-body-sm">
                No active incidents. Campus is secure.
              </div>
            )}

            {active.map((inc) => {
              const style = PRIORITY_STYLE[inc.priority]
              return (
                <div
                  key={inc.id}
                  onClick={() => navigate(`/security/incidents/${inc.id}`)}
                  className={`rounded-xl bg-surface-container-low border ${style.border} p-space-md shadow-md flex flex-col gap-space-sm relative overflow-hidden cursor-pointer hover:brightness-110 transition-all`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${style.bg}`} />
                  <div className="flex items-center justify-between gap-space-sm flex-wrap">
                    <span className={`px-2 py-0.5 rounded ${style.bg} text-white font-code-xs text-code-xs font-bold uppercase tracking-wider`}>
                      {style.label}
                    </span>
                    <span className="font-code-xs text-code-xs text-outline">
                      {new Date(inc.detected_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface leading-snug">{inc.title}</h2>
                    <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-error">location_on</span>
                      <span className="font-medium text-on-surface">{inc.zone?.name ?? 'Unassigned zone'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-code-xs text-code-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface-variant">
                      Source: {inc.source.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface-variant">
                      Status: {inc.status}
                    </span>
                  </div>
                  {inc.ai_reasoning && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 p-2.5 rounded-lg leading-relaxed">
                      {inc.ai_reasoning}
                    </p>
                  )}
                </div>
              )
            })}

            <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant/40 flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">shield_with_heart</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-tight">
                  Ethical AI Mandate Active
                </span>
                <p className="font-code-xs text-code-xs text-outline leading-tight">
                  AI detects and prioritises anomalies. All security actions require decisive human authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSimulate && profile?.campus_id && (
        <SimulateEventModal
          zones={zones}
          campusId={profile.campus_id}
          onClose={() => setShowSimulate(false)}
          onCreated={loadIncidents}
        />
      )}
    </SecurityLayout>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
  tone,
}: {
  label: string
  value: number
  icon: string
  accent: string
  tone?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/40 p-space-md shadow-md flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</span>
          <span className={`font-display-xl text-[32px] font-bold leading-none mt-1 ${tone ?? 'text-on-surface'}`}>
            {value}
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div className={`absolute left-0 bottom-0 top-0 w-1 ${accent}`} />
    </div>
  )
}
