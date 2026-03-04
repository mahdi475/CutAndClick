-- ============================================
-- Fas 2 — Migration (kör i Supabase SQL Editor)
-- ============================================

-- ─────────────────────────────────────────────
-- 2.1 haircut_posts: Skapa om den inte finns, annars lägg till kolumner
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS haircut_posts (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  price            FLOAT NOT NULL,
  time_taken       TEXT,
  image_url        TEXT,
  duration_minutes INTEGER DEFAULT 60,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Om tabellen redan finns — lägg till saknade kolumner
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS image_url        TEXT;
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT TRUE;

-- ─────────────────────────────────────────────
-- 2.2 item_posts: Skapa om den inte finns, annars lägg till kolumner
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_posts (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  price       FLOAT NOT NULL,
  status      TEXT DEFAULT 'in_stock',
  image_url   TEXT,
  category    TEXT DEFAULT 'general',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Om tabellen redan finns — lägg till saknade kolumner
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS category  TEXT DEFAULT 'general';
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ─────────────────────────────────────────────
-- 2.3 bookings: Skapa om den inte finns, annars lägg till kolumner
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               SERIAL PRIMARY KEY,
  customer_id      UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  haircut_id       INTEGER REFERENCES haircut_posts(id) ON DELETE CASCADE NOT NULL,
  booking_date     DATE,
  booking_time_slot TIME,
  status           TEXT DEFAULT 'confirmed',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Om tabellen redan finns — lägg till saknade kolumner
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date      DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time_slot TIME;
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'confirmed';

-- Unik constraint för att förhindra dubbelbokningar
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS unique_booking;
ALTER TABLE bookings ADD CONSTRAINT unique_booking
  UNIQUE (haircut_id, booking_date, booking_time_slot);

-- ─────────────────────────────────────────────
-- 2.4 opening_hours: Ny flexibel struktur (en rad per dag)
-- ─────────────────────────────────────────────
DROP TABLE IF EXISTS opening_hours CASCADE;
CREATE TABLE opening_hours (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, day_of_week)
);

ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;

-- RLS policies (kompatibelt med PG < 17 — inga IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'opening_hours' AND policyname = 'Alla kan lasa opening_hours'
  ) THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa opening_hours"
      ON opening_hours FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'opening_hours' AND policyname = 'Barber hanterar sina oppettider'
  ) THEN
    EXECUTE 'CREATE POLICY "Barber hanterar sina oppettider"
      ON opening_hours FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2.5 reviews: Skapa om den inte finns
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                 SERIAL PRIMARY KEY,
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stars              INTEGER CHECK (stars BETWEEN 1 AND 5),
  review_title       TEXT,
  review_description TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);
