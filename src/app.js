// app.js consist Express app, middleware, routes


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');  

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
}));

const { swaggerUi, swaggerSpec } = require('./docs/swagger');
const authRoutes = require('./routes/auth');
const rateLimiter = require('./middleware/ratelimiter.js');
const webhookRouter = require('./routes/webhook');
const healthRoutes = require('./routes/health.js');
const bullBoard = require('./docs/bullboard');
const logger = require('./logger/logger.js');
const errorHandler = require('./middleware/errorHandler.js');
const dlqRoutes = require('./routes/dlq');

app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/webhook')) {
            req.rawBody = Buffer.from(buf);
        }
    },
}));

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

app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use('/webhook', webhookRouter);
app.use('/admin/queues', bullBoard);
app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/webhook', dlqRoutes);

// MUST BE LAST
app.use(errorHandler);

module.exports = app;