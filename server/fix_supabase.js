const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Saknar SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i server/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('--- Supabase Storage Setup ---');

    // 1. Skapa bucket om den inte finns
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB
    });

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log('✅ Bucketen "avatars" finns redan.');
        } else {
            console.error('❌ Fel vid skapande av bucket:', bucketError.message);
        }
    } else {
        console.log('✅ Bucketen "avatars" skapades!');
    }

    console.log('\n--- VIKTIGT: SQL FÖR RLS POLICIES ---');
    console.log('Kopiera och kör följande SQL i din Supabase SQL Editor för att tillåta uppladdningar:\n');
    console.log(`
-- 1. Tillåt alla att se bilder (Publik läsning)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- 2. Tillåt inloggade att ladda upp till sin egen mapp
CREATE POLICY "Allow individual uploads" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Tillåt ägare att uppdatera sina bilder
CREATE POLICY "Allow individual updates" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Tillåt ägare att ta bort sina bilder
CREATE POLICY "Allow individual deletes" ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
    `);
}

setupStorage();
