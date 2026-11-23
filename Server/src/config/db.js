import { connect, disconnect } from '../db/odm.js';

/**
 * Connects to MySQL / MariaDB (e.g. Hostinger database).
 * Configure with DATABASE_URL=mysql://user:pass@host:3306/dbname
 * or DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
 * USE_MEMORY_DB=true runs a temporary in-memory database (dev/testing only).
 */
const env = (...names) => names.map((n) => process.env[n]).find((v) => v !== undefined && v !== '');

export async function connectDB() {
  const url = env('DATABASE_URL', 'MYSQL_URL');
  const host = env('DB_HOST', 'MYSQL_HOST', 'DB_HOSTNAME') || (env('DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE') ? 'localhost' : undefined);
  const database = env('DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE');
  const dbKeys = Object.keys(process.env).filter((k) => /^(DB_|MYSQL|DATABASE)/i.test(k));
  if (dbKeys.length) console.log(`🔎 Database settings found: ${dbKeys.join(', ')}`);
  const hasMysql = url || (host && database);
  const memory = process.env.USE_MEMORY_DB === 'true' || !hasMysql;
  if (memory && process.env.NODE_ENV === 'production' && process.env.USE_MEMORY_DB !== 'true') {
    throw new Error('No database configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME (or DATABASE_URL).');
  }
  const info = await connect({
    memory,
    url,
    host,
    port: env('DB_PORT', 'MYSQL_PORT'),
    user: env('DB_USER', 'DB_USERNAME', 'MYSQL_USER'),
    password: env('DB_PASSWORD', 'DB_PASS', 'MYSQL_PASSWORD'),
    database,
    prefix: process.env.DB_TABLE_PREFIX || '',
  });
  if (memory) console.log('⚠️  Using in-memory database (data is lost on restart).');
  else console.log(`✅ MySQL connected: ${info}`);
}

export async function disconnectDB() {
  await disconnect();
}
