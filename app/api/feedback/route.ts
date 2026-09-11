import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbacks } from "@/db/schema";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, rating, message, email, isAnonymous } = body;

    // Validate required fields ("email isnt optional")
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
    }

    // Ensure table exists on Neon DB
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "feedback" (
        "id" text PRIMARY KEY,
        "category" text NOT NULL,
        "rating" integer,
        "message" text NOT NULL,
        "email" text NOT NULL,
        "user_id" text REFERENCES "user"("id"),
        "is_anonymous" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Ensure column exists if table was created previously without is_anonymous
    await db.execute(sql`
      ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "is_anonymous" boolean DEFAULT false NOT NULL;
    `);

    // Get optional logged in user session
    let userId: string | undefined = undefined;
    if (!isAnonymous) {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (session?.user?.id) {
          userId = session.user.id;
        }
      } catch {
        // Ignore if unauthenticated
      }
    }

    const id = `fb_${crypto.randomUUID()}`;

    await db.insert(feedbacks).values({
      id,
      category: category || "general",
      rating: typeof rating === "number" ? rating : null,
      message: message.trim(),
      email: email.trim(),
      userId: userId || null,
      isAnonymous: Boolean(isAnonymous),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
