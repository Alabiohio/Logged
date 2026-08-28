import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiKey, hashApiKey } from "@/lib/auth/api-key";
import { validateLog, validateBatch } from "@/lib/logs/validate";
import { normalizeLog, normalizeBatch } from "@/lib/logs/normalize";
import { ingestLog, ingestBatch } from "@/lib/logs/ingest";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { userPreferences, users, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendErrorAlertEmail } from "@/lib/email";

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const MAX_BODY_BYTES = 100 * 1024; // 100 KB
const MAX_BATCH_SIZE = 100;        // maximum logs per batch request

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

        if (!projectOwner?.email) {
            console.log("No project owner email found for project:", project.id);
            return;
        }

        const emailNotificationsEnabled = preferences?.emailNotifications ?? true;
        const errorAlertsEnabled = preferences?.errorAlerts ?? true;

        if (!emailNotificationsEnabled || !errorAlertsEnabled) {
            console.log("Error alerts disabled for user:", project.userId, {
                emailNotifications: emailNotificationsEnabled,
                errorAlerts: errorAlertsEnabled,
            });
            return;
        }

        const logUrl = `${process.env.APP_URL || "http://localhost:3000"}/dashboard/projects/${project.id}/logs`;

        console.log("Sending error alert email to:", projectOwner.email, "for project:", project.name);

        await sendErrorAlertEmail({
            to: projectOwner.email,
            userName: projectOwner.name || "User",
            projectName: project.name,
            errorMessage: message,
            logUrl,
        });

        console.log("Error alert email sent successfully to:", projectOwner.email);
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

    // ── 3. Authenticate — look up project by hashed key ────────────
    const authResult = await authenticateApiKey(rawKey);
    if (!authResult) {
        return errorResponse(401, "INVALID_API_KEY", "Invalid or missing API key.");
    }
    const { project, environment } = authResult;

    // ── 4. Rate limit (keyed on hash, not raw key) ──────────────────
    const keyHash = hashApiKey(rawKey);
    const rl = checkRateLimit(keyHash);
    const rlHeaders = rateLimitHeaders(rl);

    if (!rl.allowed) {
        return errorResponse(429, "RATE_LIMITED", "Too many requests.", rlHeaders);
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

    // ── 6. Single vs. batch ─────────────────────────────────────────
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

        const normalized = normalizeBatch(valid, project, environment, request);
        const ids = await ingestBatch(normalized).catch(() => null);

        if (!ids) {
            return NextResponse.json({ success: false, error: "Failed to store logs." }, { status: 500, headers: corsHeaders() });
        }

        for (const log of normalized) {
            if (log.level === "error") {
                void maybeSendErrorAlert(project, log.level, log.message, log.id);
            }
        }

        return NextResponse.json(
            { success: true, accepted: ids.length, rejected: rejected.length },
            { status: 201, headers: { ...corsHeaders(), ...rlHeaders } }
        );
    } else {
        // ── Single log path ───────────────────────────────────────────
        const validation = validateLog(body);

        if (!validation.valid) {
            return errorResponse(400, validation.error.code, validation.error.message, rlHeaders);
        }

        const normalized = normalizeLog(validation.data, project, environment, request);
        const id = await ingestLog(normalized).catch(() => null);

        if (!id) {
            return NextResponse.json({ success: false, error: "Failed to store log." }, { status: 500, headers: corsHeaders() });
        }

        void maybeSendErrorAlert(project, normalized.level, normalized.message, id);

        return NextResponse.json(
            { success: true, id },
            { status: 201, headers: corsHeaders() }
        );
    }
}
