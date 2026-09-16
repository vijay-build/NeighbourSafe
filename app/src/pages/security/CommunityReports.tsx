import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { evaluateContext } from '../../lib/contextEngine'
import {
  addMockAuditLog,
  addMockIncident,
  addMockIncidentAction,
  mockReports,
  updateMockReport,
} from '../../lib/mockData'
import type { CommunityReport } from '../../lib/types'

export function CommunityReports() {
  const { profile, demoMode } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    if (!profile?.campus_id) return
    if (demoMode) {
      setReports([...mockReports])
      return
    }
    const { data } = await supabase
      .from('community_reports')
      .select('*, zone:zones(*)')
      .eq('campus_id', profile.campus_id)
      .order('created_at', { ascending: false })
    setReports((data as CommunityReport[]) ?? [])
  }

  useEffect(() => {
    load()
    if (!profile?.campus_id || demoMode) return
    const channel = supabase
      .channel('community-reports-security')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reports' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, demoMode])

  async function convertToIncident(report: CommunityReport) {
    setBusyId(report.id)
    try {
      const result = evaluateContext({
        zoneType: report.zone?.zone_type ?? 'public',
        hour: new Date().getHours(),
        expectedActivity: true,
        source: 'community',
      })

      if (demoMode) {
        const incident = addMockIncident({
          campus_id: report.campus_id,
          zone_id: report.zone_id,
          title: report.title,
          description: report.description,
          source: 'community',
          priority: result.priority,
          status: 'open',
          ai_summary: null,
          ai_reasoning: result.reasoning,
          confidence: result.confidence,
          created_by: profile?.id ?? null,
          assigned_to: null,
          detected_at: new Date().toISOString(),
          acknowledged_at: null,
          dispatched_at: null,
          resolved_at: null,
        })
        addMockIncidentAction(incident.id, 'created', `Converted from community report ${report.id}`)
        updateMockReport(report.id, { status: 'converted_to_incident' })
        addMockAuditLog('incident_created', 'incident', incident.id, { from_report: report.id })
        addMockAuditLog('report_converted_to_incident', 'community_report', report.id, { incident_id: incident.id })
        navigate(`/security/incidents/${incident.id}`)
        return
      }

      const incidentNumber = `NS-INC-${Math.floor(1000 + Math.random() * 9000)}`
      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({
          incident_number: incidentNumber,
          campus_id: report.campus_id,
          zone_id: report.zone_id,
          title: report.title,
          description: report.description,
          source: 'community',
          priority: result.priority,
          status: 'open',
          ai_reasoning: result.reasoning,
          confidence: result.confidence,
          source_report_id: report.id,
          created_by: profile?.id ?? null,
        })
        .select()
        .single()
      if (error) throw error

      await supabase.from('incident_actions').insert({
        incident_id: incident.id,
        user_id: profile?.id ?? null,
        action: 'created',
        notes: `Converted from community report ${report.id}`,
      })

      await supabase.from('community_reports').update({ status: 'converted_to_incident' }).eq('id', report.id)

      await supabase.from('audit_logs').insert([
        {
          user_id: profile?.id ?? null,
          action: 'incident_created',
          entity_type: 'incident',
          entity_id: incident.id,
          metadata: { from_report: report.id },
        },
        {
          user_id: profile?.id ?? null,
          action: 'report_converted_to_incident',
          entity_type: 'community_report',
          entity_id: report.id,
          metadata: { incident_id: incident.id },
        },
      ])

      navigate(`/security/incidents/${incident.id}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <SecurityLayout>
      <div className="flex flex-col w-full gap-space-lg pb-space-xl pt-space-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Community Reports</h1>
        <div className="flex flex-col gap-space-sm">
          {reports.length === 0 && (
            <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-space-lg text-center text-on-surface-variant">
              No community reports yet.
            </div>
          )}
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-space-md shadow-sm flex flex-col gap-space-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm uppercase border border-outline-variant/30">
                    {r.category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-label-sm text-outline">{r.zone?.name ?? 'Unspecified'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface-variant font-label-sm uppercase">
                  {r.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{r.title}</h2>
              {r.description && <p className="font-body-sm text-body-sm text-on-surface-variant">{r.description}</p>}
              <div className="flex items-center justify-between pt-space-xs">
                <span className="font-label-sm text-label-sm text-outline">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                <button
                  className="h-8 px-space-md rounded bg-primary-container hover:bg-inverse-primary text-white font-label-md text-label-md font-medium flex items-center gap-1.5 disabled:opacity-50"
                  onClick={() => convertToIncident(r)}
                  disabled={r.status === 'converted_to_incident' || busyId === r.id}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {busyId === r.id ? 'sync' : 'person_add'}
                  </span>
                  <span>{r.status === 'converted_to_incident' ? 'Converted' : 'Create Incident'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SecurityLayout>
  )
}
