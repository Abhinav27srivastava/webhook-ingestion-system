const pool = require('../config/db');

async function receiveWebhook(req, res, next) {
    const client = await pool.connect();

    try {
        const payload = req.body;

        // Primary identity of the webhook event
        // This also acts as the idempotency key.
        const eventId = payload.id;

        if (!eventId) {
            client.release();

            return res.status(400).json({
                success: false,
                message: 'Webhook event id is required'
            });
        }

        // Start database transaction
        await client.query('BEGIN');

        // Insert the webhook event
        const result = await client.query(
            `
            INSERT INTO webhook_events
                (payload, event_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (event_id) DO NOTHING
            RETURNING id, event_id
            `,
            [payload, eventId, 'received']
        );

        // Duplicate webhook
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();

            return res.status(200).json({
                success: true,
                duplicate: true,
                message: 'Webhook already received',
                eventId
            });
        }

        const webhookEvent = result.rows[0];

        // Store event in outbox in the SAME transaction
        await client.query(
            `
            INSERT INTO outbox_events
                (webhook_event_id, event_id, payload, status)
            VALUES ($1, $2, $3, $4)
            `,
            [
                webhookEvent.id,
                webhookEvent.event_id,
                payload,
                'pending'
            ]
        );

        // Commit both inserts together
        await client.query('COMMIT');

        client.release();

        req.log?.info(
            {
                webhookEventId: webhookEvent.id,
                eventId: webhookEvent.event_id
            },
            'Webhook event stored and added to outbox'
        );

        return res.status(202).json({
            success: true,
            duplicate: false,
            message: 'Webhook received successfully',
            eventId,
            webhookEventId: webhookEvent.id
        });

    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            req.log?.error(
                rollbackError,
                'Failed to rollback database transaction'
            );
        }

        client.release();
        next(error);
    }
}

module.exports = {
    receiveWebhook
};