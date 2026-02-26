-- Kör denna i Supabase SQL Editor
-- Gör dubbelbokningar omöjliga på databasnivå

ALTER TABLE bookings
ADD CONSTRAINT unique_booking
UNIQUE (haircut_id, booking_date, booking_time);
