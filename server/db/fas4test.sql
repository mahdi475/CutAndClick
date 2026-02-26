-- Lägg till booking_date eftersom koden förväntar sig den
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;

-- Ändra booking_time till TEXT (t.ex. '10:00') om den var en hel tidsstämpel innan
ALTER TABLE bookings ALTER COLUMN booking_time TYPE TEXT;


-- Rensa gamla tider om de finns
DELETE FROM opening_hours WHERE user_id = '19e1b474-4e82-42cf-9fa1-334ac490a3c1';

-- Lägg in ett schema: 09:00 till 18:00 varje vardag
INSERT INTO opening_hours (user_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
VALUES (
  '19e1b474-4e82-42cf-9fa1-334ac490a3c1', -- Ditt User ID från Thunder Client
  '09:00-18:00', -- Måndag
  '09:00-18:00', -- Tisdag
  '09:00-18:00', -- Onsdag
  '09:00-18:00', -- Torsdag
  '09:00-18:00', -- Fredag
  'Stängt',      -- Lördag
  'Stängt'       -- Söndag
);