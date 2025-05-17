import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

const config = defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL ?? 'postgress://postgres:password@localhost:5432/mydb',
  },
});

export default config;
