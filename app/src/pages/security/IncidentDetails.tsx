import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { addMockAuditLog, addMockIncidentAction, mockIncidentActions, mockIncidents, updateMockIncident } from '../../lib/mockData'
import type { Incident, IncidentAction } from '../../lib/types'

export function IncidentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, demoMode } = useAuth()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [actions, setActions] = useState<IncidentAction[]>([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!id) return
    if (demoMode) {
      setIncident(mockIncidents.find((i) => i.id === id) ?? null)
      setActions(mockIncidentActions[id] ?? [])
      return
    }
    const { data: inc } = await supabase.from('incidents').select('*, zone:zones(*)').eq('id', id).single()
    setIncident(inc as Incident)
    const { data: acts } = await supabase
      .from('incident_actions')
      .select('*')
      .eq('incident_id', id)
      .order('created_at', { ascending: false })
    setActions((acts as IncidentAction[]) ?? [])
  }

  useEffect(() => {
    load()
    if (!id || demoMode) return
    const channel = supabase
      .channel(`incident-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `id=eq.${id}` }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, demoMode])

  async function runAction(action: 'acknowledged' | 'dispatched' | 'resolved', notes?: string) {
    if (!incident) return
    setBusy(true)
    try {
      const timestampField =
        action === 'acknowledged' ? 'acknowledged_at' : action === 'dispatched' ? 'dispatched_at' : 'resolved_at'

      if (demoMode) {
        updateMockIncident(incident.id, { status: action, [timestampField]: new Date().toISOString() })
        addMockIncidentAction(incident.id, action, notes ?? null)
        addMockAuditLog(`incident_${action}`, 'incident', incident.id, { incident_number: incident.incident_number })
        await load()
        return
      }

      const { error } = await supabase
        .from('incidents')
        .update({ status: action, [timestampField]: new Date().toISOString() })
        .eq('id', incident.id)
      if (error) throw error

      await supabase.from('incident_actions').insert({
        incident_id: incident.id,
        user_id: profile?.id ?? null,
        action,
        notes: notes ?? null,
      })

      await supabase.from('audit_logs').insert({
        user_id: profile?.id ?? null,
        action: `incident_${action}`,
        entity_type: 'incident',
        entity_id: incident.id,
        metadata: { incident_number: incident.incident_number },
      })

      await load()
    } finally {
      setBusy(false)
    }
  }

  async function addNote() {
    if (!note.trim() || !incident) return
    const action = incident.status === 'resolved' ? 'resolved' : incident.status === 'dispatched' ? 'dispatched' : 'acknowledged'
    if (demoMode) {
      addMockIncidentAction(incident.id, action, note.trim())
      setNote('')
      await load()
      return
    }
    await supabase.from('incident_actions').insert({
      incident_id: incident.id,
      user_id: profile?.id ?? null,
      action,
      notes: note.trim(),
    })
    setNote('')
    await load()
  }

  if (!incident) {
    return (
      <SecurityLayout>
        <div className="py-space-xl text-center text-on-surface-variant">Loading incident...</div>
      </SecurityLayout>
    )
  }

  return (
    <SecurityLayout>
      <div className="flex flex-col gap-space-sm mb-space-lg">
        <button
          onClick={() => navigate('/security')}
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary-container transition-colors font-body-sm text-body-sm self-start"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Live Incidents Queue</span>
        </button>

        <div className="bg-surface-container rounded-xl p-space-lg shadow-md border border-surface-container-high/80 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-label-md text-primary-container font-semibold px-2 py-0.5 rounded bg-surface-container-lowest border border-primary-container/30">
                {incident.incident_number}
              </span>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm uppercase font-medium">
                {incident.priority}
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary-container/30 border border-secondary/40 text-secondary font-label-sm uppercase font-semibold">
                {incident.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold">
              {incident.title}
            </h1>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
                <span className="font-medium">{incident.zone?.name ?? 'Unassigned zone'}</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1 font-label-sm text-outline">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                <span>{new Date(incident.detected_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:self-center">
            <button
              className="h-9 px-space-md rounded bg-surface-container-high border border-primary-container/40 text-primary-fixed hover:bg-surface-variant font-label-md text-label-md font-semibold flex items-center gap-1.5 disabled:opacity-50"
              onClick={() => runAction('acknowledged')}
              disabled={busy || incident.status !== 'open'}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary-container">verified</span>
              <span>{incident.status === 'open' ? 'Acknowledge Incident' : 'Acknowledged'}</span>
            </button>
            <button
              className="h-9 px-space-md rounded bg-primary-container text-white hover:bg-secondary-container font-label-md text-label-md font-semibold flex items-center gap-1.5 disabled:opacity-50"
              onClick={() => runAction('dispatched')}
              disabled={busy || !['acknowledged'].includes(incident.status)}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">directions_run</span>
              <span>{incident.status === 'dispatched' ? 'Dispatched' : 'Dispatch Patrol Unit'}</span>
            </button>
            <button
              className="h-9 px-space-md rounded bg-surface-container-lowest hover:bg-error-container hover:text-on-error-container text-error font-label-md text-label-md flex items-center gap-1.5 border border-error/20 disabled:opacity-50"
              onClick={() => runAction('resolved')}
              disabled={busy || incident.status === 'resolved' || incident.status === 'open'}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{incident.status === 'resolved' ? 'Resolved' : 'Resolve & Log'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg pb-space-xl">
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="bg-surface-container rounded-xl p-space-lg shadow-md border border-surface-container-high/80 flex flex-col gap-space-md">
            <div className="flex items-center justify-between bg-surface-container-high px-space-md py-2 rounded-lg border border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">psychology</span>
                <h2 className="font-headline-sm text-[18px] text-on-surface tracking-tight font-bold">
                  AI Prioritisation &amp; Analytical Context
                </h2>
              </div>
            </div>
            <div className="bg-surface-container-low border-l-4 border-primary-container rounded-r-lg p-space-md flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[20px] flex-shrink-0 mt-0.5">gavel</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider text-primary">
                  Ethical Operating Protocol
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  AI detects anomalies and prioritises response urgency. Final determination requires certified human
                  verification.
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col gap-space-xs border border-surface-container-high/60">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-semibold">
                Synthesized Analytical Rationale
              </span>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                {incident.ai_reasoning ?? 'No AI reasoning recorded for this incident.'}
              </p>
            </div>
            {incident.confidence != null && (
              <div className="bg-surface-container-high rounded-lg p-space-md flex items-center justify-between border border-surface-container-highest">
                <span className="font-headline-sm text-[15px] text-on-surface font-medium">Confidence Score</span>
                <span className="font-telemetry-num text-[26px] text-primary-container font-bold leading-none">
                  {Math.round(incident.confidence * 100)}%
                </span>
              </div>
            )}
            {incident.description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 p-2.5 rounded-lg leading-relaxed">
                {incident.description}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="bg-surface-container rounded-xl p-space-lg shadow-md border border-surface-container-high/80 flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">history</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Verified Incident Audit Log</h2>
              </div>
            </div>
            <div className="relative pl-6 flex flex-col gap-space-md before:absolute before:left-2 before:top-2 before:bottom-3 before:w-0.5 before:bg-surface-variant">
              {actions.length === 0 && (
                <span className="font-label-sm text-label-sm text-outline">No actions logged yet.</span>
              )}
              {actions.map((a) => (
                <div key={a.id} className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary-container ring-4 ring-surface-container" />
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-primary-fixed font-semibold">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium">{a.action.replace(/_/g, ' ')}</p>
                  {a.notes && <span className="font-label-sm text-on-surface-variant">{a.notes}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-space-lg shadow-md border border-surface-container-high/80 flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider">
              Dispatcher Operational Notes
            </span>
            <textarea
              className="w-full bg-surface-container-lowest text-on-surface placeholder-outline font-body-sm text-body-sm p-2.5 rounded-lg border border-surface-container-high focus:outline-none focus:border-primary-container resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add internal security log note or observations regarding this incident..."
              rows={3}
            />
            <button
              className="self-end h-8 px-space-md rounded bg-primary-container hover:bg-secondary-container text-white font-label-md text-label-md flex items-center gap-1.5 font-semibold"
              onClick={addNote}
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">save</span>
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </SecurityLayout>
  )
}
