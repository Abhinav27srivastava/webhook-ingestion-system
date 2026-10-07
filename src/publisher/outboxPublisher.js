const pool = require('../config/db');
const webhookQueue = require('../queue/webhookQueue');
const logger = require('../logger/logger.js');

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 10;
const CLAIM_TIMEOUT_MINUTES = 5;


/*
 * Recover events that got stuck in "publishing".
 *
 * This can happen if the publisher crashes after
 * claiming an event but before publishing it to BullMQ.
 */
async function recoverStalePublishingEvents() {
    const result = await pool.query(
        `
        UPDATE outbox_events
        SET
            status = 'pending',
            claimed_at = NULL,
            last_error = 'Recovered stale publishing event'
        WHERE status = 'publishing'
          AND claimed_at < NOW() - INTERVAL '${CLAIM_TIMEOUT_MINUTES} minutes'
        RETURNING id, event_id
        `
    );

    if (result.rowCount > 0) {
        logger.warn(
            {
                count: result.rowCount,
                events: result.rows,
            },
            'Recovered stale outbox events'
        );
    }
}


async function publishOutboxEvents() {
    await recoverStalePublishingEvents();
    const client = await pool.connect();

    let events;

    try {
        /*
         * Step 1:
         * Atomically claim pending events.
         *
         * Publisher 1 -> claims some rows
         * Publisher 2 -> skips those rows
         * Publisher 3 -> skips those rows
         *
         * pending -> publishing
         */
        await client.query('BEGIN');

        const result = await client.query(
            `
            WITH claimed AS (
                SELECT id
                FROM outbox_events
                WHERE status = 'pending'
                  AND attempts < $1
                ORDER BY id
                FOR UPDATE SKIP LOCKED
                LIMIT $2
            )
            UPDATE outbox_events AS outbox
            SET
                status = 'publishing',
                attempts = attempts + 1,
                claimed_at = CURRENT_TIMESTAMP
            FROM claimed
            WHERE outbox.id = claimed.id
            RETURNING
                outbox.id,
                outbox.webhook_event_id,
                outbox.event_id,
                outbox.payload
            `,
            [MAX_ATTEMPTS, BATCH_SIZE]
        );

        events = result.rows;

        /*
         * We don't keep the DB transaction open
         * while publishing to BullMQ.
         */
        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');

        logger.error(
            error,
            'Failed to claim outbox events'
        );

        throw error;

    } finally {
        client.release();
    }


    /*
     * Step 2:
     * Publish each claimed event to BullMQ.
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
                     *
                     * Same outbox event
                     * -> same BullMQ job ID.
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
             *
             * Now mark the outbox event as published.
             */
            await pool.query(
                `
                UPDATE outbox_events
                SET
                    status = 'published',
                    claimed_at = NULL,
                    published_at = CURRENT_TIMESTAMP,
                    last_error = NULL
                WHERE id = $1
                  AND status = 'publishing'
                `,
                [event.id]
            );


            logger.info(
                {
                    outboxEventId: event.id,
                    webhookEventId: event.webhook_event_id,
                    eventId: event.event_id,
                    jobId: `outbox-${event.id}`,
                },
                'Outbox event published to BullMQ'
            );

        } catch (error) {

            /*
             * BullMQ publish failed.
             *
             * Return the event to pending so the
             * next publisher cycle can retry it.
             */
            await pool.query(
                `
                UPDATE outbox_events
                SET
                    status = 'pending',
                    claimed_at = NULL,
                    last_error = $2
                WHERE id = $1
                  AND status = 'publishing'
                `,
                [event.id, error.message]
            );


            logger.error(
                {
                    outboxEventId: event.id,
                    webhookEventId: event.webhook_event_id,
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
    recoverStalePublishingEvents,
};