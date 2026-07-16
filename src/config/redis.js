const { createClient } = require('redis');
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` // kyunki service ka naam redis ho raha hai docker-compose.yml me isliye localhost ki jagah redis likh rahe hai
    // intially url: `redis://localhost:6379` tha but docker-compose me service ka naam redis hai isliye url me redis likh rahe hai
});
redisClient.connect()
    .then(() => {
        console.log('Connected to Redis');
    })
    .catch((err) => {
        console.error('Error connecting to Redis', err);
    });

module.exports = redisClient;    // 

