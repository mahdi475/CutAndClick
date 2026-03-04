const supabase = require('./config/db');

async function testInsert() {
    console.log("Testing insert...");

    // Simulate a request from Mahdi Barber
    const user_id = '609d60b0-4171-4e73-a093-ddec69918df9'; // Mahdi barber ID from screenshot

    const { data, error } = await supabase
        .from('haircut_posts')
        .insert([{
            user_id,
            title: 'Fade Test',
            description: 'Skin fade test',
            price: 450,
            time_taken: '30 min',
            duration_minutes: 30
        }])
        .select();

    if (error) {
        console.error("DB ERROR: ", error);
    } else {
        console.log("SUCCESS: ", data);
    }
}

testInsert();
