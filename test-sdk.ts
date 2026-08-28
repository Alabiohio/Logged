import { Logged } from "@logged/sdk";
import dotenv from "dotenv";
import { LOGGED_BASE_URL } from "./lib/site-config";

dotenv.config({ path: ".env.local" });

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY || "test_api_key",
  baseUrl: LOGGED_BASE_URL,
  debug: true,
});

async function run() {
  console.log("Sending info log...");
  logger.info("Test application started", { version: "1.0.0" });

  console.log("Sending warning log...");
  logger.warn("This is a warning", { retries: 3 });

  console.log("Sending error log...");
  logger.error("Something went wrong", { test: true });

  console.log("Sending exception capture...");
  try {
    throw new Error("Simulated database failure");
  } catch (error) {
    logger.capture(error, { component: "database" });
  }

  console.log("Logs sent. Check the Logged application database/dashboard for the entries.");
}

run();
