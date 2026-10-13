import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, Clock3, ChevronRight, Building, Bike } from "lucide-react";
import Link from "next/link";
import {
  db,
  selections,
  hiringRequests,
  employerProfiles,
  workerProfiles,
  placements,
  eq,
  desc,
} from "@repo/db";
import { getCurrentUser } from "../../actions/auth";
import HandshakeActions from "./HandshakeActions";
import BankPromptBanner from "@/components/dashboard/BankPromptBanner";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--lime)] text-[var(--ng)] border border-[var(--ng)]/20 rounded-full text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> Confirmed Handshake
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
          <XCircle size={14} /> Declined
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
          <Clock3 size={14} /> Action Required
        </span>
      );
  }
};

export default async function WorkerJobsView() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [workerProfile] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!workerProfile) return null;

  // Fetch real offers (selections) and associated placements
  const offers = await db
    .select({
      id: selections.id,
      status: selections.status,
      feeAmount: selections.feeAmount,
      title: hiringRequests.title,
      locationState: hiringRequests.locationState,
      locationArea: hiringRequests.locationArea,
      engagementType: hiringRequests.engagementType,
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
          <p className="text-[var(--ink-soft)] mt-1">Review and respond to handshakes from employers.</p>
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
          <div className="bg-white border border-[var(--line)] rounded-xl p-12 text-center text-[var(--ink-soft)]">
            You haven't received any offers yet. Make sure your profile is complete and available!
          </div>
        )}
        
        {offers.map((offer) => {
          return (
            <div
              key={offer.id}
              className="bg-white border border-[var(--line)] rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex gap-5 items-start sm:items-center">
                  <div className="w-14 h-14 bg-[var(--canvas)] rounded-xl border border-[var(--line)] flex items-center justify-center shrink-0">
                    <Building size={24} className="text-[var(--ink-soft)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition-colors">
                      {offer.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-[var(--ink-soft)] font-medium">
                      <span className="flex items-center gap-1 text-[var(--ink)]">
                        <Briefcase size={14} className="text-gray-400" />
                        {offer.businessName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />{" "}
                        {offer.engagementType === "ONSITE"
                          ? `${offer.locationArea}, ${offer.locationState}`
                          : "Remote"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> Received{" "}
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] w-full sm:w-auto">
                  <StatusBadge status={offer.status} />
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-[var(--ink)]">
                        ₦{offer.feeAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--ink-soft)] font-medium uppercase tracking-wider mt-0.5">
                        Agreed Wage
                      </div>
                    </div>
                    {offer.status === "PENDING" && (
                      <HandshakeActions selectionId={offer.id} />
                    )}
                  </div>
                </div>
              </div>

              {/* Confirmed Placement Status */}
              {offer.status === "CONFIRMED" && (
                <div className="pt-3 border-t border-[var(--line)]">
                  <div className="rounded-lg bg-green-50 p-3 text-xs text-green-800 border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      Placement is active! The employer has unlocked your contact details and will reach out to you directly.
                    </span>
                    <span className="font-semibold text-green-900 bg-green-100 px-2.5 py-0.5 rounded-full shrink-0">
                      14-Day SLA Active
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

