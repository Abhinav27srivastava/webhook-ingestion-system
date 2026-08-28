const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWebhookNotification({ eventId, payload }) {
    const { data, error } = await resend.emails.send({
        from: "Webhook Ingestion <onboarding@resend.dev>",
        to: [process.env.NOTIFICATION_EMAIL],
        subject: `Webhook Event Received: ${eventId}`,
        html: `
            <h2>Webhook Event Received</h2>
            <p><strong>Event ID:</strong> ${eventId}</p>

            <h3>Payload:</h3>
            <pre>${JSON.stringify(payload, null, 2)}</pre>
        `,
    });

    if (error) {
        throw new Error(`Email notification failed: ${error.message}`);
    }

    console.log(`Notification email sent for webhook ${eventId}`);

    return data;
}

module.exports = {
    sendWebhookNotification,
};