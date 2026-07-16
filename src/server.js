require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();

const webhookRouter = require('./routes/webhook');
const pool = require('./config/db');
const redisClient =require('./config/redis');

const logger = require('./logger/logger.js')  // ab jaha console hai waha logger kar do and log ki jgh info kar do. aur error ki jgh error kar do. aur log file ka naam loger.js hai.
const errorHandler = require('./middleware/errorHandler.js')

app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});


app.use('/webhook', webhookRouter);
app.post('/test', (req, res) => {
    logger.info("TEST ROUTE HIT");
    res.json({
        success: true
    });
});


app.use(errorHandler);

// postgres database connection
pool.query()
    .then(() =>{
        logger.info('Connected to the database');
    })
    .catch((err) => {
        logger.error('Error connecting to the database', err);
    });

// redis connection  
redisClient.on("connect", ()=>{
    logger.info("Connected to Redis");
}); 
redisClient.on("error",(err)=>{
    logger.error("Error connecting to Redis", err);
});


// bullmq queue processor



app.listen(5000, () => {
    logger.info('Server is running on port 5000');
});