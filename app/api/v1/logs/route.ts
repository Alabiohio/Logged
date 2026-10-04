import { type NextRequest, NextResponse } from "next/server";
import { hashApiKey } from "@/lib/auth/api-key";
import { authenticateApiKeyCached } from "@/lib/auth/api-key-cache";
import { validateLog, validateBatch } from "@/lib/logs/validate";
import { normalizeLog, normalizeBatch } from "@/lib/logs/normalize";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { userPreferences, users, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendErrorAlertEmail } from "@/lib/email";
import { canAcceptLog } from "@/lib/billing/entitlements";
import { logQueue } from "@/lib/queue";
import { ingestionWorker } from "@/lib/worker/ingestion-worker";
import crypto from "crypto";

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const MAX_BODY_BYTES = 100 * 1024; // 100 KB
const MAX_BATCH_SIZE = 100;        // maximum logs per batch request

function generateLogId(): string {
    return `log_${crypto.randomUUID().replace(/-/g, "")}`;
}

// Ensure background worker is running for single-node / dev environments
if (process.env.NODE_ENV !== "test") {
    ingestionWorker.start();
}

// ------------------------------------------------------------------
// CORS helpers
// ------------------------------------------------------------------

const ALLOWED_ORIGIN = process.env.ALLOWED_LOG_ORIGINS ?? "*";

function corsHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

async function maybeSendErrorAlert(project: typeof projects.$inferSelect, level: string, message: string, logId: string) {
    if (level !== "error") return;

    try {
        const [projectOwner, preferences] = await Promise.all([
            db.query.users.findFirst({
                where: eq(users.id, project.userId),
                columns: { id: true, name: true, email: true },
            }),
            db.query.userPreferences.findFirst({
                where: eq(userPreferences.userId, project.userId),
            }),
        ]);

        if (!projectOwner?.email) return;

        const emailNotificationsEnabled = preferences?.emailNotifications ?? true;
        const errorAlertsEnabled = preferences?.errorAlerts ?? true;

        if (!emailNotificationsEnabled || !errorAlertsEnabled) return;

        const logUrl = `${process.env.APP_URL || "http://localhost:3000"}/dashboard/projects/${project.id}/logs`;

        await sendErrorAlertEmail({
            to: projectOwner.email,
            userName: projectOwner.name || "User",
            projectName: project.name,
            errorMessage: message,
            logUrl,
        });
    } catch (error) {
        console.error("Failed to send error alert email:", error);
    }
}

// ------------------------------------------------------------------
// Standardised error factory
// ------------------------------------------------------------------

function errorResponse(
    status: number,
    code: string,
    message: string,
    extra?: Record<string, string>
) {
    return NextResponse.json(
        { success: false, error: { code, message } },
        { status, headers: { ...corsHeaders(), ...(extra ?? {}) } }
    );
}

// ------------------------------------------------------------------
// Pre-flight
// ------------------------------------------------------------------

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders() });
}

// ------------------------------------------------------------------
// POST /api/v1/logs
// ------------------------------------------------------------------

