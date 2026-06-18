-- Seed data for Nomichi Trip Desk

insert into trips (name, destination, start_date, end_date, price_incl_gst, total_seats, seats_left, status, description) values
(
  'Spiti Valley Winter Drive',
  'Spiti Valley, Himachal Pradesh',
  '2026-01-15',
  '2026-01-22',
  42000,
  12,
  8,
  'open',
  'A slow winter drive through snow-clad Spiti villages, monasteries, and high passes.'
),
(
  'Coorg Monsoon Retreat',
  'Coorg, Karnataka',
  '2026-08-03',
  '2026-08-06',
  18500,
  10,
  5,
  'open',
  'Coffee estates, misty hills, and quiet trails during the monsoon season.'
),
(
  'Rann of Kutch Salt Festival',
  'Kutch, Gujarat',
  '2026-11-20',
  '2026-11-25',
  28000,
  14,
  14,
  'open',
  'White salt desert, folk music, and craft villages under full moon skies.'
),
(
  'Zanskar Frozen River Trek',
  'Zanskar, Ladakh',
  '2026-02-10',
  '2026-02-18',
  45000,
  8,
  0,
  'closed',
  'Walk the frozen Chadar trail through deep gorges and remote villages.'
);

insert into leads (name, phone, email, trip_id, group_type, preferred_month, vibe_note, status) values
(
  'Priya Sharma',
  '9876543210',
  'priya.sharma@gmail.com',
  (select id from trips where name = 'Spiti Valley Winter Drive'),
  'solo',
  'January',
  'want to disconnect from city life',
  'NEW'
),
(
  'Arjun Mehta',
  '9823456789',
  'arjun.mehta@outlook.com',
  (select id from trips where name = 'Coorg Monsoon Retreat'),
  'friends',
  'August',
  'planning a reunion trip with college friends',
  'CONTACTED'
),
(
  'Ananya Reddy',
  '9765432108',
  'ananya.reddy@gmail.com',
  (select id from trips where name = 'Rann of Kutch Salt Festival'),
  'couple',
  'November',
  'first trip with my partner',
  'QUALIFIED'
),
(
  'Rahul Kapoor',
  '9654321098',
  'rahul.kapoor@yahoo.com',
  (select id from trips where name = 'Spiti Valley Winter Drive'),
  'family',
  'January',
  'looking for a family-friendly winter experience',
  'VIBE CHECK SENT'
),
(
  'Meera Iyer',
  '9543210987',
  'meera.iyer@gmail.com',
  (select id from trips where name = 'Coorg Monsoon Retreat'),
  'couple',
  'August',
  'want a quiet retreat away from work stress',
  'CONFIRMED'
),
(
  'Vikram Singh',
  '9432109876',
  'vikram.singh@gmail.com',
  (select id from trips where name = 'Zanskar Frozen River Trek'),
  'solo',
  'February',
  'interested in challenging treks and remote landscapes',
  'NOT A FIT'
),
(
  'Kavya Nair',
  '9321098765',
  'kavya.nair@gmail.com',
  (select id from trips where name = 'Rann of Kutch Salt Festival'),
  'friends',
  'November',
  'group of four looking for a cultural experience',
  'NEW'
),
(
  'Sanjay Patel',
  '9210987654',
  'sanjay.patel@gmail.com',
  (select id from trips where name = 'Spiti Valley Winter Drive'),
  'family',
  'January',
  'travelling with two kids, need comfortable pacing',
  'CONTACTED'
);
