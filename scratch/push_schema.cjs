require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log("Connecting to database...");
    await pool.query(`
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'user';
    `);
    console.log("Successfully added 'role' column to 'user' table!");
    await pool.end();
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
