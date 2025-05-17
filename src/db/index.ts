import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';

import { DB_URL } from '@/config';

const db = drizzle(DB_URL ?? 'postgress://postgres:password@localhost:5432/mydb');

export { db };
