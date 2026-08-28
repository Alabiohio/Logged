"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logged } from "@logged/sdk";
import { LOGGED_BASE_URL } from "@/lib/site-config";

// Use NEXT_PUBLIC_LOGGED_API_KEY if available, or fallback to a string for testing
const apiKey = process.env.NEXT_PUBLIC_LOGGED_API_KEY || "test_api_key";

const logger = new Logged({
  apiKey,
  baseUrl: LOGGED_BASE_URL,
  debug: true,
});

export default function SDKTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Enable auto capture for browser errors and unhandled rejections
    logger.auto();

    return () => {
      logger.stopAutoCapture();
    };
  }, []);

  const handleThrowError = () => {
    throw new Error("This is a deliberate uncaught error for Phase 7 testing");
  };

  const handleRejectPromise = () => {
    Promise.reject(
      new Error("This is a deliberate unhandled promise rejection for Phase 7 testing")
    );
  };

  const handleRejectString = () => {
    Promise.reject("This is a string promise rejection");
  };

  const handleManualCapture = () => {
    try {
      throw new Error("This error was manually captured");
    } catch (e) {
      logger.capture(e, { extra: "context" });
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 font-sans max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Logged SDK Test Page</h1>
      
      <div className="flex flex-col gap-4">
        <div className="mb-4">
          <Link href="/sdk-test/console" className="text-blue-500 hover:underline">
            Go to Console Capture Tests →
          </Link>
        </div>
        <button
          onClick={handleThrowError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Throw Error
        </button>

        <button
          onClick={handleRejectPromise}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Reject Promise (Error)
        </button>

        <button
          onClick={handleRejectString}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Reject Promise (String)
        </button>

        <button
          onClick={handleManualCapture}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Capture Error Manually
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Open your browser's DevTools to see the network requests being sent
          to the Logged API. You should also verify these logs appear in the Logged Dashboard.
        </p>
      </div>
    </div>
  );
}
