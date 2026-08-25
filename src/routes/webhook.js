// routes ka kaam itna hai req aayi usai controller ke pass bhej dena.
const express = require('express');
const router = express.Router();
const { receiveWebhook } = require('../controllers/webhookcontroller'); // Import the controller function   
const validate = require('../middleware/validate');
const webhookSchema = require('../validation/webhookSchema');
const verifySignature = require('../middleware/webhookSignature');
/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Receive a webhook event
 *     description: Receives a webhook payload, validates it, stores it in PostgreSQL, and queues it for background processing.
 *     tags:
 *       - Webhook
 *
 *     parameters:
 *       - in: header
 *         name: X-Webhook-Timestamp
 *         required: true
 *         description: Unix timestamp used for replay protection.
 *         schema:
 *           type: string
 *
 *       - in: header
 *         name: X-Webhook-Signature
 *         required: true
 *         description: HMAC-SHA256 signature in sha256=<digest> format.
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *
 *     responses:
 *       200:
 *         description: Duplicate webhook event.
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
 */ 


router.post('/',verifySignature,validate(webhookSchema), (req, res, next) => {
    console.log('Webhook route POST handler called');
    console.log('Request body:', req.body);
    next();
}, receiveWebhook); // Use the controller function to handle the POST request

module.exports = router;
// agar server.js me /webhook route pe request aati hai to ye router use karega aur ye router receiveWebhook function ko call karega jo ki webhookcontroller.js me defined hai.




