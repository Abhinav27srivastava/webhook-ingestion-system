const express = require('express');

const router = express.Router();

const {
    getFailedJobs,
    retryFailedJob,
} = require('../controllers/dlqController');

/**
 * @swagger
 * /webhook/failed:
 *   get:
 *     summary: Retrieve failed webhook jobs from the Dead Letter Queue
 *     tags:
 *       - Webhook
 *
 *     responses:
 *       200:
 *         description: List of failed webhook jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 count:
 *                   type: integer
 *                   example: 1
 *
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       webhookEventId:
 *                         type: integer
 *                         example: 10
 *
 *                       eventId:
 *                         type: string
 *                         example: evt-12345
 *
 *                       payload:
 *                         type: object
 *                         additionalProperties: true
 *
 *                       jobId:
 *                         type: string
 *                         example: "25"
 *
 *                       error:
 *                         type: string
 *                         example: "Processing failed"
 *
 *                       failedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-25T10:30:00Z"
 *
 *       500:
 *         description: Internal server error
 */
router.get('/failed', getFailedJobs);


/**
 * @swagger
 * /webhook/retry/{jobId}:
 *   post:
 *     summary: Retry a failed webhook job
 *     tags:
 *       - Webhook
 *
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID of the failed job in the Dead Letter Queue
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Failed job successfully requeued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Job moved back to main queue
 *
 *       404:
 *         description: Job not found in the Dead Letter Queue
 *
 *       500:
 *         description: Internal server error
 */
router.post('/retry/:jobId', retryFailedJob);

module.exports = router;