// routes ka kaam itna hai:
// request aayi -> middleware se verify/validate -> controller ke paas bhejna

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
 *       validates it, stores it in PostgreSQL, and queues it for processing.
 *
 *       ⚠️ Signature Testing:
 *       Use compact one-line JSON when testing in Swagger.
 *       The request body must exactly match the body used to generate
 *       X-Webhook-Signature.
 *
 *       Example:
 *       {"id":"evt-email-test-007","type":"resource.created","timestamp":1787931799,"data":{"resourceId":"res-1234"}}
 *
 *     tags:
 *       - Webhook
 *
 *     parameters:
 *       - in: header
 *         name: X-Webhook-Timestamp
 *         required: true
 *         description: Unix timestamp used for signature generation and replay protection.
 *         schema:
 *           type: string
 *         example: "1787931799"
 *
 *       - in: header
 *         name: X-Webhook-Signature
 *         required: true
 *         description: HMAC-SHA256 signature in sha256=<digest> format.
 *         schema:
 *           type: string
 *         example: sha256=fb3bfbe7a5757913ce667510b37b7b4946771febba5d0324bc67741867e7edfe
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
 *         description: Webhook accepted and queued.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponse'
 *
 *       400:
 *         description: Invalid request or validation error.
 *
 *       401:
 *         description: Missing or invalid webhook signature or timestamp.
 *
 *       500:
 *         description: Internal server error.
 */

router.post(
    '/',
    verifySignature,
    validate(webhookSchema),
    (req, res, next) => {
        console.log('Webhook route POST handler called');
        console.log('Request body:', req.body);
        next();
    },
    receiveWebhook
);

module.exports = router;

// Flow:
// Request
//   ↓
// verifySignature
//   ↓
// validate(webhookSchema)
//   ↓
// receiveWebhook
//   ↓
// PostgreSQL + BullMQ
//   ↓
// Worker
//   ↓
// Notification



