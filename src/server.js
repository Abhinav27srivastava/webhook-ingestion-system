// server.js contains connections + app.listen
require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');
const {
    redisClient,
    connectRedis,
} = require('./config/redis');
const logger = require('./logger/logger.js');
require('./workers/webhookWorker');

pool.connect()
    .then(() => {
        logger.info('Connected to the database');
    })
    .catch((err) => {
        logger.error(err, 'Error connecting to the database');
    });

redisClient.on('error', (err) => {
    logger.error(err, 'Error connecting to Redis');
});

connectRedis()
    .catch((err) => {
        logger.error(err, 'Error connecting to Redis');
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT,'0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT}`);
});