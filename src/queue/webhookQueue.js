const { Queue } = require('bullmq');

const webhookQueue = new Queue('webhook-queue', {
    connection:  {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }, // redis connection provide kar rahe hai
    
    
});

module.exports = webhookQueue;




