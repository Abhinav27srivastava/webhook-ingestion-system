const crypto = require('crypto');

function safeCompare(value, expected) {
    if (
        typeof value !== 'string' ||
        typeof expected !== 'string'
    ) {
        return false;
    }

    const valueBuffer = Buffer.from(value, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    if (valueBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        valueBuffer,
        expectedBuffer
    );
}

function bullboardAuth(req, res, next) {
    const username = process.env.BULL_BOARD_USERNAME;
    const password = process.env.BULL_BOARD_PASSWORD;

    if (!username || !password) {
        return res.status(500).json({
            success: false,
            message: 'Bull Board credentials are not configured',
        });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.set(
            'WWW-Authenticate',
            'Basic realm="Bull Board"'
        );

        return res.status(401).send('Authentication required');
    }

    const encodedCredentials =
        authHeader.slice('Basic '.length);

    let decodedCredentials;

    try {
        decodedCredentials = Buffer
            .from(encodedCredentials, 'base64')
            .toString('utf8');
    } catch (error) {
        res.set(
            'WWW-Authenticate',
            'Basic realm="Bull Board"'
        );

        return res.status(401).send('Invalid authentication');
    }

    const separatorIndex =
        decodedCredentials.indexOf(':');

    if (separatorIndex === -1) {
        res.set(
            'WWW-Authenticate',
            'Basic realm="Bull Board"'
        );

        return res.status(401).send('Invalid authentication');
    }

    const receivedUsername =
        decodedCredentials.slice(0, separatorIndex);

    const receivedPassword =
        decodedCredentials.slice(separatorIndex + 1);
    
    const validUsername = safeCompare(
        receivedUsername,
        username
    );

    const validPassword = safeCompare(
        receivedPassword,
        password
    );
    console.log('Received username:', receivedUsername);
    console.log('Username valid:', validUsername);
    console.log('Password valid:', validPassword);

    if (!validUsername || !validPassword) {
        res.set(
            'WWW-Authenticate',
            'Basic realm="Bull Board"'
        );

        return res.status(401).send('Invalid credentials');
    }

    next();
}

module.exports = bullboardAuth;