import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { SecurityLayout } from '../../layouts/SecurityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { mockIncidents, mockZones } from '../../lib/mockData'
import type { Incident, Priority, Zone } from '../../lib/types'

const ZONE_COLOR: Record<Zone['zone_type'], string> = {
  public: '#4edea3',
  controlled: '#f97316',
  restricted: '#ffb95f',
  sensitive: '#ef4444',
}

const PRIORITY_COLOR: Record<Priority, string> = {
  critical: '#ef4444',
  high: '#f97316',
  attention: '#ffb95f',
  normal: '#94a3b8',
}

const DEFAULT_CENTER: [number, number] = [42.3601, -71.0589]

export function CampusMap() {
  const { profile, demoMode } = useAuth()
  const navigate = useNavigate()
  const [zones, setZones] = useState<Zone[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  async function load() {
    if (!profile?.campus_id) return
    if (demoMode) {
      setZones(mockZones)
      setIncidents(mockIncidents.filter((i) => i.status !== 'resolved'))
      return
    }
    const [{ data: z }, { data: i }] = await Promise.all([
      supabase.from('zones').select('*').eq('campus_id', profile.campus_id),
      supabase
        .from('incidents')
        .select('*, zone:zones(*)')
        .eq('campus_id', profile.campus_id)
        .neq('status', 'resolved'),
    ])
    setZones((z as Zone[]) ?? [])
    setIncidents((i as Incident[]) ?? [])
  }

  useEffect(() => {
    load()
    if (!profile?.campus_id || demoMode) return
    const channel = supabase
      .channel('campus-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  return (
    <SecurityLayout>
      <div className="flex flex-col w-full gap-space-md pb-space-xl pt-space-md h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Campus Map</h1>
          <div className="hidden lg:flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/40 px-space-sm py-1 rounded">
            <span className="font-label-sm text-label-sm text-outline mr-1 uppercase">ZONES:</span>
            {(['public', 'controlled', 'restricted', 'sensitive'] as const).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1"
                style={{ color: ZONE_COLOR[t], borderColor: ZONE_COLOR[t] + '66', border: '1px solid' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ZONE_COLOR[t] }} />
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-outline-variant/40 shadow-xl">
          <MapContainer center={DEFAULT_CENTER} zoom={16} style={{ height: '100%', width: '100%', background: '#06090e' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {zones
              .filter((z) => z.latitude && z.longitude)
              .map((z) => (
                <CircleMarker
                  key={z.id}
                  center={[z.latitude!, z.longitude!]}
                  radius={14}
                  pathOptions={{ color: ZONE_COLOR[z.zone_type], fillColor: ZONE_COLOR[z.zone_type], fillOpacity: 0.35 }}
                >
                  <Popup>
                    <div className="font-semibold">{z.name}</div>
                    <div className="uppercase text-xs">{z.zone_type}</div>
                  </Popup>
                </CircleMarker>
              ))}
            {incidents
              .filter((i) => i.zone?.latitude && i.zone?.longitude)
              .map((i) => (
                <CircleMarker
                  key={i.id}
                  center={[i.zone!.latitude!, i.zone!.longitude!]}
                  radius={9}
                  pathOptions={{ color: PRIORITY_COLOR[i.priority], fillColor: PRIORITY_COLOR[i.priority], fillOpacity: 0.9 }}
                  eventHandlers={{ click: () => navigate(`/security/incidents/${i.id}`) }}
                >
                  <Popup>
                    <div className="font-semibold">{i.incident_number}</div>
                    <div>{i.title}</div>
                    <div className="uppercase text-xs">{i.priority}</div>
                  </Popup>
                </CircleMarker>
              ))}
          </MapContainer>
        </div>
      </div>
    </SecurityLayout>
  )
}
