import { db, errands, employerProfiles, workerProfiles, ratings, eq, and } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import { verifyPaymentReference } from "@/actions/payments";
import { getErrandMessages } from "@/actions/errandMessages";
import EmployerErrandDetailClient from "./EmployerErrandDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Errand Details | Staff Guru",
  description: "View errand status, delivery PIN, and runner coordination chat.",
};

export default async function EmployerErrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ payment_ref?: string; paymentReference?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return <div>Unauthorized</div>;
  }

  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const paymentRef = resolvedSearchParams?.payment_ref || resolvedSearchParams?.paymentReference;
  if (paymentRef) {
    try {
      await verifyPaymentReference(paymentRef);
    } catch (e) {
      console.error("[Payment Callback Verify Error]:", e);
    }
  }

  const [employer] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) return notFound();

  const [errand] = await db
    .select()
    .from(errands)
    .where(and(eq(errands.id, id), eq(errands.employerId, employer.id)))
    .limit(1);

  if (!errand) return notFound();

  let runner: { id: string; category: string; locationState: string } | null = null;
  if (errand.claimedByWorkerId) {
    const [r] = await db
      .select({
        id: workerProfiles.id,
        category: workerProfiles.category,
        locationState: workerProfiles.locationState,
      })
      .from(workerProfiles)
      .where(eq(workerProfiles.id, errand.claimedByWorkerId))
      .limit(1);

    if (r) {
      runner = {
        id: r.id,
        category: r.category,
        locationState: r.locationState || "Nigeria",
      };
    }
  }

  const [existingRating] = await db
    .select({
      id: ratings.id,
      score: ratings.score,
      feedback: ratings.feedback,
      moderated: ratings.moderated,
    })
    .from(ratings)
    .where(eq(ratings.errandId, errand.id))
    .limit(1);

  const rawMessages = await getErrandMessages(errand.id);

  return (
    <EmployerErrandDetailClient
      initialRating={existingRating || null}
      errand={{
        id: errand.id,
        title: errand.title,
        type: errand.type,
        status: errand.status,
        description: errand.description,
        locationState: errand.locationState,
        locationArea: errand.locationArea,
        address: errand.address,
        dropoffAddress: errand.dropoffAddress,
        budgetKobo: errand.budgetKobo,
        taskPriceKobo: errand.taskPriceKobo,
        creationFeeKobo: errand.creationFeeKobo,
        workerPayoutKobo: errand.workerPayoutKobo,
        deadline: errand.deadline.toISOString(),
        requiredProof: errand.requiredProof,
        openedAt: errand.openedAt?.toISOString() || null,
        claimedAt: errand.claimedAt?.toISOString() || null,
        proofSubmittedAt: errand.proofSubmittedAt?.toISOString() || null,
        completedAt: errand.completedAt?.toISOString() || null,
        revisionRequestedAt: errand.revisionRequestedAt?.toISOString() || null,
        revisionNotes: errand.revisionNotes,
        revisionGraceExpiresAt: errand.revisionGraceExpiresAt?.toISOString() || null,
      }}
      runner={runner}
      deliveryPin={errand.type === "pickup_delivery" ? "123456" : null}
      initialMessages={rawMessages}
      currentUserId={session.userId}
    />
  );
}
