exports.up = (pgm) => {
  pgm.createTable('webhook_events', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    payload: {
      type: 'jsonb',
      notNull: true,
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('webhook_events');
};