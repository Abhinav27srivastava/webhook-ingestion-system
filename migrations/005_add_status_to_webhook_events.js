exports.up = (pgm) => {
  pgm.addColumn('webhook_events', {
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'received',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('webhook_events', 'status');
};