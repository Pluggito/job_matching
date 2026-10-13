import { db, errands, employerProfiles, eq, desc } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import EmployerErrandsClient, { EmployerErrandListItem } from "./EmployerErrandsClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Errands | Staff Guru",
  description: "Manage and fund on-demand Alabaru errands.",
};

export default async function EmployerErrandsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return <div>Unauthorized</div>;
  }

  const [employer] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employer) {
    return <div>Please complete your employer profile first.</div>;
  }

  const rawErrands = await db
    .select()
    .from(errands)
    .where(eq(errands.employerId, employer.id))
    .orderBy(desc(errands.createdAt));

  const list: EmployerErrandListItem[] = rawErrands.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    locationState: e.locationState,
    locationArea: e.locationArea,
    taskPriceKobo: e.taskPriceKobo,
    creationFeeKobo: e.creationFeeKobo,
    budgetKobo: e.budgetKobo,
    deadline: e.deadline.toISOString(),
    createdAt: e.createdAt.toISOString(),
    openedAt: e.openedAt?.toISOString() || null,
    claimedAt: e.claimedAt?.toISOString() || null,
    proofSubmittedAt: e.proofSubmittedAt?.toISOString() || null,
    completedAt: e.completedAt?.toISOString() || null,
  }));

  return <EmployerErrandsClient errands={list} />;
}
