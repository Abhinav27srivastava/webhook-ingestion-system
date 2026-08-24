const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
} else if (!process.env.DB_HOST || !process.env.REDIS_HOST) {
  dotenv.config({
    path: '.env.test',
  });
}