// quick test script to verify PostgreSQL connection using DB_URL from .env
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DB_URL || '';

if (!connectionString) {
  console.error('DB_URL not set in .env');
  process.exit(2);
}

(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW() as now');
    console.log('Connected to DB, server time:', res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to DB:', err.message || err);
    process.exit(1);
  }
})();
