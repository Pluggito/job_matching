import { db, errands, employerProfiles, eq, and } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import ErrandCheckoutClient from "./ErrandCheckoutClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Errand Checkout | Staff Guru",
  description: "Fund your Alabaru errand.",
};

export default async function ErrandCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return <div>Unauthorized</div>;
  }

  const { id } = await params;

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

  return (
    <ErrandCheckoutClient
      errand={{
        id: errand.id,
        title: errand.title,
        type: errand.type,
        taskPriceKobo: errand.taskPriceKobo,
        creationFeeKobo: errand.creationFeeKobo,
        budgetKobo: errand.budgetKobo,
        locationState: errand.locationState,
        locationArea: errand.locationArea,
        deadline: errand.deadline.toISOString(),
      }}
    />
  );
}
