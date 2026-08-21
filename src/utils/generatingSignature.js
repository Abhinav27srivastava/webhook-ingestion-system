// sender-side signing  basically its work to do rawBody + timestamp +secret par apply hmac calculation then verify signature
const crypto = require('crypto');

function generateWebhookSignature(rawBody, timestamp, secret) {
    if (!rawBody) {
        throw new Error('rawBody is required');
    }

    if (!timestamp) {
        throw new Error('timestamp is required');
    }

    if (!secret) {
        throw new Error('WEBHOOK_SECRET is required');
    }

    const signedPayload = `${timestamp}.${rawBody}`;

    const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return `sha256=${signature}`;
}

module.exports = {
    generateWebhookSignature,
};