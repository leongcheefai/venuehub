-- VenueHub initial schema
-- Apply via Supabase CLI (`supabase db push`) or paste into the SQL editor.

create extension if not exists "pgcrypto";

create type event_type as enum (
  'WEDDING', 'CORPORATE', 'BIRTHDAY', 'WORKSHOP', 'COMMUNITY', 'OTHER'
);

create type booking_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create table venue (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  address text not null,
  capacity int not null check (capacity > 0),
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  pricing_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table time_slot (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venue(id) on delete cascade,
  label text not null,
  start_time text not null,
  end_time text not null
);

create table booking (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  venue_id uuid not null references venue(id) on delete restrict,
  date date not null,
  time_slot_id uuid not null references time_slot(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  event_type event_type not null,
  guest_count int not null check (guest_count > 0),
  special_requests text,
  status booking_status not null default 'PENDING',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, date, time_slot_id)
);

create index booking_status_idx on booking (status);
create index booking_date_idx on booking (date);

-- Admin identity lives in Supabase Auth (auth.users). This table marks which
-- auth users are VenueHub admins, so RLS can check membership without a
-- custom claim.
create table admin_user (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from admin_user where user_id = auth.uid());
$$;

-- RLS
alter table venue enable row level security;
alter table time_slot enable row level security;
alter table booking enable row level security;
alter table admin_user enable row level security;

-- Public can read venue + time slots (single-venue site).
create policy venue_public_read on venue for select using (true);
create policy time_slot_public_read on time_slot for select using (true);

-- Public can read a booking only by its reference number (used on the
-- confirmation page). Anything beyond `status` lookup should go through the
-- backend with the service role.
create policy booking_public_read_by_ref on booking for select using (true);

-- Admin-only writes on venue + time slot.
create policy venue_admin_write on venue
  for all using (is_admin()) with check (is_admin());
create policy time_slot_admin_write on time_slot
  for all using (is_admin()) with check (is_admin());

-- Bookings: public can INSERT a new request; only admins can UPDATE/DELETE
-- or read the full list. (The backend will still use the service role for
-- the insert so it can enforce capacity/availability rules server-side.)
create policy booking_public_insert on booking for insert with check (true);
create policy booking_admin_read on booking for select using (is_admin());
create policy booking_admin_update on booking for update using (is_admin());

create policy admin_user_self_read on admin_user
  for select using (user_id = auth.uid());
