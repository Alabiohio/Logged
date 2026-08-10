"use client";

import { useEffect, useState } from "react";
import { Logged } from "@logged/sdk";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_LOGGED_API_KEY || "test_api_key";

const logger = new Logged({
  apiKey,
  environment: "development",
  baseUrl: "http://localhost:3000",
  debug: true,
});

export default function ConsoleTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Enable console capture for testing Phase 8
    logger.interceptConsole();

    return () => {
      logger.stopConsoleInterception();
    };
  }, []);

  const handleSimpleLog = () => {
    console.log("Hello Logged");
  };

  const handleMultipleArgs = () => {
    const user = { id: "123", name: "Alice" };
    console.info("User:", user, "logged in at", new Date().toISOString());
  };

  const handleObjectWarn = () => {
    console.warn({
      component: "ConsoleTestPage",
      action: "handleObjectWarn",
      reason: "Slow API response",
      durationMs: 2400,
    });
  };

  const handleErrorObject = () => {
    const err = new Error("Payment failed due to insufficient funds");
    console.error(err);
  };

  const handleCircularObject = () => {
    const obj: any = { name: "Circular" };
    obj.self = obj;
    console.log("Circular object:", obj);
  };

  const handleSpam = () => {
    for (let i = 0; i < 50; i++) {
      console.log("Spamming logs", i);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 font-sans max-w-lg mx-auto space-y-6">
      <Link
          href="/sdk-test"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
          <ArrowLeft className="h-4 w-4" />
          Back to Auto Tests
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Console Capture Test</h1>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={handleSimpleLog}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
        >
          console.log (Simple)
        </button>

        <button
          onClick={handleMultipleArgs}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
        >
          console.info (Multiple Args)
        </button>

        <button
          onClick={handleObjectWarn}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium"
        >
          console.warn (Object)
        </button>

        <button
          onClick={handleErrorObject}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
        >
          console.error (Error Object)
        </button>

        <button
          onClick={handleCircularObject}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium"
        >
          console.log (Circular Object)
        </button>
        
        <button
          onClick={handleSpam}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
        >
          Trigger Spam (Rate Limit Test)
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p>
          Open your browser's DevTools to see the network requests being sent
          to the Logged API. You should also verify these logs appear in the Logged Dashboard.
        </p>
      </div>
    </div>
  );
}
