require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
app.set("trust proxy", 1);
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies to be sent
}))
const {swaggerUi,swaggerSpec} = require('./docs/swagger');
app.use(
    '/docs', 
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
const authRoutes = require("./routes/auth");
const rateLimiter = require('./middleware/rateLimiter.js');
const webhookRouter = require('./routes/webhook');
const healthRoutes = require('./routes/health.js');
const pool = require('./config/db');
const redisClient =require('./config/redis');
const bullBoard = require("./docs/bullboard");
const logger = require('./logger/logger.js')  // ab jaha console hai waha logger kar do and log ki jgh info kar do. aur error ki jgh error kar do. aur log file ka naam loger.js hai.
const errorHandler = require('./middleware/errorHandler.js')
const dlqRoutes = require("./routes/dlq");


app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: null,
      },
    },
  })
);
app.use(rateLimiter);
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
app.use("/admin/queues", bullBoard);

app.use("/auth", authRoutes);
app.use("/health",healthRoutes);
app.use(errorHandler);
app.use("/webhook", dlqRoutes);
// postgres database connection
pool.connect()
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});