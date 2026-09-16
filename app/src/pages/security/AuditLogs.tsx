import { useEffect, useState } from 'react'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { mockAuditLogs } from '../../lib/mockData'
import type { AuditLog } from '../../lib/types'

export function AuditLogs() {
  const { demoMode } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (demoMode) {
      setLogs(mockAuditLogs)
      setLoading(false)
      return
    }
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLogs((data as AuditLog[]) ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel('audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs((prev) => [payload.new as AuditLog, ...prev])
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <SecurityLayout>
      <div className="flex flex-col w-full gap-space-md pb-space-xl pt-space-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Audit Logs / History</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Immutable ledger of every report, incident, and triage action across the platform.
        </p>

        <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 overflow-hidden">
          <div className="grid grid-cols-[160px_1fr_140px_1fr] gap-space-md px-space-md py-2 bg-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
            <span>Timestamp</span>
            <span>Action</span>
            <span>Entity</span>
            <span>Details</span>
          </div>
          {loading && <div className="p-space-md text-on-surface-variant">Loading audit trail...</div>}
          {!loading && logs.length === 0 && (
            <div className="p-space-md text-on-surface-variant">No audit entries yet.</div>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[160px_1fr_140px_1fr] gap-space-md px-space-md py-2.5 border-t border-outline-variant/20 text-body-sm text-on-surface-variant items-center"
            >
              <span className="font-label-sm text-label-sm text-outline">{new Date(log.created_at).toLocaleString()}</span>
              <span className="text-on-surface font-medium">{log.action.replace(/_/g, ' ')}</span>
              <span className="font-label-sm text-label-sm uppercase">{log.entity_type.replace(/_/g, ' ')}</span>
              <span className="font-label-sm text-label-sm truncate">
                {log.metadata ? JSON.stringify(log.metadata) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SecurityLayout>
  )
}
