"use server";

import { db, selections, hiringRequests, workerProfiles, employerProfiles, placements, notifications, users } from "@repo/db";
import { getCurrentUser } from "./auth";
import { eq, and } from "@repo/db";
import { revalidatePath } from "next/cache";
import { AGENCY_FEE_PER_WORKER } from "@repo/shared";
import { sendPushToUser } from "@/server/services/pushNotifications";

export async function sendHandshakeOffer(workerProfileId: string, hiringRequestId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    throw new Error("Unauthorized");
  }

  // Verify employer owns the hiring request
  const [request] = await db
    .select()
    .from(hiringRequests)
    .where(eq(hiringRequests.id, hiringRequestId))
    .limit(1);

  if (!request) {
    throw new Error("Hiring request not found");
  }

  // Get the employer profile ID to verify ownership and use for selection
  const [employerProfile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employerProfile || request.employerId !== employerProfile.id) {
    throw new Error("Unauthorized access to this hiring request");
  }

  // Check if an offer already exists
  const [existingSelection] = await db
    .select()
    .from(selections)
    .where(
      and(
        eq(selections.workerProfileId, workerProfileId),
        eq(selections.hiringRequestId, hiringRequestId)
      )
    )
    .limit(1);

  if (existingSelection) {
    throw new Error("An offer has already been sent to this worker for this role.");
  }

  // Create the selection (Handshake) with regulated flat placement fee
  const [newSelection] = await db
    .insert(selections)
    .values({
      employerProfileId: employerProfile.id,
      workerProfileId,
      hiringRequestId,
      status: "PENDING",
      feeAmount: AGENCY_FEE_PER_WORKER,
      termsVersion: "1.0",
    })
    .returning();

  revalidatePath(`/employer/requests/${hiringRequestId}/matches`);
  revalidatePath("/dashboard"); // Revalidate worker dashboard

  return newSelection;
}

export async function respondToHandshake(selectionId: string, accept: boolean) {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    throw new Error("Unauthorized");
  }

  const [workerProfile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!workerProfile) {
    throw new Error("Worker profile not found");
  }

  // Verify the selection belongs to this worker
  const [selection] = await db
    .select()
    .from(selections)
    .where(
      and(
        eq(selections.id, selectionId),
        eq(selections.workerProfileId, workerProfile.id)
      )
    )
    .limit(1);

  if (!selection) {
    throw new Error("Offer not found or unauthorized");
  }

  if (selection.status !== "PENDING") {
    throw new Error("This offer has already been processed.");
  }

  const newStatus = accept ? "CONFIRMED" : "CANCELLED";

  await db
    .update(selections)
    .set({ status: newStatus, termsAcceptedAt: accept ? new Date() : null })
    .where(eq(selections.id, selectionId));

  if (accept) {
    const [existingPlacement] = await db
      .select({ id: placements.id })
      .from(placements)
      .where(eq(placements.selectionId, selectionId))
      .limit(1);

    if (!existingPlacement) {
      const startDate = new Date();
      const replacementDeadline = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      await db.insert(placements).values({
        selectionId,
        startDate,
        status: "ACTIVE",
        replacementDeadline,
      });
    }
  }

  // Notify employer of worker's response
  const [empProfile] = await db
    .select({ userId: employerProfiles.userId, businessName: employerProfiles.businessName })
    .from(employerProfiles)
    .where(eq(employerProfiles.id, selection.employerProfileId))
    .limit(1);

  if (empProfile) {
    const notifyContent = accept
      ? "Candidate accepted your job placement offer! Direct contact details are now unlocked."
      : "Candidate declined the job offer. You may review other candidates in your matches.";
    const targetLink = selection.hiringRequestId
      ? `/employer/requests/${selection.hiringRequestId}/matches`
      : "/employer";

    await db.insert(notifications).values({
      userId: empProfile.userId,
      type: accept ? "HANDSHAKE_ACCEPTED" : "HANDSHAKE_DECLINED",
      title: accept ? "Job Offer Accepted! 🎉" : "Job Offer Declined",
      content: notifyContent,
      link: targetLink,
    });

    sendPushToUser(empProfile.userId, {
      title: accept ? "Job Offer Accepted! 🎉" : "Job Offer Declined",
      body: notifyContent,
      url: targetLink,
      tag: "handshake-response",
    }).catch(console.error);
  }

  revalidatePath("/dashboard");
  if (selection.hiringRequestId) {
    revalidatePath(`/employer/requests/${selection.hiringRequestId}/matches`);
  }
  revalidatePath(`/employer/workers/${selection.workerProfileId}`);
  revalidatePath("/employer/workers");

  return { success: true, status: newStatus };
}

export async function confirmEmployerHire(selectionId: string) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    throw new Error("Unauthorized");
  }

  const [selection] = await db
    .select()
    .from(selections)
    .where(eq(selections.id, selectionId))
    .limit(1);

  if (!selection) {
    throw new Error("Selection not found");
  }

  const [employerProfile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employerProfile || selection.employerProfileId !== employerProfile.id) {
    throw new Error("Unauthorized access to this selection");
  }

  // Update selection with hiredAt timestamp
  await db
    .update(selections)
    .set({ hiredAt: new Date() })
    .where(eq(selections.id, selectionId));

  // Find worker userId to send notification
  const [worker] = await db
    .select({ userId: workerProfiles.userId })
    .from(workerProfiles)
    .where(eq(workerProfiles.id, selection.workerProfileId))
    .limit(1);

  if (worker) {
    const offerContent = `${employerProfile.businessName} has sent you an official job placement offer! Please review the terms and accept or decline in your dashboard.`;
    await db.insert(notifications).values({
      userId: worker.userId,
      type: "JOB_OFFER",
      title: "New Job Placement Offer! 💼",
      content: offerContent,
      link: "/dashboard",
    });

    sendPushToUser(worker.userId, {
      title: "New Job Placement Offer! 💼",
      body: `${employerProfile.businessName} sent you an official offer. Tap to preview and accept.`,
      url: "/dashboard",
      tag: "job-offer",
    }).catch(console.error);
  }

  revalidatePath(`/employer/requests/${selection.hiringRequestId}/matches`);
  revalidatePath("/dashboard");
  revalidatePath(`/employer/workers/${selection.workerProfileId}`);
  revalidatePath("/employer/workers");

  return { success: true };
}
