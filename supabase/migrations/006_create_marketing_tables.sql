-- Content posts for the marketing module
CREATE TABLE IF NOT EXISTS content_posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titel           TEXT NOT NULL,
  platform        TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook')),
  publicatiedatum DATE,
  type            TEXT CHECK (type IN ('foto', 'video', 'reel', 'story')),
  caption         TEXT,
  hashtags        TEXT,
  canva_link      TEXT,
  status          TEXT NOT NULL DEFAULT 'idee'
                  CHECK (status IN ('idee', 'in_productie', 'klaar', 'gepubliceerd')),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven content_posts" ON content_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Hashtag sets for quick reuse
CREATE TABLE IF NOT EXISTS hashtag_sets (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naam       TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT 'all'
             CHECK (platform IN ('instagram', 'tiktok', 'facebook', 'all')),
  hashtags   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE hashtag_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated lezen en schrijven hashtag_sets" ON hashtag_sets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
