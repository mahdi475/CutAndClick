-- Fas 9: Notifications-tabell
-- Kör i Supabase SQL Editor

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
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Användare kan se sina notifikationer' AND tablename = 'notifications') THEN
    CREATE POLICY "Användare kan se sina notifikationer"
      ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Användare kan uppdatera sina notifikationer' AND tablename = 'notifications') THEN
    CREATE POLICY "Användare kan uppdatera sina notifikationer"
      ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'System kan skapa notifikationer' AND tablename = 'notifications') THEN
    CREATE POLICY "System kan skapa notifikationer"
      ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;
