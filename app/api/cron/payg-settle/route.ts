import { NextResponse } from "next/server";
import { settleAllPaygUsers } from "@/lib/billing/payg-settlement";

/**
 * GET /api/cron/payg-settle
 *
 * Vercel Cron route: settles monthly PAYG overage charges for Plus subscribers.
 * Secured by CRON_SECRET header (set in vercel.json authorization).
 *
 * Schedule this in vercel.json:
 *   { "path": "/api/cron/payg-settle", "schedule": "0 1 1 * *" }
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await settleAllPaygUsers();
    console.log("PAYG settlement cron completed:", result);
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PAYG settlement cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
