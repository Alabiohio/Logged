import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { IngestionWorker } from "../lib/worker/ingestion-worker";

console.log("=========================================");
console.log("🚀 Starting Logged High-Scale Queue Worker");
console.log("=========================================");

const worker = new IngestionWorker({
    batchSize: 2000,
    pollIntervalMs: 100,
});

worker.start();

process.on("SIGINT", () => {
    console.log("\nReceived SIGINT. Gracefully shutting down worker...");
    worker.stop();
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\nReceived SIGTERM. Gracefully shutting down worker...");
    worker.stop();
    process.exit(0);
});
