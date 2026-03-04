async function testRegistrationReq() {
    try {
        const payload = {
            email: `test_${Date.now()}@gmail.com`,
            password: 'password123',
            username: 'IntegrationTestUser',
            location: 'Test City',
            role: 'barber',
            salon_name: 'Test Salon',
            salon_address: 'Test Street 1',
            city: 'Test City',
            phone: '0701234567'
        };

        console.log("SENDING REGISTRATION REQUEST...");
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log("HTTP STATUS:", response.status);
        console.log("RESPONSE TEXT:", text);
    } catch (err) {
        console.error("HTTP ERROR:", err);
    }
}
testRegistrationReq();
