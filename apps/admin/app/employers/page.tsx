import {
  db,
  employerProfiles,
  users,
  hiringRequests,
  selections,
  placements,
  eq,
  desc,
  count,
} from "@repo/db";
import EmployersView, { EmployerDirectoryItem } from "./EmployersView";

export const dynamic = "force-dynamic";

export default async function EmployersPage() {
  const employers = await db
    .select({
      id: employerProfiles.id,
      userId: employerProfiles.userId,
      businessName: employerProfiles.businessName,
      businessType: employerProfiles.businessType,
      location: employerProfiles.location,
      hiringNeeds: employerProfiles.hiringNeeds,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(employerProfiles)
    .innerJoin(users, eq(employerProfiles.userId, users.id))
    .orderBy(desc(users.createdAt));

  // Query request counts per employer
  const requestCounts = await db
    .select({
      employerId: hiringRequests.employerId,
      total: count(hiringRequests.id),
    })
    .from(hiringRequests)
    .groupBy(hiringRequests.employerId);

  const reqMap = new Map<string, number>();
  for (const rc of requestCounts) {
    reqMap.set(rc.employerId, Number(rc.total));
  }

  // Query active placement counts per employer
  const activePlacements = await db
    .select({
      employerProfileId: selections.employerProfileId,
      total: count(placements.id),
    })
    .from(placements)
    .innerJoin(selections, eq(placements.selectionId, selections.id))
    .where(eq(placements.status, "ACTIVE"))
    .groupBy(selections.employerProfileId);

  const placeMap = new Map<string, number>();
  for (const ap of activePlacements) {
    placeMap.set(ap.employerProfileId, Number(ap.total));
  }

  const formatted: EmployerDirectoryItem[] = employers.map((e) => ({
    id: e.id,
    userId: e.userId,
    businessName: e.businessName,
    businessType: e.businessType || "INDIVIDUAL",
    email: e.email,
    location: e.location,
    hiringNeeds: e.hiringNeeds,
    totalRequests: reqMap.get(e.id) || 0,
    activePlacements: placeMap.get(e.id) || 0,
    createdAt: e.createdAt.toISOString(),
  }));

  return <EmployersView employers={formatted} />;
}
