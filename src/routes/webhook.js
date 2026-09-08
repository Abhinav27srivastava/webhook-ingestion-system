// routes ka kaam:
// request aayi
// -> middleware se verify
// -> middleware se validate
// -> controller ke paas bhejna

const express = require('express');
const router = express.Router();

const { receiveWebhook } = require('../controllers/webhookcontroller');
const validate = require('../middleware/validate');
const webhookSchema = require('../validation/webhookSchema');
const verifySignature = require('../middleware/webhookSignature');

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Receive a webhook event
 *     description: |
 *       Receives a webhook payload, verifies its HMAC-SHA256 signature,
 *       validates the request body, stores the event in PostgreSQL,
 *       and queues it for asynchronous processing.
 *
 *       ### Signature verification
 *
 *       This endpoint requires two headers:
 *
 *       - `X-Webhook-Timestamp`
 *       - `X-Webhook-Signature`
 *
 *       The signature is generated using:
 *
 *       `HMAC-SHA256(timestamp + "." + rawRequestBody, WEBHOOK_SECRET)`
 *
 *       The timestamp must be recent and within the configured
 *       webhook tolerance window.
 *
 *       Swagger UI does not generate the HMAC signature automatically.
 *       For live testing, generate a fresh signature externally using
 *       the exact request body and current Unix timestamp.
 *
 *       The request body must exactly match the body used when
 *       generating the signature.
 *
 *     tags:
 *       - Webhook
 *
 *     parameters:
 *       - $ref: '#/components/parameters/WebhookTimestamp'
 *
 *       - $ref: '#/components/parameters/WebhookSignature'
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *           example:
 *             id: evt-email-test-007
 *             type: resource.created
 *             timestamp: 1787931799
 *             data:
 *               resourceId: res-1234
 *
 *     responses:
 *       200:
 *         description: Duplicate webhook event.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponse'
 *
 *       202:
 *         description: Webhook accepted and queued for asynchronous processing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponse'
 *
 *       400:
 *         description: Invalid request body or raw body unavailable.
 *
 *       401:
 *         description: Missing, expired, malformed, or invalid webhook signature.
 *
 *       500:
 *         description: Internal server error.
 */

router.post(
    '/',
    verifySignature,
    validate(webhookSchema),
    receiveWebhook
);

module.exports = router;