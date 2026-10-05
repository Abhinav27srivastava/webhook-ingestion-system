require('dotenv').config();

const request = require('supertest');

const mockSendWebhookNotification = jest.fn().mockResolvedValue({
    id: 'test-email-id',
});

jest.mock('../../src/services/notificationService', () => ({
    sendWebhookNotification: mockSendWebhookNotification,
}));

const app = require('../../src/app');
const pool = require('../../src/config/db');

const {
    generateWebhookSignature,
} = require('../../src/utils/generatingSignature');

const {
    publishOutboxEvents,
} = require('../../src/publisher/outboxPublisher');

const webhookQueue = require('../../src/queue/webhookQueue');

// Start BullMQ worker for integration tests
const worker = require('../../src/workers/webhookWorker');

const deadletterQueue = require('../../src/queue/deadletterqueue');


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


    test('should accept a valid signed webhook and save it to database', async () => {
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

        // Verify that webhook request was saved in PostgreSQL
        const result = await pool.query(
            `
            SELECT id, event_id, status
            FROM webhook_events
            WHERE event_id = $1
            `,
            [payload.id]
        );

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].event_id).toBe(payload.id);
    });


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


    test('should publish outbox event and not create duplicate BullMQ job', async () => {
        const timestamp = Math.floor(Date.now() / 1000);

        const payload = {
            id: `evt-outbox-${Date.now()}`,
            type: 'payment.success',
            timestamp,
            data: {
                amount: 1000,
                currency: 'INR',
            },
        };

        const rawBody = JSON.stringify(payload);

        const signature = generateWebhookSignature(
            rawBody,
            timestamp,
            process.env.WEBHOOK_SECRET
        );

        // 1. Send signed webhook
        const response = await request(app)
            .post('/webhook')
            .set('Content-Type', 'application/json')
            .set('X-Webhook-Timestamp', String(timestamp))
            .set('X-Webhook-Signature', signature)
            .send(rawBody);

        expect(response.statusCode).toBe(202);

        // 2. Verify outbox event is pending
        const outboxBefore = await pool.query(
            `
            SELECT id, status
            FROM outbox_events
            WHERE event_id = $1
            `,
            [payload.id]
        );

        expect(outboxBefore.rows).toHaveLength(1);
        expect(outboxBefore.rows[0].status).toBe('pending');

        // 3. Publish outbox event
        await publishOutboxEvents();

        // 4. Verify outbox event became published
        const outboxAfter = await pool.query(
            `
            SELECT id, status
            FROM outbox_events
            WHERE event_id = $1
            `,
            [payload.id]
        );

        expect(outboxAfter.rows).toHaveLength(1);
        expect(outboxAfter.rows[0].status).toBe('published');

        const outboxId = outboxAfter.rows[0].id;

        // 5. Verify BullMQ job exists
        const jobId = `outbox-${outboxId}`;

        const job = await webhookQueue.getJob(jobId);

        expect(job).not.toBeNull();
        expect(job.id).toBe(jobId);

        // 6. Publish the same outbox event again
        await publishOutboxEvents();

        // 7. Verify that no duplicate BullMQ job was created
        const jobs = await webhookQueue.getJobs([
            'waiting',
            'active',
            'completed',
            'failed',
        ]);

        const matchingJobs = jobs.filter(
            job => job.id === jobId
        );

        expect(matchingJobs).toHaveLength(1);
    });
});


afterAll(async () => {
    await worker.close();
    await webhookQueue.close();
    await deadletterQueue.close();
    await pool.end();
});