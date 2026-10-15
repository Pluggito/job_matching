"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Building,
  Check,
  X,
  Eye,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { respondToHandshake } from "../../actions/handshake";

export interface JobOfferData {
  id: string; // selectionId
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
  title: string;
  category?: string;
  description?: string;
  businessName: string;
  locationState: string;
  locationArea: string;
  engagementType: string;
  budgetMin: number;
  budgetMax: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minExperienceYears?: number;
  startDate?: Date | string | null;
  createdAt: Date | string;
  termsAcceptedAt?: Date | string | null;
}

export default function JobOfferCard({ offer }: { offer: JobOfferData }) {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"accept" | "decline" | null>(null);

  // Close modal on escape key
  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loadingAction) {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen, loadingAction]);

  const handleRespond = async (accept: boolean) => {
    setLoadingAction(accept ? "accept" : "decline");
    try {
      await respondToHandshake(offer.id, accept);
      setIsPreviewOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to process response. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const isConfirmed = offer.status === "CONFIRMED" || !!offer.termsAcceptedAt;
  const isPending = offer.status === "PENDING" && !offer.termsAcceptedAt;
  const isDeclined = offer.status === "CANCELLED";

  return (
    <>
      <div className="bg-white border border-[var(--line)] rounded-2xl p-6 hover:shadow-md transition-shadow group flex flex-col gap-4">
        {/* Main Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-5 items-start sm:items-center">
            <div className="w-14 h-14 bg-[var(--canvas)] rounded-2xl border border-[var(--line)] flex items-center justify-center shrink-0 shadow-xs">
              <Building size={24} className="text-[var(--ink-soft)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition-colors">
                  {offer.title}
                </h3>
                {offer.category && (
                  <span className="hidden md:inline-flex text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                    {offer.category}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-[var(--ink-soft)] font-medium">
                <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
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

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] w-full sm:w-auto">
            {/* Status Badge */}
            {isConfirmed ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200/80 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" /> Confirmed Handshake
              </span>
            ) : isDeclined ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200/80 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Declined
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" /> Action Required
              </span>
            )}

            {/* Salary Display */}
            <div className="text-right">
              <div className="font-bold text-[var(--ink)] text-base">
                ₦{offer.budgetMax.toLocaleString()}
              </div>
              <div className="text-[11px] text-[var(--ink-soft)] font-medium uppercase tracking-wider">
                Offered Salary
              </div>
            </div>

            {/* Actions for Pending Offers */}
            {isPending && (
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="h-9 px-3.5 bg-white border border-neutral-300 text-neutral-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-neutral-50 hover:border-neutral-400 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye size={14} /> Preview Offer
                </button>
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleRespond(true)}
                  className="h-9 px-3.5 bg-[#008751] hover:bg-[#007043] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loadingAction === "accept" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                  Accept
                </button>
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleRespond(false)}
                  className="h-9 px-3 bg-white border border-neutral-200 text-neutral-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loadingAction === "decline" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} strokeWidth={2.5} />
                  )}
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>

        {/* If the candidate accepted the offer, show "The employer will contact you" banner */}
        {isConfirmed && (
          <div className="pt-3 border-t border-[var(--line)]">
            <div className="rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-800 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 text-[#008751] flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">
                    Offer Accepted
                  </p>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Your contact details are unlocked. The employer will reach out to you directly to coordinate resumption.
                  </p>
                </div>
              </div>
              <span className="font-semibold text-neutral-800 bg-white px-3 py-1.5 rounded-lg text-xs shrink-0 self-start sm:self-auto border border-neutral-200/80 shadow-2xs">
                The employer will contact you
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Job Offer Modal */}
      {isPreviewOpen && (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !loadingAction) {
            setIsPreviewOpen(false);
          }
        }}
      >
        <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[var(--line)] max-h-[92vh] overflow-y-auto">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => !loadingAction && setIsPreviewOpen(false)}
            disabled={loadingAction !== null}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Official Placement Offer
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              {offer.title}
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5">
              Offered by <span className="font-semibold text-neutral-800">{offer.businessName}</span>
            </p>
          </div>

          {/* Salary & Key Snapshot Card */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Offered Monthly Salary
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
                    ₦{offer.budgetMax.toLocaleString()}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">/ month</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white px-2.5 py-1 rounded-md border border-neutral-200/80 shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />
                100% Wage Protected
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-200/70 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-neutral-400 block text-[10px] uppercase tracking-wider">Location</span>
                <span className="font-medium text-neutral-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} className="text-neutral-400 shrink-0" />
                  {offer.locationArea}, {offer.locationState}
                </span>
              </div>
              <div>
                <span className="font-semibold text-neutral-400 block text-[10px] uppercase tracking-wider">Workplace</span>
                <span className="font-medium text-neutral-800 flex items-center gap-1.5 mt-0.5">
                  <Briefcase size={13} className="text-neutral-400 shrink-0" />
                  {offer.engagementType === "ONSITE" ? "Onsite Position" : "Remote Position"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <div className="mt-4 space-y-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Job Description & Scope
              </h4>
              <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/60 text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {offer.description}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {offer.requiredSkills && offer.requiredSkills.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {offer.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center bg-neutral-100 text-neutral-700 text-xs font-medium px-2.5 py-1 rounded-md border border-neutral-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Zero-Deduction Guarantee Note */}
          <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#008751] shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong className="text-neutral-900 font-semibold">Staff Guru Zero-Deduction Guarantee:</strong> Unlike traditional agencies that deduct 20%–30% of worker salaries, you keep 100% of your earnings. The employer has settled all platform fees directly with Staff Guru.
            </p>
          </div>

          {/* Actions Inside Modal */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleRespond(true)}
              className="w-full sm:flex-1 h-11 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loadingAction === "accept" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Accept Offer</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleRespond(false)}
              className="w-full sm:w-auto h-11 px-5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold text-sm hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loadingAction === "decline" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Declining...</span>
                </>
              ) : (
                <>
                  <X size={16} strokeWidth={2.5} />
                  <span>Decline Offer</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              disabled={loadingAction !== null}
              className="w-full sm:w-auto h-11 px-4 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
