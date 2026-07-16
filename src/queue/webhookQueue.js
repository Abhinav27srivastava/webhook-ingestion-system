const { Queue } = require('bullmq');

const redisClient = require('../config/redis'); // importing redis kyunki bullmq ko redis ki zarurat hoti hai

const webhookQueue = new Queue('webhook-queue', {
    connection:  {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }, // redis connection provide kar rahe hai
    
    
});

module.exports = webhookQueue;




