alter table submissions
  drop column if exists datum,
  add column if not exists onderwerp text;
