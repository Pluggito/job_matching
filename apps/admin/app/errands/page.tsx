import {
  db,
  errands,
  errandDisputes,
  employerProfiles,
  workerProfiles,
  users,
  eq,
  desc,
  sql,
} from "@repo/db";
import ErrandsOperationsClient, {
  AdminErrandItem,
  AdminDisputeItem,
} from "./ErrandsOperationsClient";

export const dynamic = "force-dynamic";

export default async function AdminErrandsPage() {
  // 1. Fetch all errands with employer and worker profile info
  const errandRows = await db
    .select({
      id: errands.id,
      title: errands.title,
      type: errands.type,
      status: errands.status,
      description: errands.description,
      locationState: errands.locationState,
      locationArea: errands.locationArea,
      address: errands.address,
      budgetKobo: errands.budgetKobo,
      taskPriceKobo: errands.taskPriceKobo,
      creationFeeKobo: errands.creationFeeKobo,
      workerPayoutKobo: errands.workerPayoutKobo,
      deadline: errands.deadline,
      requiredProof: errands.requiredProof,
      openedAt: errands.openedAt,
      claimedAt: errands.claimedAt,
      proofSubmittedAt: errands.proofSubmittedAt,
      completedAt: errands.completedAt,
      cancelledAt: errands.cancelledAt,
      cancelReason: errands.cancelReason,
      revisionRequestedAt: errands.revisionRequestedAt,
      revisionNotes: errands.revisionNotes,
      createdAt: errands.createdAt,
      employerBusinessName: employerProfiles.businessName,
      employerEmail: users.email,
      workerId: workerProfiles.id,
      workerCategory: workerProfiles.category,
    })
    .from(errands)
    .innerJoin(employerProfiles, eq(errands.employerId, employerProfiles.id))
    .innerJoin(users, eq(employerProfiles.userId, users.id))
    .leftJoin(workerProfiles, eq(errands.claimedByWorkerId, workerProfiles.id))
    .orderBy(desc(errands.createdAt));

  // 2. Fetch all disputes with initiator email
  const disputeRows = await db
    .select({
      id: errandDisputes.id,
      errandId: errandDisputes.errandId,
      raisedByUserId: errandDisputes.raisedByUserId,
      initiatorRole: errandDisputes.initiatorRole,
      reason: errandDisputes.reason,
      description: errandDisputes.description,
      evidenceUrls: errandDisputes.evidenceUrls,
      status: errandDisputes.status,
      employerRefundKobo: errandDisputes.employerRefundKobo,
      workerPayoutKobo: errandDisputes.workerPayoutKobo,
      resolutionNotes: errandDisputes.resolutionNotes,
      resolvedAt: errandDisputes.resolvedAt,
      createdAt: errandDisputes.createdAt,
      initiatorEmail: users.email,
    })
    .from(errandDisputes)
    .innerJoin(users, eq(errandDisputes.raisedByUserId, users.id))
    .orderBy(desc(errandDisputes.createdAt));

  const initialErrands: AdminErrandItem[] = errandRows.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    description: e.description,
    locationState: e.locationState,
    locationArea: e.locationArea,
    address: e.address,
    budgetKobo: e.budgetKobo,
    taskPriceKobo: e.taskPriceKobo,
    creationFeeKobo: e.creationFeeKobo,
    workerPayoutKobo: e.workerPayoutKobo,
    deadline: e.deadline.toISOString(),
    requiredProof: e.requiredProof,
    openedAt: e.openedAt?.toISOString() || null,
    claimedAt: e.claimedAt?.toISOString() || null,
    proofSubmittedAt: e.proofSubmittedAt?.toISOString() || null,
    completedAt: e.completedAt?.toISOString() || null,
    cancelledAt: e.cancelledAt?.toISOString() || null,
    cancelReason: e.cancelReason,
    revisionRequestedAt: e.revisionRequestedAt?.toISOString() || null,
    revisionNotes: e.revisionNotes,
    createdAt: e.createdAt.toISOString(),
    employerBusinessName: e.employerBusinessName,
    employerEmail: e.employerEmail,
    workerId: e.workerId,
    workerCategory: e.workerCategory,
  }));

  const initialDisputes: AdminDisputeItem[] = disputeRows.map((d) => ({
    id: d.id,
    errandId: d.errandId,
    initiatorId: d.raisedByUserId,
    initiatorRole: d.initiatorRole || "EMPLOYER",
    reason: d.reason,
    description: d.description || "",
    evidenceUrls: d.evidenceUrls || [],
    status: d.status,
    refundKobo: d.employerRefundKobo,
    payoutKobo: d.workerPayoutKobo,
    resolutionNotes: d.resolutionNotes,
    resolvedAt: d.resolvedAt?.toISOString() || null,
    createdAt: d.createdAt.toISOString(),
    initiatorEmail: d.initiatorEmail,
  }));

  return (
    <ErrandsOperationsClient
      initialErrands={initialErrands}
      initialDisputes={initialDisputes}
    />
  );
}
