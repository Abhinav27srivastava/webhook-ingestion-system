require('dotenv').config();

const {
    generateWebhookSignature,
} = require('./Utils/generatingSignature');

async function sendWebhook() {
    const payload = {
      id: 'evt-004',
        type: 'payment.success',
        timestamp: Math.floor(Date.now() / 1000),
        data: {
            amount: 500,
            currency: 'INR',
            orderId: 'order-123'
        }
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
            
        },
        body: rawBody,
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
}

sendWebhook().catch(console.error);