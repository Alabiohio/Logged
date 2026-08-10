import crypto from "crypto";
import { db } from "@/lib/db";
import { projects, apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Hash an API key with SHA-256.
 * Used both at key creation and at every inbound request to avoid
 * storing or comparing raw keys.
 */
export function hashApiKey(rawKey: string): string {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Authenticate an inbound Bearer token.
 * Returns the matching project row and environment, or null if the key is invalid/unknown.
 */
export async function authenticateApiKey(rawKey: string) {
    const hash = hashApiKey(rawKey);

    const apiKeyRecord = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.keyHash, hash),
    });

    if (!apiKeyRecord) return null;

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, apiKeyRecord.projectId),
    });

    if (!project) return null;

    return { project, environment: apiKeyRecord.environment };
}
