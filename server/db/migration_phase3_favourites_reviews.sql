-- Fas 6 & 7: Favourites + Reviews schema
-- Kör i Supabase SQL Editor

-- ─────────────────────────────────────────────────────────────
-- Favourites-tabell
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favourites (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  barber_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, barber_id)
);

-- Index för snabba querys
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);

-- RLS
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Kunder kan se sina favoriter' AND tablename = 'favourites') THEN
    CREATE POLICY "Kunder kan se sina favoriter"
      ON favourites FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Kunder kan lägga till favoriter' AND tablename = 'favourites') THEN
    CREATE POLICY "Kunder kan lägga till favoriter"
      ON favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Kunder kan ta bort favoriter' AND tablename = 'favourites') THEN
    CREATE POLICY "Kunder kan ta bort favoriter"
      ON favourites FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- Reviews — kolumner (tabellen skapad i fas2)
-- Lägg till om de saknas
-- ─────────────────────────────────────────────────────────────
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS review_title TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Unik: en kund kan bara recensera en barber en gång
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_reviewer_target_unique'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_target_unique UNIQUE(reviewer_id, target_user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- barber_profiles — lägg till rating + total_reviews + cover_image om de saknas
-- ─────────────────────────────────────────────────────────────
ALTER TABLE barber_profiles
  ADD COLUMN IF NOT EXISTS rating       NUMERIC(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cover_image  TEXT;
