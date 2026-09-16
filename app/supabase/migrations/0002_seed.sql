-- Demo seed data for NeighbourSafe
insert into campuses (id, name, address, latitude, longitude)
values ('00000000-0000-0000-0000-000000000001', 'Demo University', '1 Campus Drive', 42.3601, -71.0589)
on conflict (id) do nothing;

insert into zones (id, campus_id, name, zone_type, description, latitude, longitude) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Academic Block', 'public', '4 lecture theatres', 42.3605, -71.0595),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Library', 'public', 'Main campus library', 42.3610, -71.0580),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Parking Gate 2', 'controlled', 'Boom barrier, RFID sensor', 42.3598, -71.0570),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Hostel Entrance', 'controlled', 'Residential wings A-F', 42.3590, -71.0600),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Laboratory', 'restricted', 'STEM labs', 42.3615, -71.0575),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Exam Store', 'restricted', 'Sealed archive gates', 42.3608, -71.0568),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Server Room', 'sensitive', 'HVAC + core fibres', 42.3612, -71.0560)
on conflict (id) do nothing;
