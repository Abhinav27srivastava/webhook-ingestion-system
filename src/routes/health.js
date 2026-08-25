const express = require('express');

const router = express.Router();

const { healthCheck } = require('../controllers/healthcontroller');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check application health
 *     tags:  
 *       - Health
 *
 *     security: []
 *
 *     responses:
 *       200:
 *         description: Application health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 status:
 *                   type: string
 *                   example: healthy
 *
 *                 database:
 *                   type: string
 *                   example: connected
 *
 *                 redis:
 *                   type: string
 *                   example: connected
 *
 *       503:
 *         description: One or more dependencies are unavailable
 */
router.get('/', healthCheck);

module.exports = router;