const request = require('supertest');
jest.mock('../../src/services/notificationService', () => ({
    sendWebhookNotification: jest.fn().mockResolvedValue({
        id: 'test-email-id'
    }),
}));
const app = require('../../src/app');
const pool = require('../../src/config/db')
const {
    generateWebhookSignature,
} = require('../../src/utils/generatingSignature');
const webhookQueue = require('../../src/queue/webhookQueue');
// Start BullMQ worker for integration tests
require('../../src/workers/webhookWorker');
const deadletterQueue = require('../../src/queue/deadletterqueue');


async function waitForProcessed(eventId, timeout = 10000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const result = await pool.query(
            `
            SELECT status
            FROM webhook_events
            WHERE event_id = $1
            `,
            [eventId]
        );

        if (result.rows.length > 0 &&
            result.rows[0].status === 'processed') {
            return result.rows[0];
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }

    throw new Error(
        `Event ${eventId} was not processed within ${timeout}ms`
    );
}
describe('WEBHOOK API', () => {

    test('reject webhook request without signature', async () => {
        const payload = {
            id: 'evt-jest-no-signature',
            type: 'payment.success',
            timestamp: Math.floor(Date.now() / 1000),
            data: {
                amount: 500,
                currency: 'INR',
            },
        };

        const response = await request(app)
            .post('/webhook')
            .send(payload);

        expect(response.statusCode).toBe(401);
    });

    test('should accept a valid signed webhook and saved it to database', async () => {
        const timestamp = Math.floor(Date.now() / 1000);

        const payload = {
            id: `evt-jest-${Date.now()}`,
            type: 'payment.success',
            timestamp,
            data: {
                amount: 500,
                currency: 'INR',
                orderId: 'order-123',
            },
        };

        // Exact body that will be sent to the server
        const rawBody = JSON.stringify(payload);

        // Generate signature using the same contract as the receiver
        const signature = generateWebhookSignature(
            rawBody,
            timestamp,
            process.env.WEBHOOK_SECRET
        );

        const response = await request(app)
            .post('/webhook')
            .set('Content-Type', 'application/json')
            .set('X-Webhook-Timestamp', String(timestamp))
            .set('X-Webhook-Signature', signature)
            .send(rawBody);

        expect([200, 202]).toContain(response.statusCode);
        expect(response.body.success).toBe(true);
        expect(response.body.duplicate).toBe(false);


        // verify that webhook request actual saved in postgres
        const result = await pool.query(
            `SELECT id, event_id, status
            FROM webhook_events
            WHERE event_id =$1
            `,[payload.id]
        );
        expect(result.rows).toHaveLength(1);
    expect(result.rows[0].event_id).toBe(payload.id);
    
 const processed = await waitForProcessed(payload.id);

expect(processed.status).toBe('processed');

    },
    15000);
    test('should reject duplicate webhook event', async () => {
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
        id: `evt-duplicate-${Date.now()}`,
        type: 'payment.success',
        timestamp,
        data: {
            amount: 500,
            currency: 'INR',
        },
    };

    const rawBody = JSON.stringify(payload);

    const signature = generateWebhookSignature(
        rawBody,
        timestamp,
        process.env.WEBHOOK_SECRET
    );

    // First request
    const firstResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Timestamp', String(timestamp))
        .set('X-Webhook-Signature', signature)
        .send(rawBody);

    expect([200, 202]).toContain(firstResponse.statusCode);
    expect(firstResponse.body.duplicate).toBe(false);

    // Second request with the SAME event ID
    const secondResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Timestamp', String(timestamp))
        .set('X-Webhook-Signature', signature)
        .send(rawBody);

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body.duplicate).toBe(true);
});
   afterAll(async()=>{
     await webhookQueue.close();
     await deadletterQueue.close();
     await pool.end();
   })
});