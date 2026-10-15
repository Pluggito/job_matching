"use server";

import {
  db,
  placements,
  selections,
  payments,
  employerProfiles,
  workerProfiles,
  users,
  notifications,
  contactAccessLogs,
  eq,
  and,
  gte,
  sql,
} from "@repo/db";
import { getCurrentUser } from "./auth";
import { headers } from "next/headers";
import { sendPushToUser } from "@/server/services/pushNotifications";

export interface RevealContactResult {
  success: boolean;
  phone?: string;
  email?: string;
  error?: string;
}

export type RevealPhoneResult = RevealContactResult;

/**
 * Reveals a candidate's phone number AND email to an employer server-side.
 * Invariants:
 * - Requires verified agency fee payment on the placement's selection.
 * - Rate-limited in the database (max 5 reveals per 10 minutes per actor).
 * - Generic actor logging in contact_access_logs with fieldAccessed = 'PHONE_AND_EMAIL'.
 * - Worker notified in-app ONCE per placement on first reveal; subsequent views logged silently.
 * - Revealing phone number and email (never bank details under any circumstance).
 * - Replacement workers handled identically.
 */
export async function revealWorkerPhone(placementId: string): Promise<RevealContactResult> {
  const session = await getCurrentUser();
  if (!session || (session.role !== "EMPLOYER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Only employers or admins can access candidate phone numbers." };
  }

  if (!placementId) {
    return { success: false, error: "Placement ID is required." };
  }

  // 1. Fetch placement and selection
  const [placement] = await db
    .select({
      id: placements.id,
      selectionId: placements.selectionId,
      status: placements.status,
    })
    .from(placements)
    .where(eq(placements.id, placementId))
    .limit(1);

  if (!placement) {
    return { success: false, error: "Placement record not found." };
  }

  const [selection] = await db
    .select({
      id: selections.id,
      employerProfileId: selections.employerProfileId,
      workerProfileId: selections.workerProfileId,
      status: selections.status,
      termsAcceptedAt: selections.termsAcceptedAt,
    })
    .from(selections)
    .where(eq(selections.id, placement.selectionId))
    .limit(1);

  if (!selection) {
    return { success: false, error: "Associated placement selection not found." };
  }

  // 2. Worker Acceptance Check: Must have explicitly accepted the offer
  if (!selection.termsAcceptedAt) {
    return {
      success: false,
      error: "The candidate has not yet accepted this job offer. Direct contact details will unlock immediately once the candidate reviews and accepts.",
    };
  }

  // 3. Authorization check: if employer, must own the placement
  if (session.role === "EMPLOYER") {
    const [employer] = await db
      .select({ id: employerProfiles.id })
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, session.userId))
      .limit(1);

    if (!employer || employer.id !== selection.employerProfileId) {
      return { success: false, error: "Unauthorized: You do not own this placement." };
    }
  }

  // 4. Payment check: Must have a VERIFIED payment for this selection
  const [verifiedPayment] = await db
    .select({ id: payments.id, status: payments.status })
    .from(payments)
    .where(
      and(
        eq(payments.selectionId, selection.id),
        eq(payments.status, "VERIFIED")
      )
    )
    .limit(1);

  if (!verifiedPayment && selection.status !== "CONFIRMED") {
    return { success: false, error: "Payment required: The agency handshake fee must be verified before contact details are unlocked." };
  }

  // 4. Rate-limit check in database: Counts NEW placement reveals only
  // If actor has already unlocked this placement previously, allow view without consuming quota.
  const [priorRevealForThisPlacement] = await db
    .select({ id: contactAccessLogs.id })
    .from(contactAccessLogs)
    .where(
      and(
        eq(contactAccessLogs.actorId, session.userId),
        eq(contactAccessLogs.placementId, placement.id)
      )
    )
    .limit(1);

  if (!priorRevealForThisPlacement) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const [rateLimitRecord] = await db
      .select({ count: sql<number>`count(DISTINCT ${contactAccessLogs.placementId})::int` })
      .from(contactAccessLogs)
      .where(
        and(
          eq(contactAccessLogs.actorId, session.userId),
          gte(contactAccessLogs.createdAt, tenMinutesAgo)
        )
      );

    const recentNewPlacementsCount = rateLimitRecord?.count ?? 0;
    if (recentNewPlacementsCount >= 5) {
      return {
        success: false,
        error: "Rate limit exceeded: You can reveal phone numbers for up to 5 new placements per 10 minutes.",
      };
    }
  }

  // 5. Fetch candidate worker profile and user email
  const [worker] = await db
    .select({
      id: workerProfiles.id,
      userId: workerProfiles.userId,
      profileData: workerProfiles.profileData,
      email: users.email,
    })
    .from(workerProfiles)
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .where(eq(workerProfiles.id, selection.workerProfileId))
    .limit(1);

  if (!worker) {
    return { success: false, error: "Candidate worker profile not found." };
  }

  // 6. Check prior reveals for this placement: Notify worker ONCE per placement
  const [priorReveal] = await db
    .select({ id: contactAccessLogs.id })
    .from(contactAccessLogs)
    .where(eq(contactAccessLogs.placementId, placement.id))
    .limit(1);

  if (!priorReveal) {
    // First reveal for this placement -> notify worker in-app and push
    await db.insert(notifications).values({
      userId: worker.userId,
      type: "SELECTION_CONFIRMED",
      title: "Contact Details Unlocked 📞",
      content: "An employer has unlocked your contact details (phone and email) for an active job placement. Expect their reachout for next steps.",
      link: "/dashboard",
    });

    sendPushToUser(worker.userId, {
      title: "Contact Details Unlocked 📞",
      body: "An employer has unlocked your contact details for an active job placement.",
      url: "/dashboard",
      tag: "contact-revealed",
    }).catch(console.error);
  }

  // 7. Audit log in contact_access_logs
  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const userAgent = headerList.get("user-agent") || "unknown";

  await db.insert(contactAccessLogs).values({
    actorId: session.userId,
    actorRole: session.role,
    targetWorkerId: worker.id,
    placementId: placement.id,
    fieldAccessed: "PHONE_AND_EMAIL",
    ipAddress,
    userAgent,
  });

  // 8. Extract phone number and email (never bank details under any circumstance)
  const profileData = (worker.profileData as Record<string, any>) || {};
  const phone = profileData.contactPhone || profileData.phone || "Phone number pending update";
  const email = worker.email || profileData.email || "Email pending update";

  return {
    success: true,
    phone,
    email,
  };
}

export const revealWorkerContact = revealWorkerPhone;
