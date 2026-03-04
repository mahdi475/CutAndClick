// server/utils/emailService.js
// E-postnotifikationer via Resend (installers: npm install resend)
// Lägg till RESEND_API_KEY i .env

let resend;
try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
} catch {
    // Resend ej installerat — email skickas inte (fail silently)
    resend = null;
}

const FROM = 'Cut & Click <noreply@cutandclick.se>';

async function sendBookingConfirmation({ to, customerName, salonName, date, time, service }) {
    if (!resend || !process.env.RESEND_API_KEY) {
        console.log('[Email] Resend ej konfigurerat — hoppar över e-post');
        return;
    }
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: `Bokningsbekräftelse — ${salonName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: 'Inter', Arial, sans-serif; background: #f9f9f9; padding: 24px;">
                    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="font-size: 28px; color: #111; margin: 0;">✂️ Cut & Click</h1>
                        </div>
                        <div style="background: #f0fff4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                            <p style="font-size: 22px; margin: 0;">✅ Bokning bekräftad!</p>
                        </div>
                        <p style="color: #444; font-size: 16px;">Hej ${customerName}!</p>
                        <p style="color: #444; font-size: 15px;">Din bokning är bekräftad. Här är detaljerna:</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Salong</td><td style="padding: 8px 0; color: #111; font-weight: 600;">${salonName}</td></tr>
                            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Tjänst</td><td style="padding: 8px 0; color: #111;">${service}</td></tr>
                            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Datum</td><td style="padding: 8px 0; color: #111; font-weight: 600;">${date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Tid</td><td style="padding: 8px 0; color: #111; font-weight: 600;">${time}</td></tr>
                        </table>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #aaa; font-size: 13px; text-align: center;">Hanterar din bokning i Cut & Click-appen.</p>
                    </div>
                </body>
                </html>
            `,
        });
        console.log(`[Email] Bokningsbekräftelse skickad till ${to}`);
    } catch (err) {
        console.error('[Email] Fel vid skickande:', err.message);
        // Fail silently — bokningssystemet ska inte krascha pga e-postfel
    }
}

async function sendBookingReminder({ to, customerName, salonName, date, time }) {
    if (!resend || !process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: `Påminnelse: Din bokning hos ${salonName} imorgon`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 24px;">
                    <h2>📅 Påminnelse om din bokning</h2>
                    <p>Hej ${customerName}! Din bokning hos <strong>${salonName}</strong> är <strong>imorgon den ${date} kl ${time}</strong>.</p>
                    <p style="color: #888; font-size: 13px;">Cut & Click</p>
                </div>
            `,
        });
    } catch (err) {
        console.error('[Email] Påminnelse fel:', err.message);
    }
}

module.exports = { sendBookingConfirmation, sendBookingReminder };
