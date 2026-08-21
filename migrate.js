require('dotenv').config();

const { runner } = require('node-pg-migrate');

async function migrate() {
  await runner({
    databaseUrl: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'pgmigrations',
  });
}

migrate()
  .then(() => {
    console.log('Migrations completed successfully');
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });