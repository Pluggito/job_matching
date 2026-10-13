import {
  db,
  hiringRequests,
  employerProfiles,
  users,
  selections,
  workerProfiles,
  payments,
  eq,
  desc,
} from "@repo/db";
import HireRequestsView, {
  HiringRequestItem,
  ShortlistedWorker,
} from "./HireRequestsView";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  // Query all hiring requests with employer details
  const reqRows = await db
    .select({
      id: hiringRequests.id,
      title: hiringRequests.title,
      category: hiringRequests.category,
      description: hiringRequests.description,
      locationState: hiringRequests.locationState,
      locationArea: hiringRequests.locationArea,
      budgetMin: hiringRequests.budgetMin,
      budgetMax: hiringRequests.budgetMax,
      workersNeeded: hiringRequests.workersNeeded,
      status: hiringRequests.status,
      createdAt: hiringRequests.createdAt,
      employerName: employerProfiles.businessName,
      employerEmail: users.email,
    })
    .from(hiringRequests)
    .innerJoin(employerProfiles, eq(hiringRequests.employerId, employerProfiles.id))
    .innerJoin(users, eq(employerProfiles.userId, users.id))
    .orderBy(desc(hiringRequests.createdAt));

  // Query all selections joined with workerProfiles and payments
  const selRows = await db
    .select({
      selectionId: selections.id,
      hiringRequestId: selections.hiringRequestId,
      selectionStatus: selections.status,
      feeAmount: selections.feeAmount,
      workerProfileId: workerProfiles.id,
      workerCategory: workerProfiles.category,
      skills: workerProfiles.skills,
      location: workerProfiles.location,
      expectedPay: workerProfiles.expectedPay,
      profileData: workerProfiles.profileData,
      workerEmail: users.email,
      paymentStatus: payments.status,
      paymentAdminId: payments.adminId,
      paymentVerifiedAt: payments.verifiedAt,
    })
    .from(selections)
    .innerJoin(workerProfiles, eq(selections.workerProfileId, workerProfiles.id))
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .leftJoin(payments, eq(selections.id, payments.selectionId));

  // Group selections by hiringRequestId
  const groupedCandidates = new Map<string, ShortlistedWorker[]>();
  for (const s of selRows) {
    const list = groupedCandidates.get(s.hiringRequestId) || [];
    const pData = (s.profileData as Record<string, any>) || {};
    list.push({
      selectionId: s.selectionId,
      workerProfileId: s.workerProfileId,
      workerName: pData.fullName || s.workerEmail.split("@")[0] || "Worker",
      workerEmail: s.workerEmail,
      workerCategory: s.workerCategory,
      skills: s.skills || [],
      location: s.location || "Nigeria",
      expectedPay: s.expectedPay,
      selectionStatus: s.selectionStatus,
      feeAmount: s.feeAmount || 50000,
      paymentStatus: s.paymentStatus || null,
      paymentAdminId: s.paymentAdminId || null,
      paymentVerifiedAt: s.paymentVerifiedAt ? s.paymentVerifiedAt.toISOString() : null,
      contactPhone: pData.contactPhone || null,
      contactEmail: pData.email || null,
      nin: pData.nin || null,
    });
    groupedCandidates.set(s.hiringRequestId, list);
  }

  const formattedRequests: HiringRequestItem[] = reqRows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    employerName: r.employerName,
    employerEmail: r.employerEmail,
    locationState: r.locationState,
    locationArea: r.locationArea,
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    workersNeeded: r.workersNeeded,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    candidates: groupedCandidates.get(r.id) || [],
  }));

  return <HireRequestsView requests={formattedRequests} />;
}
