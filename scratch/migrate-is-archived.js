const fs = require("fs");
const path = require("path");
const { neon } = require(path.join(process.cwd(), "node_modules/@neondatabase/serverless"));

const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
let databaseUrl = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    databaseUrl = line.split("=").slice(1).join("=").trim().replace(/^"|"$/g, "");
  }
}

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log("Adding is_archived column to project table...");
  await sql`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false;`;
  console.log("Successfully added is_archived column!");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
