const crypto = require('crypto');

function verifySignature(req, res, next) {
    try {
        const signatureHeader =
            req.headers['x-webhook-signature'];

        const timestampHeader =
            req.headers['x-webhook-timestamp'];

        const secret = process.env.WEBHOOK_SECRET;

        const tolerance = Number(
            process.env.WEBHOOK_TOLERANCE_SECONDS || 300
        );

        if (!secret) {
            req.log?.error(
                'Webhook secret is not defined in environment variables'
            );

            return res.status(500).json({
                success: false,
                message: 'Webhook secret is not configured',
            });
        }

        if (!signatureHeader || !timestampHeader) {
            req.log?.warn(
                'Missing webhook signature or timestamp'
            );

            return res.status(401).json({
                success: false,
                message: 'Missing webhook signature or timestamp',
            });
        }

        if (!req.rawBody) {
            req.log?.error(
                'Missing raw body for signature verification'
            );

            return res.status(400).json({
                success: false,
                message: 'Raw request body is unavailable',
            });
        }

        const timestamp = Number(timestampHeader);

        if (!Number.isInteger(timestamp)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook timestamp',
            });
        }

        // Replay protection
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const age = Math.abs(
            currentTimestamp - timestamp
        );

        if (age > tolerance) {
            return res.status(401).json({
                success: false,
                message: 'Webhook timestamp is outside the allowed window',
            });
        }

        const receivedSignature =
            signatureHeader.startsWith('sha256=')
                ? signatureHeader.slice('sha256='.length)
                : signatureHeader;

        // HMAC-SHA256 = 64 hexadecimal characters
        if (!/^[a-fA-F0-9]{64}$/.test(receivedSignature)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature format',
            });
        }

        const signedPayload =
            `${timestamp}.${req.rawBody}`;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');

        const expectedBuffer =
            Buffer.from(expectedSignature, 'hex');

        const receivedBuffer =
            Buffer.from(receivedSignature, 'hex');

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer
            )
        ) {
            req.log?.warn(
                'Webhook signature verification failed'
            );

            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature',
            });
        }

        // Signature is valid
        next();

    } catch (error) {
        req.log?.error(
            error,
            'Error occurred while verifying webhook signature'
        );

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

module.exports = verifySignature;