export async function POST(request: NextRequest) {
    // ── 1. Body size guard ──────────────────────────────────────────
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
        return errorResponse(413, "PAYLOAD_TOO_LARGE", "Request body exceeds 100 KB limit.");
    }

    // ── 2. Extract & validate Bearer token ─────────────────────────
    const authHeader = request.headers.get("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match || !match[1]) {
        return errorResponse(401, "INVALID_API_KEY", "Invalid or missing API key.");
    }
    const rawKey = match[1].trim();

    // ── 3. Authenticate — fast cached lookup ───────────────────────
    const authResult = await authenticateApiKeyCached(rawKey);
    if (!authResult) {
        return errorResponse(401, "INVALID_API_KEY", "Invalid or missing API key.");
    }
    const { project, environment } = authResult;

    if (project.isArchived) {
        return errorResponse(403, "PROJECT_ARCHIVED", "This project is archived due to plan limits. Upgrade your plan to reactivate it.");
    }

    // ── 4. Rate limit ───────────────────────────────────────────────
    const keyHash = hashApiKey(rawKey);
    const rl = checkRateLimit(keyHash);
    const rlHeaders = rateLimitHeaders(rl);

    if (!rl.allowed) {
        return errorResponse(429, "RATE_LIMITED", "Too many requests.", rlHeaders);
    }

    // ── 4b. Plan limit / Entitlement check ──────────────────────────
    const entitlement = await canAcceptLog(project.userId);
    if (!entitlement.allowed) {
        let msg = "Log limit reached.";
        if (entitlement.reason === "PLAN_LIMIT_REACHED") {
            msg = "Free plan limit reached. Upgrade your plan.";
        } else if (entitlement.reason === "PAYG_DISABLED") {
            msg = "Log limit reached. Enable PAYG to continue.";
        } else if (entitlement.reason === "PAYG_LIMIT_REACHED") {
            msg = "Monthly PAYG spending limit reached.";
        }
        return errorResponse(429, entitlement.reason || "LIMIT_REACHED", msg, rlHeaders);
    }

    // ── 5. Parse body ───────────────────────────────────────────────
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    if (!body || typeof body !== "object") {
        return errorResponse(400, "INVALID_JSON", "Request body must be a JSON object.");
    }

    const bodyObj = body as Record<string, unknown>;

    // ── 6. Single vs. batch async ingestion ─────────────────────────
    if (Array.isArray(bodyObj.logs)) {
        // ── Batch path ───────────────────────────────────────────────
        const items = bodyObj.logs as unknown[];

        if (items.length === 0) {
            return errorResponse(400, "INVALID_LOG", "Batch 'logs' array must not be empty.");
        }
        if (items.length > MAX_BATCH_SIZE) {
            return errorResponse(
                400,
                "INVALID_LOG",
                `Batch size exceeds the limit of ${MAX_BATCH_SIZE} logs per request.`
            );
        }

        const { valid, rejected } = validateBatch(items);

        if (valid.length === 0) {
            return errorResponse(400, "INVALID_LOG", "All logs in the batch failed validation.", rlHeaders);
        }

        const batchEntitlement = await canAcceptLog(project.userId, valid.length);
        if (!batchEntitlement.allowed) {
            const message = batchEntitlement.reason === "PAYG_DISABLED"
                ? "Log limit reached. Enable PAYG to continue."
                : batchEntitlement.reason === "PAYG_LIMIT_REACHED"
                    ? "Monthly PAYG spending limit reached."
                    : "Log limit reached.";
            return errorResponse(429, batchEntitlement.reason || "LIMIT_REACHED", message, rlHeaders);
        }

        const normalized = normalizeBatch(valid, project, environment, request);
        const queueItems = normalized.map((log) => {
            const logId = generateLogId();
            if (log.level === "error") {
                void maybeSendErrorAlert(project, log.level, log.message, logId);
            }
            return {
                id: logId,
                log,
                userId: project.userId,
                receivedAt: Date.now(),
            };
        });

        const enqueueRes = await logQueue.enqueueBatch(queueItems);

        return NextResponse.json(
            {
                success: true,
                accepted: queueItems.length,
                rejected: rejected.length,
                jobId: enqueueRes.jobId,
                ids: queueItems.map((q) => q.id),
            },
            { status: 202, headers: { ...corsHeaders(), ...rlHeaders } }
        );
    } else {
        // ── Single log path ───────────────────────────────────────────
        const validation = validateLog(body);

        if (!validation.valid) {
            return errorResponse(400, validation.error.code, validation.error.message, rlHeaders);
        }

        const normalized = normalizeLog(validation.data, project, environment, request);
        const logId = generateLogId();

        if (normalized.level === "error") {
            void maybeSendErrorAlert(project, normalized.level, normalized.message, logId);
        }

        const enqueueRes = await logQueue.enqueueBatch([
            {
                id: logId,
                log: normalized,
                userId: project.userId,
                receivedAt: Date.now(),
            },
        ]);

        return NextResponse.json(
            { success: true, id: logId, jobId: enqueueRes.jobId },
            { status: 202, headers: { ...corsHeaders(), ...rlHeaders } }
        );
    }
}
