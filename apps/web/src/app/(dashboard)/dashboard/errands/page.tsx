import {
  db,
  workerProfiles,
  workerBankAccounts,
  errands,
  payments,
  eq,
  and,
  desc,
  gt,
  or,
  isNull,
  sql,
} from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import WorkerErrandsClient, {
  ErrandFeedItem,
  MyErrandItem,
} from "./WorkerErrandsClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Errands Hub | Staff Guru",
  description: "Browse and claim on-demand Alabaru errands across Nigeria.",
};

export default async function WorkerErrandsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return <div>Unauthorized</div>;
  }

  const [workerProfile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!workerProfile) {
    return <div>Please complete your profile first.</div>;
  }

  // Check active bank account
  const [bank] = await db
    .select({ id: workerBankAccounts.id })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.workerProfileId, workerProfile.id),
        eq(workerBankAccounts.isActive, true)
      )
    )
    .limit(1);

  const hasBank = !!bank;
  const isNinVerified = workerProfile.ninVerificationStatus === "VERIFIED";
  const isOpenToErrands = workerProfile.openToErrands;
  const isEligible = hasBank && isNinVerified && isOpenToErrands;

  // 1. Fetch open errands feed
  const now = new Date();
  const rawOpenErrands = await db
    .select()
    .from(errands)
    .where(
      and(
        eq(errands.status, "open"),
        or(isNull(errands.unclaimedExpiresAt), gt(errands.unclaimedExpiresAt, now))
      )
    )
    .orderBy(desc(errands.createdAt))
    .limit(20);

  const openErrands: ErrandFeedItem[] = rawOpenErrands.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    description: e.description,
    locationState: e.locationState,
    locationArea: e.locationArea,
    budgetKobo: e.budgetKobo,
    workerPayoutKobo: e.workerPayoutKobo,
    deadline: e.deadline.toISOString(),
    requiredProof: e.requiredProof,
    createdAt: e.createdAt.toISOString(),
    unclaimedExpiresAt: e.unclaimedExpiresAt?.toISOString() || null,
  }));

  // 2. Fetch worker's active & claimed errands
  const rawMyErrands = await db
    .select({
      id: errands.id,
      title: errands.title,
      type: errands.type,
      status: errands.status,
      locationState: errands.locationState,
      locationArea: errands.locationArea,
      address: errands.address,
      dropoffAddress: errands.dropoffAddress,
      budgetKobo: errands.budgetKobo,
      workerPayoutKobo: errands.workerPayoutKobo,
      deadline: errands.deadline,
      requiredProof: errands.requiredProof,
      claimedAt: errands.claimedAt,
      proofSubmittedAt: errands.proofSubmittedAt,
      completedAt: errands.completedAt,
      handoffAttempts: errands.handoffAttempts,
      isPaid: sql<boolean>`EXISTS (
        SELECT 1 FROM ${payments}
        WHERE ${payments.errandId} = ${errands.id}
        AND ${payments.status} = 'VERIFIED'
      )`,
    })
    .from(errands)
    .where(eq(errands.claimedByWorkerId, workerProfile.id))
    .orderBy(desc(errands.updatedAt));

  const myErrands: MyErrandItem[] = rawMyErrands.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    locationState: e.locationState,
    locationArea: e.locationArea,
    address: e.address,
    dropoffAddress: e.dropoffAddress,
    workerPayoutKobo: e.workerPayoutKobo || Math.round(e.budgetKobo * 0.7),
    deadline: e.deadline.toISOString(),
    requiredProof: e.requiredProof,
    claimedAt: e.claimedAt?.toISOString() || null,
    proofSubmittedAt: e.proofSubmittedAt?.toISOString() || null,
    completedAt: e.completedAt?.toISOString() || null,
    handoffAttempts: e.handoffAttempts,
    isPaid: Boolean(e.isPaid),
  }));

  return (
    <WorkerErrandsClient
      isEligible={isEligible}
      hasBank={hasBank}
      isNinVerified={isNinVerified}
      isOpenToErrands={isOpenToErrands}
      openErrands={openErrands}
      myErrands={myErrands}
    />
  );
}
