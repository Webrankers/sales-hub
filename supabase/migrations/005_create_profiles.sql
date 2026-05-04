-- Profiles table: one row per auth user, stores display name and role
CREATE TABLE IF NOT EXISTS profiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naam TEXT,
  rol  TEXT NOT NULL DEFAULT 'sales',
  CONSTRAINT profiles_rol_check CHECK (rol IN ('eigenaar', 'sales', 'marketing', 'admin'))
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Own profile leesbaar" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Own profile aanpasbaar" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, naam, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'naam', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'sales')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
