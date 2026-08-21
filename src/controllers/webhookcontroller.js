const express = require('express');
const pool = require('../config/db');
const webhookQueue = require('../queue/webhookQueue');


const router = express.Router();



async function receiveWebhook(req, res, next) {
    try {
        const payload = req.body;
        const eventId = req.headers['x-idempotency-key'];

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'idempotemcy key is required in the header'
            });
        }

        const result = await pool.query(
            'INSERT INTO webhook_events (payload, event_id,status) VALUES ($1, $2,$3) ON CONFLICT (event_id) DO NOTHING RETURNING id, event_id',
            [payload, eventId,'received']
        );

        if (result.rowCount === 0) {
            return res.status(200).json({
                  success: true,
                duplicate: true,
                message: 'Webhook already received',
                eventid: `${eventId}`
            });
        }
           const webhookEvent = result.rows[0];
// database row id to queue job 
       
          const job = await webhookQueue.add(
                    'process-webhook',
                         {
                webhookId: webhookEvent.id,
                eventId: webhookEvent.event_id,
                payload
                     },
                   {
                attempts: 3,
                backoff: {
                    type: 'fixed',
                    delay: 5000
                }
            }
        );
        console.log(
            `Webhook event ${webhookEvent.id} queued as BullMQ job ${job.id}`
        );

        return res.status(200).json({
            success: true, 
            duplicate: false,
            message: 'Webhook received and queued successfully',
            eventId,
            webhookEventId: webhookEvent.id,
            jobId: job.id,
             
        });
    } catch (error) {
        next(error);
    }
}

module.exports ={ receiveWebhook};