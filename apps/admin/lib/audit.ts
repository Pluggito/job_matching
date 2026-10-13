import { db, auditLogs, desc, eq } from "@repo/db";

export interface AuditLogInput {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string; // "WORKER" | "SELECTION" | "PLACEMENT" | "RATING"
  targetId: string;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Inserts an immutable audit log entry.
 * Accepts either a transaction client `tx` or the root `db` client,
 * guaranteeing mutations and audit logs are committed atomically.
 * Explicitly exposes ONLY insert and read functions. No updates or deletes.
 */
export async function insertAuditLog(
  client: any,
  entry: AuditLogInput
) {
  let safeMetadata = entry.metadata ? { ...entry.metadata } : {};
  if ("nin" in safeMetadata && typeof safeMetadata.nin === "string") {
    safeMetadata.nin =
      safeMetadata.nin.length > 4
        ? `******${safeMetadata.nin.slice(-4)}`
        : "******";
  }

  const [inserted] = await client
    .insert(auditLogs)
    .values({
      adminId: entry.adminId,
      adminEmail: entry.adminEmail,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      reason: entry.reason || null,
      metadata: safeMetadata,
    })
    .returning();

  return inserted;
}

export interface GetAuditLogsOptions {
  targetType?: string;
  targetId?: string;
  adminId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Read-only helper to fetch audit logs.
 */
export async function getAuditLogs(options: GetAuditLogsOptions = {}) {
  const { targetType, targetId, adminId, limit = 50, offset = 0 } = options;

  let query = db.select().from(auditLogs).$dynamic();

  if (targetType) {
    query = query.where(eq(auditLogs.targetType, targetType));
  }
  if (targetId) {
    query = query.where(eq(auditLogs.targetId, targetId));
  }
  if (adminId) {
    query = query.where(eq(auditLogs.adminId, adminId));
  }

  return await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}
