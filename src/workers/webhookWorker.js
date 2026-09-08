const { Worker } = require('bullmq');
const deadletterqueue = require('../queue/deadletterqueue');
const pool = require('../config/db');
const { sendWebhookNotification } = require('../services/notificationService');
const logger = require('../logger/logger.js');

const queueName =
    process.env.WEBHOOK_QUEUE_NAME ||
    (process.env.NODE_ENV === 'test'
        ? 'webhook-queue-test'
        : 'webhook-queue');


const worker = new Worker(
    queueName,

    async (job) => {

        const {
            webhookEventId,
            eventId,
            payload,
        } = job.data;


        // Mark event as processing
        await pool.query(
            `
            UPDATE webhook_events
            SET status = 'processing'
            WHERE id = $1
            `,
            [webhookEventId]
        );


        logger.info(
            {
                jobId: job.id,
                webhookEventId,
                eventId,
            },
            'Processing webhook event'
        );


        // Send notification
        await sendWebhookNotification({
            eventId,
            payload,
        });


        // Processing successful
        await pool.query(
            `
            UPDATE webhook_events
            SET status = 'processed'
            WHERE id = $1
            `,
            [webhookEventId]
        );


        logger.info(
            {
                jobId: job.id,
                webhookEventId,
                eventId,
            },
            'Webhook event processed successfully'
        );


        return {
            success: true,
            webhookEventId,
            eventId,
        };
    },


    {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },

        // Maximum 5 jobs processed simultaneously
        concurrency: 5,
    }
);

-
// BullMQ failed event


worker.on('failed', async (job, err) => {

    if (!job) {
        return;
    }


    const {
        webhookEventId,
        eventId,
        payload,
    } = job.data;


    const maxAttempts = job.opts.attempts || 0;


    logger.error(
        {
            jobId: job.id,
            webhookEventId,
            eventId,
            attemptsMade: job.attemptsMade,
            maxAttempts,
            error: err.message,
        },
        'Webhook job failed'
    );


  
    // Retry is still remaining


    if (job.attemptsMade < maxAttempts) {

        await pool.query(
            `
            UPDATE webhook_events
            SET status = 'retrying'
            WHERE id = $1
            `,
            [webhookEventId]
        );


        logger.warn(
            {
                jobId: job.id,
                webhookEventId,
                eventId,
                attemptsMade: job.attemptsMade,
                maxAttempts,
            },
            'Webhook job will be retried'
        );


        return;
    }


    // All retries exhausted
  

    await pool.query(
        `
        UPDATE webhook_events
        SET status = 'failed'
        WHERE id = $1
        `,
        [webhookEventId]
    );


    
    // Send failed job to Dead Letter Queue
   

    await deadletterqueue.add('failed-job', {

        webhookEventId,
        eventId,
        payload,

        jobId: job.id,

        error: err.message,

        failedAt: new Date().toISOString(),
    });


    logger.error(
        {
            jobId: job.id,
            webhookEventId,
            eventId,
        },
        'Webhook job moved to Dead Letter Queue'
    );
});


logger.info(
    {
        queueName,
    },
    'Webhook worker started'
);


module.exports = worker;