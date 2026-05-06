-- Marketing aanvragen: aanvraagformulier + workflow
CREATE TABLE IF NOT EXISTS marketing_aanvragen (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aanvrager_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aanvrager_naam   TEXT NOT NULL,
  zaak             TEXT NOT NULL,
  kanalen          TEXT[] NOT NULL DEFAULT '{}',
  beschrijving     TEXT NOT NULL,
  drukwerk_details TEXT,
  banner_afwerking TEXT,
  opleverdatum     DATE,
  feedback_gewenst BOOLEAN NOT NULL DEFAULT true,
  opmerkingen      TEXT,
  -- Workflow
  status           TEXT NOT NULL DEFAULT 'in_behandeling'
                   CHECK (status IN ('in_behandeling','geaccepteerd','afgewezen')),
  toegewezen_aan   TEXT CHECK (toegewezen_aan IN ('jazzlyn','maxime')),
  voortgang        INTEGER NOT NULL DEFAULT 0 CHECK (voortgang >= 0 AND voortgang <= 100),
  interne_deadline DATE,
  planning_status  TEXT NOT NULL DEFAULT 'uitvoeren'
                   CHECK (planning_status IN ('uitvoeren','feedback_moment','opgeleverd')),
  afwijzing_reden  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE marketing_aanvragen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated alles op marketing_aanvragen" ON marketing_aanvragen
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notities van marketing, zichtbaar voor aanvrager
CREATE TABLE IF NOT EXISTS marketing_notities (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aanvraag_id UUID NOT NULL REFERENCES marketing_aanvragen(id) ON DELETE CASCADE,
  auteur      TEXT NOT NULL DEFAULT 'marketing',
  tekst       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE marketing_notities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated alles op marketing_notities" ON marketing_notities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS marketing_aanvragen_updated_at ON marketing_aanvragen;
CREATE TRIGGER marketing_aanvragen_updated_at
  BEFORE UPDATE ON marketing_aanvragen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
