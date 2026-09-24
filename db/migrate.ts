import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";

async function runMigrate() {
  console.log("⏳ Running database migration statements...");
  try {
    const { db } = await import("../lib/db");
    const sqlPath = path.join(process.cwd(), "drizzle", "0003_chilly_typhoid_mary.sql");
    const content = fs.readFileSync(sqlPath, "utf-8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      // Modify CREATE TABLE to include IF NOT EXISTS
      let modifiedStmt = stmt.replace(/CREATE TABLE /gi, "CREATE TABLE IF NOT EXISTS ");
      modifiedStmt = modifiedStmt.replace(/CREATE INDEX /gi, "CREATE INDEX IF NOT EXISTS ");
      modifiedStmt = modifiedStmt.replace(/CREATE UNIQUE INDEX /gi, "CREATE UNIQUE INDEX IF NOT EXISTS ");
      
      try {
        await db.execute(sql.raw(modifiedStmt));
        console.log("  ✓ Executed statement");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes("already exists") ||
          msg.includes("duplicate key") ||
          msg.includes("42P07") ||
          msg.includes("42701")
        ) {
          console.log(`  ↷ Skipped (already exists): ${msg.split('\n')[0]}`);
        } else {
          console.error("  ❌ Statement error:", msg);
        }
      }
    }

    console.log("✅ Migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  }
}

runMigrate();
