const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { required } = require("../validation/webhookSchema");
const { describe } = require("zod/mini");
const { success, boolean } = require("zod");

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'Webhook Ingestion System API',
            version: 'v1.0.0',
            description:
                'Generic Webhook Ingestion System built with Express.js, PostgreSQL, Redis, BullMQ, JWT Authentication, RBAC, Docker and Swagger.',
        },

        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local development server',
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            parameters: {
                WebhookTimestamp: {
                    name: 'X-Webhook-Timestamp',
                    in: 'header',
                    required: true,
                    description:
                        'Unix timestamp used for webhook replay protection.',
                    schema: {
                        type: 'integer',
                    },
                    example: 1724438400,
                }, 
                WebhookSignature: {
                    name: 'X-Webhook-Signature',
                    in: 'header',
                    required: true,
                    description:
                        'HMAC-SHA256 signature in sha256=<digest> format.',
                    schema: {
                        type: 'string',
                    },
                    example:
                        'sha256=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                },
            },
            schemas: {
                WebhookEvent: {
                    type: 'object',

                    required: [
                        'id',
                        'type',
                        'timestamp',
                        'data',
                    ],

                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier of the webhook event.',
                            example: 'evt-12345',
                        },

                        type: {
                            type: 'string',
                            description: 'Type of the webhook event.',
                            example: 'resource.created',
                        },

                        timestamp: {
                            type: 'integer',
                            format: 'int64',
                            description:
                                'Unix timestamp representing when the event was created.',
                            example: 1724438400,
                        },

                        data: {
                            type: 'object',
                            description:
                                'Service-specific event payload.',
                            additionalProperties: true,
                        },
                    },
                },

                WebhookResponse: {
                    type: 'object',

                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },

                        duplicate: {
                            type: 'boolean',
                            example: false,
                        },

                        message: {
                            type: 'string',
                            example:
                                'Webhook received and queued successfully',
                        },

                        eventId: {
                            type: 'string',
                            example: 'evt-12345',
                        },

                        webhookEventId: {
                            type: 'integer',
                            example: 10,
                        },

                        jobId: {
                            type: 'string',
                            example: '25',
                        },
                    },
                },
            },
        },

        contact: {
            name: 'Abhinav Srivastava',
            email: 'srivastavaabhinav307@gmail.com',
            url: 'https://github.com/Abhinav27srivastava',
        },

        externalDocs: {
            description: 'GitHub Repository',
            url: 'https://github.com/Abhinav27srivastava/webhook-ingestion-system',
        },
    },

    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec,
};