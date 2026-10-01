import dotenv from "dotenv";
import { Logged } from "@oheoco/logged";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.LOGGED_API_KEY;
const count = Number(process.argv[2] ?? 10_000);

if (!apiKey) {
  throw new Error("Set LOGGED_API_KEY in .env.local before running this script.");
}

if (!Number.isInteger(count) || count <= 0) {
  throw new Error("The log count must be a positive integer.");
}

const logger = new Logged({
  apiKey,
  debug: true,
  environment: "payg-test",
});

for (let index = 0; index < count; index++) {
  logger.info(`PAYG test log ${index + 1}`, {
    testRun: "payg",
    sequence: index + 1,
  });

  if ((index + 1) % 1000 === 0) {
    console.log(`Queued ${index + 1}/${count} logs`);
  }

  // Keep the SDK's fire-and-forget requests from exhausting Node's sockets.
  if ((index + 1) % 20 === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// The SDK sends requests in the background.
await new Promise((resolve) => setTimeout(resolve, 5000));
console.log(`Finished sending ${count} logs through the Logged SDK.`);
