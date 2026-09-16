import { useEffect, useState } from 'react'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { addMockZone, mockZones, toggleMockZoneActive } from '../../lib/mockData'
import type { Zone, ZoneType } from '../../lib/types'

export function Admin() {
  const { profile, demoMode } = useAuth()
  const [zones, setZones] = useState<Zone[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<ZoneType>('public')

  async function load() {
    if (!profile?.campus_id) return
    if (demoMode) {
      setZones([...mockZones].sort((a, b) => a.name.localeCompare(b.name)))
      return
    }
    const { data } = await supabase.from('zones').select('*').eq('campus_id', profile.campus_id).order('name')
    setZones((data as Zone[]) ?? [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, demoMode])

  async function addZone() {
    if (!name.trim() || !profile?.campus_id) return
    if (demoMode) {
      addMockZone(name.trim(), type)
      setName('')
      await load()
      return
    }
    await supabase.from('zones').insert({ campus_id: profile.campus_id, name: name.trim(), zone_type: type })
    setName('')
    await load()
  }

  async function toggleActive(zone: Zone) {
    if (demoMode) {
      toggleMockZoneActive(zone.id)
      await load()
      return
    }
    await supabase.from('zones').update({ is_active: !zone.is_active }).eq('id', zone.id)
    await load()
  }

  return (
    <SecurityLayout>
      <div className="flex flex-col w-full gap-space-lg pb-space-xl pt-space-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Admin / Governance</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage campus zones. Demo data and role governance for Demo University.
        </p>

        <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-space-md flex flex-col gap-space-sm max-w-xl">
          <span className="font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider">
            Add Zone
          </span>
          <div className="flex gap-space-sm">
            <input
              className="flex-1 h-10 px-space-md bg-surface-container text-on-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary-container"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zone name"
            />
            <select
              className="h-10 px-space-md bg-surface-container text-on-surface border border-outline-variant/60 rounded-lg"
              value={type}
              onChange={(e) => setType(e.target.value as ZoneType)}
            >
              <option value="public">Public</option>
              <option value="controlled">Controlled</option>
              <option value="restricted">Restricted</option>
              <option value="sensitive">Sensitive</option>
            </select>
            <button
              className="h-10 px-space-md rounded-lg bg-primary-container text-white font-label-md text-label-md font-semibold"
              onClick={addZone}
              type="button"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 overflow-hidden max-w-xl">
          {zones.map((z) => (
            <div
              key={z.id}
              className="flex items-center justify-between px-space-md py-2.5 border-b border-outline-variant/20 last:border-b-0"
            >
              <div className="flex flex-col">
                <span className="text-on-surface font-medium">{z.name}</span>
                <span className="font-label-sm text-label-sm text-outline uppercase">{z.zone_type}</span>
              </div>
              <button
                onClick={() => toggleActive(z)}
                className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase border ${
                  z.is_active ? 'text-tertiary border-tertiary/40' : 'text-outline border-outline-variant/40'
                }`}
                type="button"
              >
                {z.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </SecurityLayout>
  )
}
