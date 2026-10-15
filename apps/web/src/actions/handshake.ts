"use server";

import { db, selections, hiringRequests, workerProfiles, employerProfiles } from "@repo/db";
import { getCurrentUser } from "./auth";
import { eq, and } from "@repo/db";
import { revalidatePath } from "next/cache";
import { AGENCY_FEE_PER_WORKER } from "@repo/shared";

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

  revalidatePath("/dashboard");

  return { success: true, status: newStatus };
}
