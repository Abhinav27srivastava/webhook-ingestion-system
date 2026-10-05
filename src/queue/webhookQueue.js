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
    defaultJoboptions:{
        removeOncomplete: {coun: 1000},  // keep last 1000 completed jobs in the queue
        removeOnFail: {count: 5000}  // keep last 5000 failed jobs in the queue
    },
});

module.exports = webhookQueue;