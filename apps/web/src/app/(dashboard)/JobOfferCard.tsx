"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Building,
  Check,
  X,
  Eye,
  Calendar,
  ShieldCheck,
  Coins,
  Sparkles,
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
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--lime)] text-[var(--ng)] border border-[var(--ng)]/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={14} /> Confirmed Handshake
              </span>
            ) : isDeclined ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
                <XCircle size={14} /> Declined
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                <Clock3 size={14} className="text-amber-600" /> Action Required
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
                  className="h-9 px-3.5 bg-white border border-[var(--ink)] text-[var(--ink)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye size={14} /> Preview Offer
                </button>
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleRespond(true)}
                  className="h-9 px-3.5 bg-[var(--ng)] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--ng-deep)] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loadingAction === "accept" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} strokeWidth={3} />
                  )}
                  Accept
                </button>
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleRespond(false)}
                  className="h-9 px-3 bg-gray-50 border border-gray-200 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loadingAction === "decline" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} strokeWidth={3} />
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
            <div className="rounded-xl bg-emerald-50/90 p-3.5 text-xs text-emerald-900 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-sm">
                    Offer Accepted!
                  </p>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    The employer has unlocked your contact details and will reach out to you directly to coordinate resumption.
                  </p>
                </div>
              </div>
              <span className="font-bold text-emerald-900 bg-emerald-200/90 px-3 py-1.5 rounded-full text-xs shrink-0 self-start sm:self-auto border border-emerald-300">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ng)]/10 text-[var(--ng)] text-xs font-bold mb-3">
              <Briefcase size={14} strokeWidth={2.5} />
              <span>Official Job Placement Offer</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight [font-family:var(--font-bricolage)]">
              {offer.title}
            </h3>
            <p className="text-sm font-semibold text-[var(--ink-soft)] mt-1">
              Offered by <span className="text-[var(--ink)]">{offer.businessName}</span>
            </p>

            {/* Salary & Key Snapshot Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-green-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Offered Monthly Salary
                  </p>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] font-mono">
                    ₦{offer.budgetMax.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium ml-1">/ month</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ng)] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                  <Coins size={13} /> 100% Wage Protected
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200/70 grid grid-cols-2 gap-2 text-xs text-[var(--ink-soft)]">
                <div>
                  <span className="font-semibold text-gray-500 block text-[10px] uppercase">Location</span>
                  <span className="font-bold text-[var(--ink)]">
                    {offer.locationArea}, {offer.locationState}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block text-[10px] uppercase">Type</span>
                  <span className="font-bold text-[var(--ink)]">
                    {offer.engagementType === "ONSITE" ? "Onsite Position" : "Remote Position"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {offer.description && (
              <div className="mt-5 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  Job Description & Scope
                </h4>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs sm:text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
                  {offer.description}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {offer.requiredSkills && offer.requiredSkills.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {offer.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wage Guarantee Protection Note */}
            <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Staff Guru Zero-Deduction Guarantee:</span> Unlike traditional agencies that deduct 20%–30% of worker salaries, you keep 100% of your earnings. The employer has settled all platform fees directly with Staff Guru.
              </div>
            </div>

            {/* Actions Inside Modal */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleRespond(true)}
                className="w-full sm:flex-1 h-11 rounded-xl bg-[var(--ng)] text-white font-bold text-sm transition-all hover:bg-[var(--ng-deep)] hover:-translate-y-0.5 shadow-md shadow-[var(--ng)]/20 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loadingAction === "accept" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={3} />
                    <span>Accept Offer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleRespond(false)}
                className="w-full sm:w-auto h-11 px-5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loadingAction === "decline" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <>
                    <X size={16} strokeWidth={3} />
                    <span>Decline Offer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                disabled={loadingAction !== null}
                className="w-full sm:w-auto h-11 px-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
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
