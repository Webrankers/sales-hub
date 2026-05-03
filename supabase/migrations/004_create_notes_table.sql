-- Separate notes table — one row per note, multiple per submission
create table if not exists notes (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  tekst         text not null,
  created_at    timestamptz not null default now()
);

create index if not exists notes_submission_id_idx on notes(submission_id);

alter table notes enable row level security;
create policy "service role full access" on notes for all using (true);

-- Clean up the old single-value notes column on submissions
alter table submissions drop column if exists notes;
