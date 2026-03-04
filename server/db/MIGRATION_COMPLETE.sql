-- ═══════════════════════════════════════════════════════════════
-- CUT & CLICK — KOMPLETT MIGRATION (Kör denna i rätt Supabase-projekt)
-- Baserad på faktiska tabellstrukturen som visades i skärmdumpar
-- Säker att köra — alla delar använder IF NOT EXISTS / IF EXISTS
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- STEG 1: users — lägg till saknade kolumner
-- (Du HAR redan: id, username, role, location, profile_pic_url, created_at)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;

-- ─────────────────────────────────────────────────────────────
-- STEG 2: barber_profiles — skapa om den inte finns
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barber_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  salon_name    TEXT NOT NULL,
  salon_address TEXT NOT NULL,
  city          TEXT NOT NULL,
  phone         TEXT,
  bio           TEXT,
  cover_image   TEXT,
  rating        NUMERIC(3,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Lägg till om du kört en äldre version utan dessa kolumner
ALTER TABLE barber_profiles ADD COLUMN IF NOT EXISTS bio           TEXT;
ALTER TABLE barber_profiles ADD COLUMN IF NOT EXISTS cover_image   TEXT;
ALTER TABLE barber_profiles ADD COLUMN IF NOT EXISTS rating        NUMERIC(3,1) DEFAULT 0;
ALTER TABLE barber_profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

ALTER TABLE barber_profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'barber_profiles' AND policyname = 'Alla kan lasa barber_profiles') THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa barber_profiles" ON barber_profiles FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'barber_profiles' AND policyname = 'Barber kan uppdatera sin profil') THEN
    EXECUTE 'CREATE POLICY "Barber kan uppdatera sin profil" ON barber_profiles FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  
  -- Droppa den gamla insert-policyn om den finns, för att lägga till den korrekt
  DROP POLICY IF EXISTS "Barber kan skapa sin profil" ON barber_profiles;
  EXECUTE 'CREATE POLICY "Barber kan skapa sin profil" ON barber_profiles FOR INSERT WITH CHECK (auth.uid() = user_id)';
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 3: haircut_posts — lägg till saknade kolumner
-- (Du HAR redan: id, title, description, user_id, price, time_token, created_at, image_url)
-- Vi BEHÅLLER time_token och lägger till duration_minutes som alias
-- ─────────────────────────────────────────────────────────────
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS image_url        TEXT;
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT TRUE;

-- Synka duration_minutes från time_token om det finns data (t.ex. "60" eller "60 min")
UPDATE haircut_posts
SET duration_minutes = NULLIF(regexp_replace(time_taken, '[^0-9]', '', 'g'), '')::INTEGER
WHERE duration_minutes IS NULL OR duration_minutes = 60
  AND time_taken IS NOT NULL
  AND time_taken != '';

-- ─────────────────────────────────────────────────────────────
-- STEG 4: item_posts — lägg till saknade kolumner
-- (Du HAR redan: id, title, description, user_id, price, status, created_at)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS category  TEXT DEFAULT 'general';
ALTER TABLE item_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ─────────────────────────────────────────────────────────────
-- STEG 5: bookings — lägg till saknade kolumner
-- (Du HAR redan: id, customer_id, haircut_id, booking_time TEXT, status, created_at, booking_date DATE)
-- VI BEHÅLLER booking_time (TEXT) — backend använder nu detta
-- ─────────────────────────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'confirmed';

-- Unik constraint för att förhindra dubbelbokningar (haircut_id + datum + tid)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'bookings'::regclass AND conname = 'unique_booking'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT unique_booking
      UNIQUE (haircut_id, booking_date, booking_time);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 6: opening_hours — uppdatera till ny flexibel struktur
-- (Du HAR: user_id, monday, tuesday, ..., sunday — alla TEXT)
-- NY STRUKTUR: en rad per dag med open_time, close_time, is_closed
-- Vi DROPPAR den gamla och skapar ny
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS opening_hours CASCADE;

CREATE TABLE opening_hours (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,  -- 'monday', 'tuesday', ..., 'sunday'
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, day_of_week)
);

ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'opening_hours' AND policyname = 'Alla kan lasa opening_hours') THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa opening_hours" ON opening_hours FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'opening_hours' AND policyname = 'Barber hanterar sina oppettider') THEN
    EXECUTE 'CREATE POLICY "Barber hanterar sina oppettider" ON opening_hours FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 7: reviews — lägg till saknade kolumner
-- (Du HAR redan: id, user_id=reviewer, target_user_id, stars, review_title,
--  review_description, created_at)
-- user_id i din tabell = reviewer (vi döper INTE om — backend använder user_id)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_title TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_description TEXT;

-- Unik: en kund kan bara recensera en barber en gång
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'reviews'::regclass AND conname = 'reviews_user_target_unique'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_user_target_unique
      UNIQUE(user_id, target_user_id);
  END IF;
END $$;

-- RLS för reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Alla kan lasa reviews') THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa reviews" ON reviews FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Kunder kan skapa reviews') THEN
    EXECUTE 'CREATE POLICY "Kunder kan skapa reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 8: favourites — skapa om den inte finns
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favourites (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  barber_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, barber_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favourites' AND policyname = 'Kunder kan se sina favoriter') THEN
    EXECUTE 'CREATE POLICY "Kunder kan se sina favoriter" ON favourites FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favourites' AND policyname = 'Kunder kan lagga till favoriter') THEN
    EXECUTE 'CREATE POLICY "Kunder kan lagga till favoriter" ON favourites FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favourites' AND policyname = 'Kunder kan ta bort favoriter') THEN
    EXECUTE 'CREATE POLICY "Kunder kan ta bort favoriter" ON favourites FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 9: notifications — skapa om den inte finns
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Anvandare kan se sina notifikationer') THEN
    EXECUTE 'CREATE POLICY "Anvandare kan se sina notifikationer" ON notifications FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Anvandare kan uppdatera sina notifikationer') THEN
    EXECUTE 'CREATE POLICY "Anvandare kan uppdatera sina notifikationer" ON notifications FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System kan skapa notifikationer') THEN
    EXECUTE 'CREATE POLICY "System kan skapa notifikationer" ON notifications FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEG 10: RLS för haircut_posts, item_posts, bookings
-- ─────────────────────────────────────────────────────────────
ALTER TABLE haircut_posts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'haircut_posts' AND policyname = 'Alla kan lasa haircut_posts') THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa haircut_posts" ON haircut_posts FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'haircut_posts' AND policyname = 'Barber hanterar sina haircut_posts') THEN
    EXECUTE 'CREATE POLICY "Barber hanterar sina haircut_posts" ON haircut_posts FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

ALTER TABLE item_posts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'item_posts' AND policyname = 'Alla kan lasa item_posts') THEN
    EXECUTE 'CREATE POLICY "Alla kan lasa item_posts" ON item_posts FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'item_posts' AND policyname = 'Barber hanterar sina item_posts') THEN
    EXECUTE 'CREATE POLICY "Barber hanterar sina item_posts" ON item_posts FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Kunder kan se sina bokningar') THEN
    EXECUTE 'CREATE POLICY "Kunder kan se sina bokningar" ON bookings FOR SELECT USING (auth.uid() = customer_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Kunder kan skapa bokningar') THEN
    EXECUTE 'CREATE POLICY "Kunder kan skapa bokningar" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Kunder kan uppdatera sina bokningar') THEN
    EXECUTE 'CREATE POLICY "Kunder kan uppdatera sina bokningar" ON bookings FOR UPDATE USING (auth.uid() = customer_id)';
  END IF;
END $$;
