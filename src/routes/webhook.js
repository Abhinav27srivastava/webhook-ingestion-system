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
 *     tags:
 *       - Webhook
 *     summary: Receive a webhook event
 *     description: Receives a webhook payload, validates it, stores it in PostgreSQL, and queues it for background processing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "john doe"
 *             last_name: "doe"
 *             roll_no: "123456"
 *             email: "john.doe@example.com"
 *             
 *             
 *     responses:
 *       200:
 *         description: Webhook received and queued successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Webhook received and queued successfully
 *       400:
 *         description: Invalid payload
 */

router.post('/',verifySignature,validate(webhookSchema), (req, res, next) => {
    console.log('Webhook route POST handler called');
    console.log('Request body:', req.body);
    next();
}, receiveWebhook); // Use the controller function to handle the POST request

module.exports = router;
// agar server.js me /webhook route pe request aati hai to ye router use karega aur ye router receiveWebhook function ko call karega jo ki webhookcontroller.js me defined hai.




