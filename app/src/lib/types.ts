export type Role = 'student' | 'security' | 'admin'

export type ZoneType = 'public' | 'controlled' | 'restricted' | 'sensitive'

export type ReportCategory =
  | 'unusual_activity'
  | 'infrastructure_hazard'
  | 'unsafe_location'
  | 'security_concern'
  | 'environmental_issue'

export type ReportStatus = 'submitted' | 'reviewing' | 'converted_to_incident' | 'resolved'

export type Priority = 'normal' | 'attention' | 'high' | 'critical'

export type IncidentSource = 'community' | 'cctv_simulation' | 'manual'

export type IncidentStatus = 'open' | 'acknowledged' | 'dispatched' | 'resolved'

export interface Profile {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  role: Role
  campus_id: string | null
  created_at: string
  updated_at: string
}

export interface Campus {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface Zone {
  id: string
  campus_id: string
  name: string
  zone_type: ZoneType
  description: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
}

export interface CommunityReport {
  id: string
  reporter_id: string | null
  campus_id: string
  zone_id: string | null
  category: ReportCategory
  title: string
  description: string | null
  latitude: number | null
  longitude: number | null
  image_path: string | null
  status: ReportStatus
  priority: Priority
  created_at: string
  updated_at: string
  zone?: Zone
}

export interface Incident {
  id: string
  incident_number: string
  campus_id: string
  zone_id: string | null
  title: string
  description: string | null
  source: IncidentSource
  priority: Priority
  status: IncidentStatus
  ai_summary: string | null
  ai_reasoning: string | null
  confidence: number | null
  created_by: string | null
  assigned_to: string | null
  detected_at: string
  acknowledged_at: string | null
  dispatched_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  zone?: Zone
}

export interface IncidentAction {
  id: string
  incident_id: string
  user_id: string | null
  action: 'created' | 'acknowledged' | 'dispatched' | 'resolved'
  notes: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown> | null
  created_at: string
}
