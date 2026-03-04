async function testServerLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alexveklund@gmail.com', password: 'password123' }) // We expect 401 if wrong password, but what if they have NO password or something?
        });
        const data = await response.json();
        console.log("HTTP Response:", response.status, data);
    } catch (err) {
        console.error("Fetch err:", err);
    }
}
testServerLogin();
