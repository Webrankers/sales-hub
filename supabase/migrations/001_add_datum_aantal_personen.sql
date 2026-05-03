-- Voeg datum en aantal_personen toe aan de submissions tabel
alter table submissions
  add column if not exists datum           date,
  add column if not exists aantal_personen integer;
