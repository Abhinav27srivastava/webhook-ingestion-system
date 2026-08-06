const express = require("express");
const router = express.Router();

const {
  getFailedJobs,
  retryFailedJob,
} = require("../controllers/dlqController");

// GET /webhook/failed
/**
 * @swagger
 * /webhook/failed:
 *   get:
 *     summary: Retrieve all failed webhook jobs from the Dead Letter Queue
 *     tags:
 *       - Webhook
 *     responses:
 *       200:
 *         description: List of failed webhook jobs
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 1
 *               jobs:
 *                 - jobId: "5"
 *                   name: "failed-job"
 *                   payload:
 *                     name: "Anshika"
 *                     last_name: "Singh"
 *                     roll_no: "24IT3002"
 *                     email: "24it3002@gmail.com"
 *                   error: "testing retry logic"
 *                   failedAt: "2026-08-07T10:30:00Z"
 */
router.get("/failed", getFailedJobs);

// POST /webhook/retry/:jobId
/**
 * @swagger
 * /webhook/retry/{jobId}:
 *   post:
 *     summary: Retry a failed webhook job by moving it back to the main queue
 *     tags:
 *       - Webhook
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the failed job
 *     responses:
 *       200:
 *         description: Job moved back to the webhook queue successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Job moved back to main queue
 *       404:
 *         description: Job not found in the Dead Letter Queue
 */
router.post("/retry/:jobId", retryFailedJob);

module.exports = router;