import {
  db,
  workerProfiles,
  employerProfiles,
  selections,
  placements,
  payments,
  eq,
  and,
  sql,
} from "@repo/db";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { maskWorkerContact } from "@repo/shared";
import PublicWorkerProfileClient from "./PublicWorkerProfileClient";

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  const [profile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.id, params.id))
    .limit(1);

  if (!profile) return notFound();

  const session = await getCurrentUser();
  let isConnected = false;
  let placementId: string | undefined;
  let pendingSelectionId: string | undefined;
  let isSelectionPaid = false;

  if (session && session.role === "EMPLOYER") {
    const [emp] = await db
      .select({ id: employerProfiles.id })
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, session.userId))
      .limit(1);

    if (emp) {
      // Check confirmed selection (worker must have explicitly accepted offer)
      const [conn] = await db
        .select({ id: selections.id, termsAcceptedAt: selections.termsAcceptedAt })
        .from(selections)
        .where(
          and(
            eq(selections.employerProfileId, emp.id),
            eq(selections.workerProfileId, profile.id),
            eq(selections.status, "CONFIRMED")
          )
        )
        .limit(1);

      isConnected = !!conn && !!conn.termsAcceptedAt;

      if (conn) {
        // Find placement
        const [placement] = await db
          .select({ id: placements.id })
          .from(placements)
          .where(eq(placements.selectionId, conn.id))
          .limit(1);

        if (placement) {
          placementId = placement.id;
        }
      } else {
        // Check if there is a pending selection awaiting fee payment or candidate acceptance
        const [pendingSel] = await db
          .select({
            id: selections.id,
            isPaid: sql<boolean>`EXISTS (
              SELECT 1 FROM ${payments} 
              WHERE ${payments.selectionId} = ${selections.id} 
              AND ${payments.status} = 'VERIFIED'
            )`,
          })
          .from(selections)
          .where(
            and(
              eq(selections.employerProfileId, emp.id),
              eq(selections.workerProfileId, profile.id),
              eq(selections.status, "PENDING")
            )
          )
          .limit(1);

        if (pendingSel) {
          pendingSelectionId = pendingSel.id;
          isSelectionPaid = !!pendingSel.isPaid;
        }
      }
    }
  }

  // Formal placements: email is NEVER revealed; phone is revealed on-demand via server action
  const safeProfile = maskWorkerContact(profile, {
    isConnected,
    allowEmail: false,
    phoneRevealed: false,
  });

  return (
    <div className="mx-auto w-full max-w-[1100px] py-8 px-4">
      <PublicWorkerProfileClient
        worker={safeProfile}
        isConnected={isConnected}
        placementId={placementId}
        pendingSelectionId={pendingSelectionId}
        isSelectionPaid={isSelectionPaid}
      />
    </div>
  );
}


