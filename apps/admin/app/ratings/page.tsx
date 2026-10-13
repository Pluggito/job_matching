import {
  db,
  ratings,
  placements,
  selections,
  workerProfiles,
  employerProfiles,
  users,
  eq,
  desc,
} from "@repo/db";
import RatingsModerationView, { RatingItem } from "./RatingsModerationView";

export const dynamic = "force-dynamic";

export default async function RatingsPage() {
  const rows = await db
    .select({
      id: ratings.id,
      placementId: ratings.placementId,
      score: ratings.score,
      feedback: ratings.feedback,
      moderated: ratings.moderated,
      createdAt: ratings.createdAt,
      workerCategory: workerProfiles.category,
      workerProfileData: workerProfiles.profileData,
      workerEmail: users.email,
      employerName: employerProfiles.businessName,
    })
    .from(ratings)
    .innerJoin(placements, eq(ratings.placementId, placements.id))
    .innerJoin(selections, eq(placements.selectionId, selections.id))
    .innerJoin(workerProfiles, eq(selections.workerProfileId, workerProfiles.id))
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .innerJoin(employerProfiles, eq(selections.employerProfileId, employerProfiles.id))
    .orderBy(desc(ratings.createdAt));

  const formatted: RatingItem[] = rows.map((r) => {
    const pData = (r.workerProfileData as Record<string, any>) || {};
    return {
      id: r.id,
      placementId: r.placementId,
      score: r.score,
      feedback: r.feedback,
      moderated: r.moderated,
      createdAt: r.createdAt.toISOString(),
      workerName: pData.fullName || r.workerEmail.split("@")[0] || "Worker",
      workerCategory: r.workerCategory,
      employerName: r.employerName,
    };
  });

  return <RatingsModerationView initialRatings={formatted} />;
}
