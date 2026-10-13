import { db, errands, workerProfiles, employerProfiles, users, eq, and } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import { getErrandMessages } from "@/actions/errandMessages";
import WorkerErrandDetailClient from "./WorkerErrandDetailClient";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Errand Execution & Coordination | Staff Guru",
  description: "Coordinate errand details, submit completion proof, and verify delivery PIN.",
};

export default async function WorkerErrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return redirect("/auth/login");
  }

  const { id } = await params;

  const [worker] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!worker) return redirect("/dashboard/profile");

  const [errand] = await db
    .select()
    .from(errands)
    .where(and(eq(errands.id, id), eq(errands.claimedByWorkerId, worker.id)))
    .limit(1);

  if (!errand) return notFound();

  // Employer information (Business name or employer name, safe for coordination)
  let employerInfo = {
    name: "Employer",
    location: `${errand.locationArea}, ${errand.locationState}`,
  };

  const [empProfile] = await db
    .select({
      businessName: employerProfiles.businessName,
      location: employerProfiles.location,
    })
    .from(employerProfiles)
    .where(eq(employerProfiles.id, errand.employerId))
    .limit(1);

  if (empProfile?.businessName) {
    employerInfo.name = empProfile.businessName;
  }
  if (empProfile?.location) {
    employerInfo.location = empProfile.location;
  }

  const rawMessages = await getErrandMessages(errand.id);
  const initialMessages = rawMessages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <WorkerErrandDetailClient
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
        workerPayoutKobo: errand.workerPayoutKobo ?? Math.round(errand.budgetKobo * 0.7),
        deadline: errand.deadline.toISOString(),
        requiredProof: errand.requiredProof,
        claimedAt: errand.claimedAt?.toISOString() || null,
        proofSubmittedAt: errand.proofSubmittedAt?.toISOString() || null,
        completedAt: errand.completedAt?.toISOString() || null,
        revisionRequestedAt: errand.revisionRequestedAt?.toISOString() || null,
        revisionNotes: errand.revisionNotes,
        revisionGraceExpiresAt: errand.revisionGraceExpiresAt?.toISOString() || null,
        handoffAttempts: errand.handoffAttempts || 0,
      }}
      employerInfo={employerInfo}
      initialMessages={initialMessages}
      currentUserId={session.userId}
    />
  );
}
