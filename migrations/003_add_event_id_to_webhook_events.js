exports.up = (pgm) => {
  pgm.addColumn('webhook_events', {
    event_id: {
      type: 'varchar(255)',
    },
  });

  pgm.addConstraint(
    'webhook_events',
    'webhook_events_event_id_unique',
    {
      unique: ['event_id'],
    }
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'webhook_events',
    'webhook_events_event_id_unique'
  );

  pgm.dropColumn('webhook_events', 'event_id');
};