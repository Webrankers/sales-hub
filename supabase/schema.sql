-- Sales Hub schema
-- Run this in the Supabase SQL editor

create table if not exists submissions (
  id          uuid primary key default gen_random_uuid(),
  source      text not null check (source in ('holy_moly_breda', 'spinola_breda')),
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  raw_data    jsonb,
  status      text not null default 'actie_ondernemen'
                check (status in ('actie_ondernemen', 'wachten_op_reactie', 'afgewezen', 'afgerond')),
  draft_email text,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();

-- Row Level Security
alter table submissions enable row level security;

-- Allow all operations for authenticated users (salesperson logs in via Supabase Auth)
create policy "authenticated full access"
  on submissions for all
  using (auth.role() = 'authenticated');

-- Allow inserts from service role (webhook uses service key)
create policy "service role insert"
  on submissions for insert
  with check (true);

-- Enable Realtime
alter publication supabase_realtime add table submissions;
