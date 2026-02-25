-- 1. Se till att image_url finns (utifall den inte lades till förut)
ALTER TABLE haircut_posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Vi skapar en variabel och hämtar ID:t från den första användaren som finns i din tabell
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Vi hämtar ID från den första användaren i din 'users'-tabell
    SELECT id INTO first_user_id FROM users LIMIT 1;

    -- Om vi hittade en användare, så lägger vi in klippningarna
    IF first_user_id IS NOT NULL THEN
        -- Rensa gamla rader för säkerhets skull
        DELETE FROM haircut_posts WHERE user_id = first_user_id;

        -- Lägg in test-datan med det ID vi hittade
        INSERT INTO haircut_posts (user_id, title, description, price, time_taken, image_url)
        VALUES 
        (
          first_user_id, 
          'Ferrari Cutzz Special', 
          'En lyxig fade med extra noggrannhet och styling.', 
          450, 
          '60 min', 
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'
        ),
        (
          first_user_id, 
          'Quick Buzz', 
          'Snabb och fräsch maskinklippning för dig på språng.', 
          200, 
          '20 min', 
          'https://images.unsplash.com/photo-1621605815841-db897c4733dd'
        );
    END IF;
END $$;