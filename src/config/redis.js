const { createClient } = require('redis');
const logger = require('../logger/logger');
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        logger.info('Connected to Redis');
    }
}

async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Disconnected from Redis');
    }
}

module.exports = {
    redisClient,
    connectRedis,
    disconnectRedis,
};
