-- Nomichi Trip Desk schema

-- profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  role text check (role in ('admin','associate')) default 'associate',
  created_at timestamptz default now()
);

-- trips
create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  price_incl_gst numeric not null,
  total_seats int not null,
  seats_left int not null,
  status text check (status in ('open','closed')) default 'open',
  description text,
  created_at timestamptz default now()
);

-- leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  trip_id uuid references trips(id),
  group_type text check (group_type in ('solo','friends','couple','family')),
  preferred_month text,
  vibe_note text,
  status text check (status in ('NEW','CONTACTED','QUALIFIED','VIBE CHECK SENT','CONFIRMED','NOT A FIT')) default 'NEW',
  owner_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- call_logs
create table call_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  note text not null,
  next_action text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- activity_timeline
create table activity_timeline (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  action text not null,
  detail text,
  performed_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security

alter table leads enable row level security;
alter table call_logs enable row level security;
alter table activity_timeline enable row level security;
alter table trips enable row level security;

-- Leads: authenticated users can read all leads
create policy "Authenticated users can read all leads"
  on leads for select
  to authenticated
  using (true);

-- Leads: owner, admin, or any authenticated team member can update
create policy "Authenticated users can update leads"
  on leads for update
  to authenticated
  using (true);

-- call_logs: authenticated users can read all
create policy "Authenticated users can read call logs"
  on call_logs for select
  to authenticated
  using (true);

-- call_logs: authenticated users can insert their own
create policy "Authenticated users can insert call logs"
  on call_logs for insert
  to authenticated
  with check (created_by = auth.uid());

-- activity_timeline: authenticated users can read
create policy "Authenticated users can read activity timeline"
  on activity_timeline for select
  to authenticated
  using (true);

-- activity_timeline: authenticated users can insert
create policy "Authenticated users can insert activity timeline"
  on activity_timeline for insert
  to authenticated
  with check (performed_by = auth.uid());

-- trips: anyone can read open trips (public page)
create policy "Anyone can read open trips"
  on trips for select
  to anon, authenticated
  using (status = 'open');

-- trips: authenticated users can read all trips
create policy "Authenticated users can read all trips"
  on trips for select
  to authenticated
  using (true);

-- trips: authenticated users can insert
create policy "Authenticated users can insert trips"
  on trips for insert
  to authenticated
  with check (true);

-- trips: authenticated users can update
create policy "Authenticated users can update trips"
  on trips for update
  to authenticated
  using (true);

-- trips: authenticated users can delete
create policy "Authenticated users can delete trips"
  on trips for delete
  to authenticated
  using (true);
