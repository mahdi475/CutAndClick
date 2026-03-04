-- Fas 1 — Supabase SQL Migration
-- Kör detta i Supabase Dashboard → SQL Editor

-- ─────────────────────────────────────────────
-- 0. Anpassa users-tabellen (lägger till saknade kolumner)
--    Din befintliga users-tabell har full_name men INTE username/location.
--    Vi lägger till dem om de saknas.
-- ─────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;

-- Kopiera full_name till username om username är tomt
UPDATE users SET username = full_name WHERE username IS NULL AND full_name IS NOT NULL;

-- ─────────────────────────────────────────────
-- 1. Constraint på users.role
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_role_check'
      AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('customer', 'barber'));
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2. Skapa barber_profiles-tabellen
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barber_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  salon_name    TEXT NOT NULL,
  salon_address TEXT NOT NULL,
  city          TEXT NOT NULL,
  phone         TEXT,
  bio           TEXT,
  cover_image   TEXT,
  rating        FLOAT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. RLS för barber_profiles
-- (Undviker CREATE POLICY IF NOT EXISTS — stöds ej i PG < 17)
-- ─────────────────────────────────────────────
ALTER TABLE barber_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'barber_profiles' AND policyname = 'Alla kan lasa barber_profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa barber_profiles"
      ON barber_profiles FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'barber_profiles' AND policyname = 'Barber kan uppdatera sin profil'
  ) THEN
    EXECUTE 'CREATE POLICY "Barber kan uppdatera sin profil"
      ON barber_profiles FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'barber_profiles' AND policyname = 'Barber kan skapa sin profil'
  ) THEN
    EXECUTE 'CREATE POLICY "Barber kan skapa sin profil"
      ON barber_profiles FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
