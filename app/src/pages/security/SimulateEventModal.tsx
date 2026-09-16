import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { evaluateContext } from '../../lib/contextEngine'
import { useAuth } from '../../contexts/AuthContext'
import { addMockAuditLog, addMockIncident, addMockIncidentAction } from '../../lib/mockData'
import type { Zone } from '../../lib/types'

const PRESETS = [
  {
    key: 'breach',
    title: 'Restricted Area After-Hours Breach',
    zoneName: 'Exam Store',
    description:
      'Silhouette movement detected across restricted threshold. Card reader ledger empty; no corresponding badge swipe registered.',
    hour: 23,
    expectedActivity: false,
  },
  {
    key: 'package',
    title: 'Unattended Package / Perimeter Anomaly',
    zoneName: 'Academic Block',
    description: 'Static object dwell time alert (>15m) alongside pedestrian pathway.',
    hour: 14,
    expectedActivity: true,
  },
  {
    key: 'server',
    title: 'Server Core Thermal & Access Spike',
    zoneName: 'Server Room',
    description: 'Multi-sensor thermal rise (+14°C delta) paired with unauthenticated biometric keypad reject.',
    hour: 3,
    expectedActivity: false,
  },
]

export function SimulateEventModal({
  zones,
  campusId,
  onClose,
  onCreated,
}: {
  zones: Zone[]
  campusId: string
  onClose: () => void
  onCreated: () => void
}) {
  const { profile, demoMode } = useAuth()
  const [presetKey, setPresetKey] = useState(PRESETS[0].key)
  const [submitting, setSubmitting] = useState(false)

  async function trigger() {
    const preset = PRESETS.find((p) => p.key === presetKey)!
    const zone = zones.find((z) => z.name === preset.zoneName) ?? zones[0]
    if (!zone) return
    setSubmitting(true)
    try {
      const result = evaluateContext({
        zoneType: zone.zone_type,
        hour: preset.hour,
        expectedActivity: preset.expectedActivity,
        source: 'cctv_simulation',
      })

      const baseIncident = {
        campus_id: campusId,
        zone_id: zone.id,
        title: preset.title,
        description: preset.description,
        source: 'cctv_simulation' as const,
        priority: result.priority,
        status: 'open' as const,
        ai_summary: preset.title,
        ai_reasoning: result.reasoning,
        confidence: result.confidence,
        created_by: profile?.id ?? null,
        assigned_to: null,
        detected_at: new Date().toISOString(),
        acknowledged_at: null,
        dispatched_at: null,
        resolved_at: null,
      }

      if (demoMode) {
        const incident = addMockIncident(baseIncident)
        addMockIncidentAction(incident.id, 'created', 'Synthetic CCTV event injected via Simulate Event.')
        addMockAuditLog('incident_created', 'incident', incident.id, { source: 'cctv_simulation', preset: preset.key })
        onCreated()
        onClose()
        return
      }

      const incidentNumber = `NS-INC-${Math.floor(1000 + Math.random() * 9000)}`
      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({ ...baseIncident, incident_number: incidentNumber })
        .select()
        .single()
      if (error) throw error

      await supabase.from('incident_actions').insert({
        incident_id: incident.id,
        user_id: profile?.id ?? null,
        action: 'created',
        notes: 'Synthetic CCTV event injected via Simulate Event.',
      })

      await supabase.from('audit_logs').insert({
        user_id: profile?.id ?? null,
        action: 'incident_created',
        entity_type: 'incident',
        entity_id: incident.id,
        metadata: { source: 'cctv_simulation', preset: preset.key },
      })

      onCreated()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-container-lowest/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-surface-container-low rounded border border-outline-variant/50 shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary to-primary-container" />
        <div className="px-space-lg pt-space-lg pb-space-md bg-surface-container flex items-start justify-between border-b border-outline-variant/30">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              Simulate Campus Event
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Trigger a synthetic CCTV scenario. The context engine evaluates zone, time, and expected activity to set
              priority automatically.
            </p>
          </div>
          <button
            className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant flex items-center justify-center border border-outline-variant/30"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-space-sm">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPresetKey(p.key)}
              className={`p-space-md rounded text-left border transition-all ${
                presetKey === p.key
                  ? 'bg-surface-container-high border-primary/60 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'bg-surface-container border-outline-variant/30 hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">{p.title}</span>
                <span className="font-label-sm text-label-sm text-outline uppercase">{p.zoneName}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{p.description}</p>
            </button>
          ))}
        </div>

        <div className="px-space-lg py-space-md bg-surface-container border-t border-outline-variant/30 flex items-center justify-end gap-space-md">
          <button
            className="px-space-md py-1.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant font-label-md text-label-md border border-outline-variant/30"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-space-lg py-1.5 rounded bg-primary-container hover:bg-secondary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-space-sm shadow-[0_0_22px_rgba(249,115,22,0.45)] transition-all disabled:opacity-60"
            onClick={trigger}
            disabled={submitting}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">{submitting ? 'sync' : 'play_circle'}</span>
            <span>{submitting ? 'Injecting...' : 'Trigger Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
