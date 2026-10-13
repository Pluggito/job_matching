import {
  db,
  placements,
  selections,
  workerProfiles,
  employerProfiles,
  users,
  removalNotices,
  replacementRequests,
  eq,
  desc,
} from "@repo/db";
import PlacementsManagerView, {
  PlacementItem,
  RemovalNoticeItem,
  ReplacementRequestItem,
} from "./PlacementsManagerView";

export const dynamic = "force-dynamic";

export default async function PlacementsPage() {
  // Query all placements with related selection, worker, employer, and user info
  const placementRows = await db
    .select({
      id: placements.id,
      selectionId: placements.selectionId,
      startDate: placements.startDate,
      status: placements.status,
      replacementDeadline: placements.replacementDeadline,
      workerId: workerProfiles.id,
      workerCategory: workerProfiles.category,
      workerProfileData: workerProfiles.profileData,
      workerEmail: users.email,
      employerId: employerProfiles.id,
      employerName: employerProfiles.businessName,
    })
    .from(placements)
    .innerJoin(selections, eq(placements.selectionId, selections.id))
    .innerJoin(workerProfiles, eq(selections.workerProfileId, workerProfiles.id))
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .innerJoin(employerProfiles, eq(selections.employerProfileId, employerProfiles.id))
    .orderBy(desc(placements.startDate));

  // Query all removal notices
  const allNotices = await db
    .select()
    .from(removalNotices)
    .orderBy(desc(removalNotices.createdAt));

  // Query all replacement requests
  const allReplacements = await db
    .select()
    .from(replacementRequests)
    .orderBy(desc(replacementRequests.createdAt));

  // Map notices by placementId
  const noticesMap = new Map<string, RemovalNoticeItem[]>();
  for (const n of allNotices) {
    const list = noticesMap.get(n.placementId) || [];
    list.push({
      id: n.id,
      noticeDate: n.noticeDate.toISOString(),
      reason: n.reason,
      createdAt: n.createdAt.toISOString(),
    });
    noticesMap.set(n.placementId, list);
  }

  // Map replacements by placementId
  const replacementsMap = new Map<string, ReplacementRequestItem[]>();
  for (const r of allReplacements) {
    const list = replacementsMap.get(r.placementId) || [];
    list.push({
      id: r.id,
      reason: r.reason,
      dueAt: r.dueAt ? r.dueAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    });
    replacementsMap.set(r.placementId, list);
  }

  const formattedPlacements: PlacementItem[] = placementRows.map((p) => {
    const pData = (p.workerProfileData as Record<string, any>) || {};
    return {
      id: p.id,
      selectionId: p.selectionId,
      startDate: p.startDate.toISOString(),
      status: p.status,
      replacementDeadline: p.replacementDeadline.toISOString(),
      workerName: pData.fullName || p.workerEmail.split("@")[0] || "Worker",
      workerCategory: p.workerCategory,
      employerName: p.employerName,
      employerEmail: "",
      removalNotices: noticesMap.get(p.id) || [],
      replacementRequests: replacementsMap.get(p.id) || [],
    };
  });

  return <PlacementsManagerView initialPlacements={formattedPlacements} />;
}
