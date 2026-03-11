require('dotenv').config();
const { Resend } = require('resend');

async function check() {
    console.log("Testing Resend directly...");
    if (!process.env.RESEND_API_KEY) {
        console.log("NO API KEY");
        return;
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const response = await resend.emails.send({
            from: 'Cut & Click <onboarding@resend.dev>',
            to: 'mahdimousavi8909@gmail.com',
            subject: `Test från min kod`,
            html: `<p>Fungerar det nu?</p>`
        });
        console.log("RESPONSE FROM RESEND:", response);
    } catch (e) {
        console.error("ERROR FROM RESEND:", e);
    }
}
check();
