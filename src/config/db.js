// now we are going tto connect to the database using pg module

const { Pool } = require("pg");
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD
});

module.exports = pool;

