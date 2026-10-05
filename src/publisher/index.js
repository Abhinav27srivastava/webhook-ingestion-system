require('dotenv').config();

const {
    publishOutboxEvents,
} = require('./outboxPublisher.js');
const pool = require('../config/db');  // because cleanup needs to be done in db
const logger = require('../logger/logger.js');
let lastCleanupAt = 0;
async function cleanupPublishedOutboxEvents(){
   const result = await pool.query(`  
    DELETE FROM outbox_events
    WHERE status = 'published'
    AND published_at < now() - INTERVAL '7 days'
   `);
   
   if (result.rowCount >0){   // result.rowCount gives number of rows deleted  and result.rowlength gives number of rows returned
    logger.info(`Cleaned up ${result.rowCount} published outbox events older than 7 days`);

   }
   return result;  
}

async function startPublisher() {
    logger.info('Outbox publisher started');

    while (true) {
        try {
            await publishOutboxEvents();

            // run cleanup once every hour 
            const now = Date.now();
            if (now - lastCleanupAt >= 60 * 60 * 1000){
                await cleanupPublishedOutboxEvents();
                lastCleanupAt = now;
            }
        } catch (error) {
            logger.error(
                error,
                'Outbox publisher loop error'
            );
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // means wait for 5 seconds before next iteration
    }
}

startPublisher();