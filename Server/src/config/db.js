import { connect, disconnect } from '../db/odm.js';

/**
 * Connects to MySQL / MariaDB (e.g. Hostinger database).
 * Configure with DATABASE_URL=mysql://user:pass@host:3306/dbname
 * or DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
 * USE_MEMORY_DB=true runs a temporary in-memory database (dev/testing only).
 */
export async function connectDB() {
  const url = process.env.DATABASE_URL;
  const hasMysql = url || (process.env.DB_HOST && process.env.DB_NAME);
  const memory = process.env.USE_MEMORY_DB === 'true' || !hasMysql;
  if (memory && process.env.NODE_ENV === 'production' && process.env.USE_MEMORY_DB !== 'true') {
    throw new Error('No database configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME (or DATABASE_URL).');
  }
  const info = await connect({
    memory,
    url,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    prefix: process.env.DB_TABLE_PREFIX || '',
  });
  if (memory) console.log('⚠️  Using in-memory database (data is lost on restart).');
  else console.log(`✅ MySQL connected: ${info}`);
}

export async function disconnectDB() {
  await disconnect();
}
