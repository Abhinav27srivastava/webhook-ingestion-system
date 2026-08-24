const { createClient } = require('redis');

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Connected to Redis');
    }
}

async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}

module.exports = {
    redisClient,
    connectRedis,
    disconnectRedis,
};
