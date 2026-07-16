const { Queue } = require('bullmq');

const redisClient = require('../config/redis'); // importing redis kyunki bullmq ko redis ki zarurat hoti hai

const webhookQueue = new Queue('webhook-queue', {
    connection:  {
        host: "redis",
        port: 6379,
    }, // redis connection provide kar rahe hai
    
    
});

module.exports = webhookQueue;




