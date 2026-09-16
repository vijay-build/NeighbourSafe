-- NeighbourSafe schema
create extension if not exists "pgcrypto";

create type role as enum ('student', 'security', 'admin');
create type zone_type as enum ('public', 'controlled', 'restricted', 'sensitive');
create type report_category as enum ('unusual_activity', 'infrastructure_hazard', 'unsafe_location', 'security_concern', 'environmental_issue');
create type report_status as enum ('submitted', 'reviewing', 'converted_to_incident', 'resolved');
create type priority as enum ('normal', 'attention', 'high', 'critical');
create type incident_source as enum ('community', 'cctv_simulation', 'manual');
create type incident_status as enum ('open', 'acknowledged', 'dispatched', 'resolved');
create type incident_action_type as enum ('created', 'acknowledged', 'dispatched', 'resolved');

create table campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role role not null default 'student',
  campus_id uuid references campuses(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table zones (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references campuses(id) on delete cascade,
  name text not null,
  zone_type zone_type not null default 'public',
  description text,
  latitude double precision,
  longitude double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  campus_id uuid not null references campuses(id),
  zone_id uuid references zones(id),
  category report_category not null,
  title text not null,
  description text,
  latitude double precision,
  longitude double precision,
  image_path text,
  status report_status not null default 'submitted',
  priority priority not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  incident_number text not null unique,
  campus_id uuid not null references campuses(id),
  zone_id uuid references zones(id),
  title text not null,
  description text,
  source incident_source not null default 'manual',
  priority priority not null default 'normal',
  status incident_status not null default 'open',
  ai_summary text,
  ai_reasoning text,
  confidence numeric,
  source_report_id uuid references community_reports(id),
  created_by uuid references profiles(id),
  assigned_to uuid references profiles(id),
  detected_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  dispatched_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table incident_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  user_id uuid references profiles(id),
  action incident_action_type not null,
  notes text,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_community_reports_reporter on community_reports(reporter_id);
create index idx_community_reports_campus on community_reports(campus_id);
create index idx_incidents_campus on incidents(campus_id);
create index idx_incidents_status on incidents(status);
create index idx_incidents_priority on incidents(priority);
create index idx_incident_actions_incident on incident_actions(incident_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_notifications_profile on notifications(profile_id);

-- Helper: current user's profile role/campus without triggering RLS recursion
create or replace function current_profile_role() returns role
language sql stable security definer set search_path = public as $$
  select role from profiles where auth_user_id = auth.uid()
$$;

create or replace function current_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from profiles where auth_user_id = auth.uid()
$$;

alter table campuses enable row level security;
alter table profiles enable row level security;
alter table zones enable row level security;
alter table community_reports enable row level security;
alter table incidents enable row level security;
alter table incident_actions enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;

-- Campuses & zones: readable by any authenticated user
create policy "campuses readable" on campuses for select using (auth.role() = 'authenticated');
create policy "zones readable" on zones for select using (auth.role() = 'authenticated');
create policy "admin manage campuses" on campuses for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin manage zones" on zones for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- Profiles: user reads/updates own profile; security/admin can read all
create policy "read own profile" on profiles for select using (auth_user_id = auth.uid());
create policy "staff read all profiles" on profiles for select using (current_profile_role() in ('security', 'admin'));
create policy "update own profile" on profiles for update using (auth_user_id = auth.uid());
create policy "insert own profile" on profiles for insert with check (auth_user_id = auth.uid());

-- Community reports
create policy "student create report" on community_reports for insert
  with check (reporter_id = current_profile_id());
create policy "student read own reports" on community_reports for select
  using (reporter_id = current_profile_id());
create policy "staff read all reports" on community_reports for select
  using (current_profile_role() in ('security', 'admin'));
create policy "staff update reports" on community_reports for update
  using (current_profile_role() in ('security', 'admin'));

-- Incidents
create policy "staff read incidents" on incidents for select
  using (current_profile_role() in ('security', 'admin'));
create policy "staff insert incidents" on incidents for insert
  with check (current_profile_role() in ('security', 'admin'));
create policy "staff update incidents" on incidents for update
  using (current_profile_role() in ('security', 'admin'));

-- Incident actions
create policy "staff read incident actions" on incident_actions for select
  using (current_profile_role() in ('security', 'admin'));
create policy "staff create incident actions" on incident_actions for insert
  with check (current_profile_role() in ('security', 'admin'));

-- Audit logs: staff read all; any authenticated user can insert (system writes on their behalf)
create policy "staff read audit logs" on audit_logs for select
  using (current_profile_role() in ('security', 'admin'));
create policy "authenticated insert audit logs" on audit_logs for insert
  with check (auth.role() = 'authenticated');

-- Notifications: user reads/updates own
create policy "read own notifications" on notifications for select
  using (profile_id = current_profile_id());
create policy "update own notifications" on notifications for update
  using (profile_id = current_profile_id());
create policy "staff create notifications" on notifications for insert
  with check (auth.role() = 'authenticated');

-- Storage bucket for report images
insert into storage.buckets (id, name, public) values ('report-images', 'report-images', true)
  on conflict (id) do nothing;

create policy "authenticated upload report images" on storage.objects for insert
  with check (bucket_id = 'report-images' and auth.role() = 'authenticated');
create policy "public read report images" on storage.objects for select
  using (bucket_id = 'report-images');
