require('dotenv').config();
const { Resend } = require('resend');

const FROM = 'Cut & Click <onboarding@resend.dev>';
const TO = 'alexveklund@gmail.com';  // Andra e-postadresser kräver verifierad domän i gratisversionen

async function testVeklundEmail() {
    console.log("=== Startar Test för alexveklund@gmail.com ===");
    console.log("Kollar API Nyckel...", process.env.RESEND_API_KEY ? "Hittades!" : "SAKNAS");

    if (!process.env.RESEND_API_KEY) return;

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        console.log(`Försöker skicka mejl från ${FROM} till ${TO}...`);
        const response = await resend.emails.send({
            from: FROM,
            to: TO,
            subject: 'Test-mejl från Cut & Click (Direktkod)',
            html: '<p>Tjena! Detta är servern som skickar ett direkt-test via Resend API.</p>'
        });

        console.log("=== SUCCÉ ===");
        console.log("Svar från Resend:", JSON.stringify(response, null, 2));
        console.log("Om du fortfarande inte får mejlet beror det till 100% på att din gratis Resend-plan vägrar skicka till andra adresser än din egen registrerade utvecklar-adress (mahdimousavi8909@gmail.com).");

    } catch (err) {
        console.error("=== FEL ===");
        console.error("Ett fel inträffade hos Resend:", err.message);
    }
}

testVeklundEmail();
