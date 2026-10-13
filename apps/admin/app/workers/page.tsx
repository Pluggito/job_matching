import { db, workerProfiles, users, auditLogs, eq, desc } from "@repo/db";
import WorkerVerificationQueue, {
  WorkerQueueItem,
  WorkerAuditEntry,
} from "./WorkerVerificationQueue";
import { WorkerVerificationStatus } from "@repo/shared";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  // Query all workers joined with user credentials
  const rows = await db
    .select({
      id: workerProfiles.id,
      userId: workerProfiles.userId,
      email: users.email,
      category: workerProfiles.category,
      skills: workerProfiles.skills,
      experienceYears: workerProfiles.experienceYears,
      location: workerProfiles.location,
      locationState: workerProfiles.locationState,
      locationArea: workerProfiles.locationArea,
      expectedPay: workerProfiles.expectedPay,
      verificationStatus: workerProfiles.verificationStatus,
      ninVerificationStatus: workerProfiles.ninVerificationStatus,
      ninVerificationRef: workerProfiles.ninVerificationRef,
      profileData: workerProfiles.profileData,
      createdAt: users.createdAt,
    })
    .from(workerProfiles)
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .orderBy(desc(users.createdAt));

  // Query recent audit logs for workers
  const rawAudit = await db
    .select({
      id: auditLogs.id,
      adminEmail: auditLogs.adminEmail,
      action: auditLogs.action,
      targetId: auditLogs.targetId,
      reason: auditLogs.reason,
      createdAt: auditLogs.createdAt,
      metadata: auditLogs.metadata,
    })
    .from(auditLogs)
    .where(eq(auditLogs.targetType, "WORKER"))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  const formattedWorkers: WorkerQueueItem[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    email: r.email,
    category: r.category,
    skills: r.skills,
    experienceYears: r.experienceYears,
    location: r.location,
    locationState: r.locationState,
    locationArea: r.locationArea,
    expectedPay: r.expectedPay,
    verificationStatus: (r.verificationStatus as WorkerVerificationStatus) || "pending",
    ninVerificationStatus: r.ninVerificationStatus,
    ninVerificationRef: r.ninVerificationRef,
    profileData: r.profileData,
    createdAt: r.createdAt.toISOString(),
  }));

  const formattedAudit: WorkerAuditEntry[] = rawAudit.map((a) => ({
    id: a.id,
    adminEmail: a.adminEmail,
    action: a.action,
    targetId: a.targetId,
    reason: a.reason,
    createdAt: a.createdAt.toISOString(),
    metadata: a.metadata,
  }));

  return (
    <WorkerVerificationQueue
      initialWorkers={formattedWorkers}
      recentAuditLogs={formattedAudit}
    />
  );
}
