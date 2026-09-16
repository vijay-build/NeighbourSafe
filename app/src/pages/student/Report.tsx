import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentLayout } from '../../layouts/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { addMockAuditLog, addMockReport, mockZones } from '../../lib/mockData'
import type { ReportCategory, Zone } from '../../lib/types'

const CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'unusual_activity', label: 'Unusual Activity', icon: 'visibility' },
  { value: 'infrastructure_hazard', label: 'Infrastructure Hazard', icon: 'warning' },
  { value: 'unsafe_location', label: 'Unsafe Location', icon: 'explore_off' },
  { value: 'security_concern', label: 'Security Concern', icon: 'security' },
  { value: 'environmental_issue', label: 'Environmental Issue', icon: 'eco' },
]

export function StudentReport() {
  const { profile, demoMode } = useAuth()
  const navigate = useNavigate()
  const [zones, setZones] = useState<Zone[]>([])
  const [category, setCategory] = useState<ReportCategory>('unusual_activity')
  const [zoneId, setZoneId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.campus_id) return
    if (demoMode) {
      const active = mockZones.filter((z) => z.is_active)
      setZones(active)
      if (active.length) setZoneId(active[0].id)
      return
    }
    supabase
      .from('zones')
      .select('*')
      .eq('campus_id', profile.campus_id)
      .eq('is_active', true)
      .then(({ data }) => {
        setZones((data as Zone[]) ?? [])
        if (data && data.length) setZoneId(data[0].id)
      })
  }, [profile, demoMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setError(null)
    if (!title.trim()) {
      setError('Please add a title / brief summary.')
      return
    }
    setSubmitting(true)
    try {
      if (demoMode) {
        const report = addMockReport({
          reporter_id: profile.id,
          campus_id: profile.campus_id ?? '',
          zone_id: zoneId || null,
          category,
          title: title.trim(),
          description: description.trim() || null,
          latitude: null,
          longitude: null,
          image_path: null,
          status: 'submitted',
          priority: 'attention',
        })
        addMockAuditLog('report_created', 'community_report', report.id, { title: report.title, category })
        navigate('/student/my-reports', { state: { justSubmitted: report.id } })
        return
      }

      let imagePath: string | null = null
      if (file) {
        const path = `${profile.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from('report-images').upload(path, file)
        if (uploadError) throw uploadError
        imagePath = path
      }

      const { data: report, error: insertError } = await supabase
        .from('community_reports')
        .insert({
          reporter_id: profile.id,
          campus_id: profile.campus_id,
          zone_id: zoneId || null,
          category,
          title: title.trim(),
          description: description.trim() || null,
          image_path: imagePath,
          status: 'submitted',
          priority: 'attention',
        })
        .select()
        .single()

      if (insertError) throw insertError

      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'report_created',
        entity_type: 'community_report',
        entity_id: report.id,
        metadata: { title: report.title, category },
      })

      navigate('/student/my-reports', { state: { justSubmitted: report.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StudentLayout title="Report a Safety Issue">
      <div className="flex flex-col w-full pb-8">
        <div className="mx-margin mt-space-md mb-space-sm p-space-md bg-surface-container-low border border-outline-variant/40 rounded-xl flex items-center gap-space-md shadow-sm">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                Report a Safety Issue
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 text-secondary tracking-wider uppercase">
                Encrypted
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Direct encrypted submission to Demo University Security Operations Center
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-space-lg px-margin" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-space-xs">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Issue Category
            </label>
            <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
              {CATEGORIES.map((c) => {
                const active = category === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`text-left p-space-md rounded-xl border flex items-center justify-between transition-all ${
                      active
                        ? 'bg-primary-container text-white border-primary-container shadow-[0_0_16px_rgba(249,115,22,0.3)]'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/40 hover:border-outline hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className={`material-symbols-outlined text-[20px] ${active ? 'text-white' : 'text-secondary'}`}>
                        {c.icon}
                      </span>
                      <span className="font-label-md text-label-md font-semibold">{c.label}</span>
                    </div>
                    {active && <span className="material-symbols-outlined text-[16px] text-white">check_circle</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-space-md bg-surface-container-low border border-outline-variant/40 p-space-md rounded-xl shadow-sm">
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                <span>Title / Brief Summary</span>
                <span className="text-secondary font-label-sm text-label-sm">Required</span>
              </label>
              <input
                className="w-full h-11 px-space-md bg-surface-container text-on-surface placeholder:text-outline border border-outline-variant/60 rounded-lg text-body-md font-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container shadow-inner transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flickering lighting near North cycle stand"
                required
              />
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Campus Zone / Location
              </label>
              <select
                className="w-full h-11 px-space-md bg-surface-container border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:border-primary-container"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                className="w-full p-space-md bg-surface-container text-on-surface placeholder:text-outline border border-outline-variant/60 rounded-lg text-body-md font-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container resize-none shadow-inner transition-colors"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context, landmarks, or specific observations..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Photo / Evidence (Optional)
            </span>
            <label className="w-full p-space-lg bg-surface-container-low border border-dashed border-outline-variant/60 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-container/70 hover:bg-surface-container transition-all">
              <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center text-secondary mb-space-sm">
                <span className="material-symbols-outlined text-[24px] text-primary-container">add_a_photo</span>
              </div>
              <div className="flex items-center gap-space-xs text-on-surface font-label-md text-label-md">
                <span className="font-medium">{file ? file.name : 'Attach photo or snapshot (Optional)'}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {error && (
            <div className="text-error font-label-sm text-label-sm bg-error-container/20 border border-error/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            className="w-full h-12 bg-primary-container hover:bg-secondary-container active:scale-[0.99] text-white font-headline-sm text-headline-sm rounded-xl shadow-[0_4px_16px_rgba(249,115,22,0.35)] flex items-center justify-center gap-space-sm transition-all disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            <span className="material-symbols-outlined text-[20px] text-white">
              {submitting ? 'sync' : 'send'}
            </span>
            <span className="font-semibold tracking-wide text-white">
              {submitting ? 'Encrypting & Sending...' : 'Submit Safety Report'}
            </span>
          </button>

          <div className="p-space-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl flex items-start gap-space-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">lock</span>
            <p className="font-body-sm text-body-sm leading-relaxed">
              Your report will be reviewed by authorised campus personnel. In an immediate life-safety emergency, please
              call <span className="text-error font-medium">911</span> or Campus Emergency at{' '}
              <span className="font-label-sm text-label-sm text-secondary underline">ext 4444</span>.
            </p>
          </div>
        </form>
      </div>
    </StudentLayout>
  )
}
