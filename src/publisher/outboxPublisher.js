const pool = require('../config/db');
const webhookQueue = require('../queue/webhookQueue');
const logger = require('../logger/logger.js');

async function publishOutboxEvents() {
    const client = await pool.connect();

    let events = [];

    try {
        /*
         * Step 1:
         * Pick pending events and lock them.
         *
         * SKIP LOCKED allows multiple publisher instances
         * to work without picking the same rows.
         */
        await client.query('BEGIN');

        const result = await client.query(`
            SELECT
                id,
                webhook_event_id,
                event_id,
                payload
            FROM outbox_events
            WHERE status = 'pending'
            ORDER BY id
            FOR UPDATE SKIP LOCKED
            LIMIT 10
        `);

        events = result.rows;

        /*
         * We don't keep the DB transaction open while
         * publishing to Redis.
         */
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        logger.error(
            error,
            'Failed to fetch outbox events'
        );

        throw error;
    } finally {
        client.release();
    }

    /*
     * Step 2:
     * Publish each event to BullMQ.
     */
    for (const event of events) {
        try {
            await webhookQueue.add(
                'process-webhook',
                {
                    webhookEventId: event.webhook_event_id,
                    eventId: event.event_id,
                    payload: event.payload,
                },
                {
                    /*
                     * Deterministic job ID.
                     * Same outbox event → same BullMQ job ID.
                     */
                    jobId: `outbox-${event.id}`,

                    attempts: 3,

                    backoff: {
                        type: 'fixed',
                        delay: 5000,
                    },
                }
            );

            /*
             * Step 3:
             * BullMQ accepted the job.
             * Now mark the outbox event as published.
             */
            await pool.query(
                `
                UPDATE outbox_events
                SET
                    status = 'published',
                    attempts = attempts + 1,
                    published_at = CURRENT_TIMESTAMP
                WHERE id = $1
                  AND status = 'pending'
                `,
                [event.id]
            );

            logger.info(
                {
                    outboxEventId: event.id,
                    webhookEventId: event.webhook_event_id,
                    eventId: event.event_id,
                },
                'Outbox event published to BullMQ'
            );

        } catch (error) {

            /*
             * BullMQ publish failed.
             * Keep the event pending so the next polling cycle
             * can try again.
             */
            await pool.query(
                `
                UPDATE outbox_events
                SET
                    attempts = attempts + 1,
                    last_error = $2
                WHERE id = $1
                `,
                [event.id, error.message]
            );

            logger.error(
                {
                    outboxEventId: event.id,
                    eventId: event.event_id,
                    error: error.message,
                },
                'Failed to publish outbox event'
            );
        }
    }
}

module.exports = {
    publishOutboxEvents,
};