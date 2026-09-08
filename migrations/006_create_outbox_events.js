exports.up = (pgm) => {
    pgm.createTable('outbox_events', {
        id: {
            type: 'serial',
            primaryKey: true,
        },

        webhook_event_id: {
            type: 'integer',
            notNull: true,
            references: 'webhook_events(id)',
            onDelete: 'CASCADE',
        },

        event_id: {
            type: 'varchar(255)',
            notNull: true,
        },

        payload: {
            type: 'jsonb',
            notNull: true,
        },

        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'pending',
        },

        attempts: {
            type: 'integer',
            notNull: true,
            default: 0,
        },

        last_error: {
            type: 'text',
        },

        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },

        published_at: {
            type: 'timestamp',
        },
    });

    pgm.addConstraint(
        'outbox_events',
        'outbox_events_webhook_event_id_unique',
        {
            unique: ['webhook_event_id'],
        }
    );

    pgm.createIndex('outbox_events', 'status');
};

exports.down = (pgm) => {
    pgm.dropTable('outbox_events');
};