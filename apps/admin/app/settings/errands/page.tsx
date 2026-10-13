import { db, auditLogs, eq, desc } from "@repo/db";
import { getErrandPricingSettings } from "@/lib/actions";
import ErrandSettingsClient, { AuditHistoryEntry } from "./ErrandSettingsClient";

export const dynamic = "force-dynamic";

export default async function ErrandSettingsPage() {
  const initialSettings = await getErrandPricingSettings();

  const rawAudit = await db
    .select({
      id: auditLogs.id,
      adminEmail: auditLogs.adminEmail,
      action: auditLogs.action,
      reason: auditLogs.reason,
      createdAt: auditLogs.createdAt,
      metadata: auditLogs.metadata,
    })
    .from(auditLogs)
    .where(eq(auditLogs.targetType, "PLATFORM_SETTINGS"))
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  const auditHistory: AuditHistoryEntry[] = rawAudit.map((a) => ({
    id: a.id,
    adminEmail: a.adminEmail,
    action: a.action,
    reason: a.reason,
    createdAt: a.createdAt.toISOString(),
    metadata: a.metadata,
  }));

  return (
    <ErrandSettingsClient
      initialSettings={initialSettings}
      auditHistory={auditHistory}
    />
  );
}
