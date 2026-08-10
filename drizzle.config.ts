import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Next.js convention is to put local secrets in .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
