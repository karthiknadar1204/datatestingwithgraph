import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './models/*',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});