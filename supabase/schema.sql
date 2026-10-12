-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists public.rsvps (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  email                text not null,
  attending            boolean not null,
  guest_count          int default 1,
  dietary_restrictions text,
  message              text,
  created_at           timestamptz default now(),

  -- The publishable key can insert directly via the Supabase REST API,
  -- bypassing our API route's validation. These constraints keep the data
  -- sane regardless of how a row arrives.
  constraint rsvps_name_len      check (char_length(name) between 1 and 120),
  constraint rsvps_email_len     check (char_length(email) between 3 and 254),
  constraint rsvps_guest_count   check (guest_count between 1 and 10),
  constraint rsvps_dietary_len   check (dietary_restrictions is null or char_length(dietary_restrictions) <= 2000),
  constraint rsvps_message_len   check (message is null or char_length(message) <= 2000)
);

-- Lock the table down, then allow INSERT only for anonymous (publishable key) requests.
alter table public.rsvps enable row level security;

drop policy if exists "Anyone can submit an RSVP" on public.rsvps;
create policy "Anyone can submit an RSVP"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- Table-level privilege for the Data API (RLS above still applies on top of it).
grant insert on public.rsvps to anon;

-- Intentionally NO select/update/delete policies: the guest list stays private.
-- View responses in the Supabase Dashboard → Table Editor (which uses your admin session).
