const { Queue } = require('bullmq');

const queueName =
    process.env.WEBHOOK_QUEUE_NAME ||
    (process.env.NODE_ENV === 'test'
        ? 'webhook-queue-test'
        : 'webhook-queue');

const webhookQueue = new Queue(queueName, {  //webhook-queue replace with queueName for dynamic queue name based on environment
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});

module.exports = webhookQueue;