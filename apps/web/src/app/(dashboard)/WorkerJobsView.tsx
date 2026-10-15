import { Bike } from "lucide-react";
import Link from "next/link";
import {
  db,
  selections,
  hiringRequests,
  employerProfiles,
  workerProfiles,
  placements,
  eq,
} from "@repo/db";
import { getCurrentUser } from "../../actions/auth";
import BankPromptBanner from "@/components/dashboard/BankPromptBanner";
import JobOfferCard from "./JobOfferCard";

export default async function WorkerJobsView() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [workerProfile] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!workerProfile) return null;

  // Fetch real offers (selections) and associated hiring request details
  const offers = await db
    .select({
      id: selections.id,
      status: selections.status,
      termsAcceptedAt: selections.termsAcceptedAt,
      feeAmount: selections.feeAmount,
      budgetMin: hiringRequests.budgetMin,
      budgetMax: hiringRequests.budgetMax,
      title: hiringRequests.title,
      description: hiringRequests.description,
      category: hiringRequests.category,
      requiredSkills: hiringRequests.requiredSkills,
      preferredSkills: hiringRequests.preferredSkills,
      minExperienceYears: hiringRequests.minExperienceYears,
      locationState: hiringRequests.locationState,
      locationArea: hiringRequests.locationArea,
      engagementType: hiringRequests.engagementType,
      startDate: hiringRequests.startDate,
      businessName: employerProfiles.businessName,
      createdAt: hiringRequests.createdAt,
      placementId: placements.id,
    })
    .from(selections)
    .innerJoin(hiringRequests, eq(selections.hiringRequestId, hiringRequests.id))
    .innerJoin(employerProfiles, eq(hiringRequests.employerId, employerProfiles.id))
    .leftJoin(placements, eq(placements.selectionId, selections.id))
    .where(eq(selections.workerProfileId, workerProfile.id));

  return (
    <div className="space-y-6">
      {/* Prompts unbanked workers only if openToErrands === true */}
      <BankPromptBanner />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Active Offers</h1>
          <p className="text-[var(--ink-soft)] mt-1">Review, preview and respond to handshakes from employers.</p>
        </div>
        <Link
          href="/dashboard/errands"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:border-[var(--ng)] transition-colors shadow-xs"
        >
          <Bike size={16} className="text-[var(--ng)]" />
          <span>Browse Errands Hub &rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {offers.length === 0 && (
          <div className="bg-white border border-[var(--line)] rounded-2xl p-12 text-center text-[var(--ink-soft)]">
            You haven't received any job offers yet. Make sure your profile is complete and available!
          </div>
        )}

        {offers.map((offer) => (
          <JobOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
