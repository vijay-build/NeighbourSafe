import type {
  AuditLog,
  CommunityReport,
  Incident,
  IncidentAction,
  Profile,
  Role,
  Zone,
} from './types'

export const MOCK_CAMPUS_ID = 'demo-campus-1'

export const mockZones: Zone[] = [
  { id: 'zone-academic', campus_id: MOCK_CAMPUS_ID, name: 'Academic Block', zone_type: 'public', description: '4 lecture theatres', latitude: 42.3605, longitude: -71.0595, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-library', campus_id: MOCK_CAMPUS_ID, name: 'Library', zone_type: 'public', description: 'Main campus library', latitude: 42.361, longitude: -71.058, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-parking2', campus_id: MOCK_CAMPUS_ID, name: 'Parking Gate 2', zone_type: 'controlled', description: 'Boom barrier, RFID sensor', latitude: 42.3598, longitude: -71.057, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-hostel', campus_id: MOCK_CAMPUS_ID, name: 'Hostel Entrance', zone_type: 'controlled', description: 'Residential wings A-F', latitude: 42.359, longitude: -71.06, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-lab', campus_id: MOCK_CAMPUS_ID, name: 'Laboratory', zone_type: 'restricted', description: 'STEM labs', latitude: 42.3615, longitude: -71.0575, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-exam', campus_id: MOCK_CAMPUS_ID, name: 'Exam Store', zone_type: 'restricted', description: 'Sealed archive gates', latitude: 42.3608, longitude: -71.0568, is_active: true, created_at: new Date().toISOString() },
  { id: 'zone-server', campus_id: MOCK_CAMPUS_ID, name: 'Server Room', zone_type: 'sensitive', description: 'HVAC + core fibres', latitude: 42.3612, longitude: -71.056, is_active: true, created_at: new Date().toISOString() },
]

function zoneById(id: string) {
  return mockZones.find((z) => z.id === id)
}

export const mockZonesStore: Zone[] = mockZones

export const mockReports: CommunityReport[] = [
  {
    id: 'report-1',
    reporter_id: 'profile-student-demo',
    campus_id: MOCK_CAMPUS_ID,
    zone_id: 'zone-exam',
    category: 'unusual_activity',
    title: 'Unattended equipment bag near Exam Store corridor',
    description: 'Black canvas duffel bag observed resting against radiator for roughly 45 mins.',
    latitude: null,
    longitude: null,
    image_path: null,
    status: 'reviewing',
    priority: 'attention',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    zone: zoneById('zone-exam'),
  },
  {
    id: 'report-2',
    reporter_id: 'profile-student-demo',
    campus_id: MOCK_CAMPUS_ID,
    zone_id: 'zone-library',
    category: 'infrastructure_hazard',
    title: 'Pathway lamppost #4 unlit behind Library',
    description: 'Lamppost has been dark for two nights along the east pathway.',
    latitude: null,
    longitude: null,
    image_path: null,
    status: 'submitted',
    priority: 'normal',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    zone: zoneById('zone-library'),
  },
  {
    id: 'report-3',
    reporter_id: 'profile-student-demo',
    campus_id: MOCK_CAMPUS_ID,
    zone_id: 'zone-hostel',
    category: 'security_concern',
    title: 'Hostel Block B rear exit door latch stuck open',
    description: 'Fire exit door at Wing B will not latch, stays ajar.',
    latitude: null,
    longitude: null,
    image_path: null,
    status: 'resolved',
    priority: 'normal',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    zone: zoneById('zone-hostel'),
  },
]

export const mockIncidents: Incident[] = [
  {
    id: 'incident-1',
    incident_number: 'NS-INC-0024',
    campus_id: MOCK_CAMPUS_ID,
    zone_id: 'zone-exam',
    title: 'After-Hours Activity in Exam Store',
    description:
      'Unscheduled interior movement detected past perimeter threshold sensor. Security doors remained locked.',
    source: 'cctv_simulation',
    priority: 'high',
    status: 'open',
    ai_summary: 'After-Hours Activity',
    ai_reasoning:
      'Activity occurred in a restricted zone outside expected operating hours with no scheduled access. Human verification required.',
    confidence: 0.942,
    created_by: null,
    assigned_to: null,
    detected_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    acknowledged_at: null,
    dispatched_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    zone: zoneById('zone-exam'),
  },
  {
    id: 'incident-2',
    incident_number: 'NS-INC-0025',
    campus_id: MOCK_CAMPUS_ID,
    zone_id: 'zone-server',
    title: 'Restricted Area Activity',
    description:
      'Unexpected motion detected beyond secondary card-swipe threshold outside authorized maintenance windows.',
    source: 'cctv_simulation',
    priority: 'critical',
    status: 'open',
    ai_summary: 'Restricted Area Activity',
    ai_reasoning: 'Sensitive infrastructure zone triggers immediate human verification regardless of time window.',
    confidence: 0.97,
    created_by: null,
    assigned_to: null,
    detected_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    acknowledged_at: null,
    dispatched_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    zone: zoneById('zone-server'),
  },
]

export const mockIncidentActions: Record<string, IncidentAction[]> = {
  'incident-1': [
    {
      id: 'action-1',
      incident_id: 'incident-1',
      user_id: null,
      action: 'created',
      notes: 'Synthetic CCTV event injected via Simulate Event.',
      created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    },
  ],
  'incident-2': [
    {
      id: 'action-2',
      incident_id: 'incident-2',
      user_id: null,
      action: 'created',
      notes: 'Synthetic CCTV event injected via Simulate Event.',
      created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
  ],
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    user_id: null,
    action: 'incident_created',
    entity_type: 'incident',
    entity_id: 'incident-1',
    metadata: { source: 'cctv_simulation' },
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-2',
    user_id: null,
    action: 'incident_created',
    entity_type: 'incident',
    entity_id: 'incident-2',
    metadata: { source: 'cctv_simulation' },
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-3',
    user_id: null,
    action: 'report_created',
    entity_type: 'community_report',
    entity_id: 'report-1',
    metadata: { title: mockReports[0].title },
    created_at: mockReports[0].created_at,
  },
]

let reportSeq = mockReports.length
let incidentSeq = mockIncidents.length
let actionSeq = 100
let auditSeq = 100

export function addMockReport(report: Omit<CommunityReport, 'id' | 'created_at' | 'updated_at' | 'zone'>) {
  reportSeq += 1
  const zone = report.zone_id ? zoneById(report.zone_id) : undefined
  const full: CommunityReport = {
    ...report,
    id: `report-${reportSeq}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    zone,
  }
  mockReports.unshift(full)
  return full
}

export function updateMockReport(id: string, patch: Partial<CommunityReport>) {
  const idx = mockReports.findIndex((r) => r.id === id)
  if (idx === -1) return
  mockReports[idx] = { ...mockReports[idx], ...patch, updated_at: new Date().toISOString() }
  return mockReports[idx]
}

export function addMockIncident(
  incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'zone' | 'incident_number'> & { incident_number?: string },
) {
  incidentSeq += 1
  const zone = incident.zone_id ? zoneById(incident.zone_id) : undefined
  const full: Incident = {
    ...incident,
    id: `incident-${incidentSeq}`,
    incident_number: incident.incident_number ?? `NS-INC-${1000 + incidentSeq}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    zone,
  }
  mockIncidents.unshift(full)
  mockIncidentActions[full.id] = []
  return full
}

export function updateMockIncident(id: string, patch: Partial<Incident>) {
  const idx = mockIncidents.findIndex((i) => i.id === id)
  if (idx === -1) return
  mockIncidents[idx] = { ...mockIncidents[idx], ...patch, updated_at: new Date().toISOString() }
  return mockIncidents[idx]
}

export function addMockIncidentAction(incidentId: string, action: IncidentAction['action'], notes?: string | null) {
  actionSeq += 1
  const entry: IncidentAction = {
    id: `action-${actionSeq}`,
    incident_id: incidentId,
    user_id: null,
    action,
    notes: notes ?? null,
    created_at: new Date().toISOString(),
  }
  if (!mockIncidentActions[incidentId]) mockIncidentActions[incidentId] = []
  mockIncidentActions[incidentId].unshift(entry)
  return entry
}

export function addMockAuditLog(action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
  auditSeq += 1
  const entry: AuditLog = {
    id: `audit-${auditSeq}`,
    user_id: null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata ?? null,
    created_at: new Date().toISOString(),
  }
  mockAuditLogs.unshift(entry)
  return entry
}

export function addMockZone(name: string, zoneType: Zone['zone_type']) {
  const zone: Zone = {
    id: `zone-${Date.now()}`,
    campus_id: MOCK_CAMPUS_ID,
    name,
    zone_type: zoneType,
    description: null,
    latitude: null,
    longitude: null,
    is_active: true,
    created_at: new Date().toISOString(),
  }
  mockZones.push(zone)
  return zone
}

export function toggleMockZoneActive(id: string) {
  const zone = mockZones.find((z) => z.id === id)
  if (zone) zone.is_active = !zone.is_active
  return zone
}

export function mockProfile(role: Role): Profile {
  const names: Record<Role, string> = {
    student: 'Sarah Anderson',
    security: 'Ofc. Marcus Vance',
    admin: 'Dana Whitfield',
  }
  return {
    id: `profile-${role}-demo`,
    auth_user_id: `auth-${role}-demo`,
    full_name: names[role],
    email: `${role}@demouni.edu`,
    role,
    campus_id: MOCK_CAMPUS_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
