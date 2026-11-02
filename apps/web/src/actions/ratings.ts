"use server";

import {
  db,
  ratings,
  errands,
  placements,
  selections,
  employerProfiles,
  workerProfiles,
  eq,
  and,
  sql,
} from "@repo/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export interface SubmitRatingInput {
  errandId?: string;
  placementId?: string;
  score: number;
  feedback?: string;
}

/**
 * Submit or update a rating & review for a completed errand or confirmed placement.
 */
export async function submitRatingAction(input: SubmitRatingInput) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Only employers can submit reviews." };
  }

  const score = Math.round(Number(input.score));
  if (!score || score < 1 || score > 5) {
    return { success: false, error: "Please provide a rating between 1 and 5 stars." };
  }

  const feedback = input.feedback?.trim() || null;

  try {
    // Errand rating branch
    if (input.errandId) {
      const [errand] = await db
        .select()
        .from(errands)
        .where(eq(errands.id, input.errandId))
        .limit(1);

      if (!errand) {
        return { success: false, error: "Errand not found." };
      }

      const [employer] = await db
        .select({ id: employerProfiles.id })
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, session.userId))
        .limit(1);

      if (!employer || errand.employerId !== employer.id) {
        return { success: false, error: "You can only rate errands you created." };
      }

      if (errand.status !== "completed") {
        return { success: false, error: "You can only rate an errand once it is marked completed." };
      }

      // Check if rating already exists
      const [existing] = await db
        .select()
        .from(ratings)
        .where(eq(ratings.errandId, input.errandId))
        .limit(1);

      let savedRating;
      if (existing) {
        const [updated] = await db
          .update(ratings)
          .set({
            score,
            feedback,
            moderated: false, // reset for moderation check
          })
          .where(eq(ratings.id, existing.id))
          .returning();
        savedRating = updated;
      } else {
        const [inserted] = await db
          .insert(ratings)
          .values({
            errandId: input.errandId,
            score,
            feedback,
            moderated: false,
          })
          .returning();
        savedRating = inserted;
      }

      // Notify the runner
      if (errand.claimedByWorkerId) {
        const [runnerProfile] = await db
          .select({ userId: workerProfiles.userId })
          .from(workerProfiles)
          .where(eq(workerProfiles.id, errand.claimedByWorkerId))
          .limit(1);

        if (runnerProfile?.userId) {
          await createNotification({
            userId: runnerProfile.userId,
            type: "RATING_RECEIVED",
            title: "New Review Received ⭐",
            content: `The employer left a ${score}-star review on "${errand.title}".`,
            link: `/dashboard/errands/${errand.id}`,
            tag: `rating-errand-${errand.id}`,
          });
        }
      }

      revalidatePath(`/employer/errands/${input.errandId}`);
      revalidatePath(`/employer/errands`);
      return { success: true, rating: savedRating };
    }

    // Placement rating branch
    if (input.placementId) {
      const [placement] = await db
        .select({
          id: placements.id,
          selectionId: placements.selectionId,
        })
        .from(placements)
        .where(eq(placements.id, input.placementId))
        .limit(1);

      if (!placement) {
        return { success: false, error: "Placement not found." };
      }

      const [selection] = await db
        .select({
          id: selections.id,
          employerProfileId: selections.employerProfileId,
          workerProfileId: selections.workerProfileId,
        })
        .from(selections)
        .where(eq(selections.id, placement.selectionId))
        .limit(1);

      if (!selection) {
        return { success: false, error: "Placement agreement not found." };
      }

      // Verify employer ownership
      const [emp] = await db
        .select({ id: employerProfiles.id })
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, session.userId))
        .limit(1);

      if (!emp || emp.id !== selection.employerProfileId) {
        return { success: false, error: "You can only rate candidates placed with your organization." };
      }

      // Check existing rating
      const [existing] = await db
        .select()
        .from(ratings)
        .where(eq(ratings.placementId, input.placementId))
        .limit(1);

      let savedRating;
      if (existing) {
        const [updated] = await db
          .update(ratings)
          .set({
            score,
            feedback,
            moderated: false,
          })
          .where(eq(ratings.id, existing.id))
          .returning();
        savedRating = updated;
      } else {
        const [inserted] = await db
          .insert(ratings)
          .values({
            placementId: input.placementId,
            score,
            feedback,
            moderated: false,
          })
          .returning();
        savedRating = inserted;
      }

      // Notify the worker
      const [workerProfile] = await db
        .select({ userId: workerProfiles.userId })
        .from(workerProfiles)
        .where(eq(workerProfiles.id, selection.workerProfileId))
        .limit(1);

      if (workerProfile?.userId) {
        await createNotification({
          userId: workerProfile.userId,
          type: "RATING_RECEIVED",
          title: "New Placement Rating ⭐",
          content: `Your employer rated your placement with ${score} stars.`,
          link: `/dashboard/profile`,
          tag: `rating-placement-${input.placementId}`,
        });
      }

      revalidatePath(`/employer/workers/${selection.workerProfileId}`);
      revalidatePath(`/employer/workers`);
      return { success: true, rating: savedRating };
    }

    return { success: false, error: "Missing errandId or placementId target." };
  } catch (err: any) {
    console.error("submitRatingAction error:", err);
    return { success: false, error: err?.message || "Failed to submit rating." };
  }
}

/**
 * Get existing rating for an errand or placement
 */
export async function getRatingForTargetAction(target: { errandId?: string; placementId?: string }) {
  try {
    if (target.errandId) {
      const [rating] = await db
        .select()
        .from(ratings)
        .where(eq(ratings.errandId, target.errandId))
        .limit(1);
      return { success: true, rating: rating || null };
    }

    if (target.placementId) {
      const [rating] = await db
        .select()
        .from(ratings)
        .where(eq(ratings.placementId, target.placementId))
        .limit(1);
      return { success: true, rating: rating || null };
    }

    return { success: false, error: "No target specified" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to fetch rating" };
  }
}
