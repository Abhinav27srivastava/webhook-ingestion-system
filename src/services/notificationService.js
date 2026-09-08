const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const escapeHtml = require("../Utils/escapeHtml");
const logger = require("../logger/logger.js");

async function sendWebhookNotification({ eventId, payload }) {
    const recipients = [process.env.NOTIFICATION_EMAIL];

    const formattedPayload = escapeHtml(
        JSON.stringify(payload, null, 2)
    );

    const safeEventId = escapeHtml(eventId);

    const { data, error } = await resend.emails.send({
        from: "Webhook Ingestion <onboarding@resend.dev>",
        to: recipients,
        subject: `Webhook Event Received: ${eventId}`,
        html: `
            <h2>Webhook Event Received</h2>

            <p><strong>Event ID:</strong> ${safeEventId}</p>

            <h3>Payload:</h3>
            <pre>${formattedPayload}</pre>
        `,
    });

    if (error) {
        logger.error(
            { eventId, error: error.message },
            "Webhook notification failed"
        );

        throw new Error(
            `Email notification failed: ${error.message}`
        );
    }

    logger.info(
        { eventId },
        "Webhook notification sent successfully"
    );

    return data;
}

module.exports = {
    sendWebhookNotification,
};