require('dotenv').config();

const {
    publishOutboxEvents,
} = require('./outboxPublisher.js');

const logger = require('../logger/logger.js');

async function startPublisher() {
    logger.info('Outbox publisher started');

    while (true) {
        try {
            await publishOutboxEvents();
        } catch (error) {
            logger.error(
                error,
                'Outbox publisher loop error'
            );
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

startPublisher();