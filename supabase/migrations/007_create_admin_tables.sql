-- Documenten bibliotheek
CREATE TABLE IF NOT EXISTS documenten (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titel        TEXT NOT NULL,
  categorie    TEXT NOT NULL DEFAULT 'overig'
               CHECK (categorie IN ('contract','offerte','belasting','verzekering','overig')),
  omschrijving TEXT,
  link         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE documenten ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven documenten" ON documenten
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Takenlijst
CREATE TABLE IF NOT EXISTS taken (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titel        TEXT NOT NULL,
  omschrijving TEXT,
  deadline     DATE,
  prioriteit   TEXT NOT NULL DEFAULT 'normaal'
               CHECK (prioriteit IN ('laag','normaal','hoog','urgent')),
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','in_behandeling','afgerond')),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE taken ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven taken" ON taken
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contactenboek
CREATE TABLE IF NOT EXISTS contacten (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naam       TEXT NOT NULL,
  bedrijf    TEXT,
  telefoon   TEXT,
  email      TEXT,
  notitie    TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE contacten ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven contacten" ON contacten
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notitieblok (admin_notities om conflict met bestaande notes tabel te vermijden)
CREATE TABLE IF NOT EXISTS admin_notities (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titel      TEXT NOT NULL,
  tekst      TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE admin_notities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven admin_notities" ON admin_notities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
