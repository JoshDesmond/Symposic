import { UUID } from 'crypto';
import dotenv from 'dotenv';
import pgPromise from 'pg-promise';

dotenv.config();

if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('DB_USER or DB_PASSWORD is not set. Check that .env file is configured');
  process.exit(1);
}

const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME || 'symposic';
const port = process.env.DB_PORT || '5432';
const pgp = pgPromise();
export const db = pgp(`postgres://${username}:${password}@${host}:${port}/${database}`);


// Example Query Function
export async function getUserById(userId: UUID): Promise<any> {
  return db.oneOrNone(
    'SELECT * FROM profiles WHERE profile_id = $1',
    [userId]
  );
}

// Example Utility Query
export async function getAllUsers(): Promise<any[]> {
  return db.any('SELECT * FROM profiles');
};

export async function closeDatabase() {
  pgp.end();
}
