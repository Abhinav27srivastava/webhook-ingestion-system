require('dotenv').config();

const {
    generateWebhookSignature,
} = require('./Utils/generatingSignature');

async function sendWebhook() {
    const payload = {
        name: 'Anshika',
        last_name: 'Singh',
        roll_no: '24it3002',
        email: '24it3002@gmail.com',
    };

    const rawBody = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = generateWebhookSignature(
        rawBody,
        timestamp,
        process.env.WEBHOOK_SECRET
    );

    const response = await fetch('http://localhost:5000/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Timestamp': String(timestamp),
            'X-Webhook-Signature': signature,
            'X-Idempotency-Key': 'evt-test-002',
        },
        body: rawBody,
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
}

sendWebhook().catch(console.error);