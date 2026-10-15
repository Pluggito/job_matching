"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  ShieldCheck,
  X,
  Lock,
  RotateCcw,
  UserCheck,
  PhoneCall,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { initializeSelectionPayment } from "@/actions/payments";

interface PayAgencyFeeButtonProps {
  selectionId: string;
  feeAmount?: number;
  className?: string;
  compact?: boolean;
  triggerText?: string;
  candidateName?: string;
  jobTitle?: string;
}

export default function PayAgencyFeeButton({
  selectionId,
  feeAmount = 50000,
  className = "",
  compact = false,
  triggerText = "Unlock Contact & Hire",
  candidateName,
  jobTitle,
}: PayAgencyFeeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal on escape key and prevent body background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        setIsOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await initializeSelectionPayment(selectionId);

      if (result.alreadyPaid) {
        window.location.reload();
        return;
      }

      if (result.authorizationUrl) {
        // Redirect directly to Paystack secure checkout
        window.location.href = result.authorizationUrl;
      } else {
        throw new Error("Unable to obtain checkout authorization URL.");
      }
    } catch (err: any) {
      console.error("[PayAgencyFeeButton Error]:", err);
      setError(err?.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button on the card / profile */}
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ng)] text-white font-bold text-sm transition-all hover:bg-[var(--ng-deep)] hover:-translate-y-0.5 shadow-md shadow-[var(--ng)]/20 cursor-pointer ${
          compact ? "h-10 px-4 text-xs" : "h-11 px-6"
        } ${className}`}
      >
        <ShieldCheck size={compact ? 15 : 17} strokeWidth={2.4} />
        <span>{triggerText}</span>
      </button>

      {/* Explanatory Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) {
              setIsOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[var(--line)] max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !loading && setIsOpen(false)}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ng)]/10 text-[var(--ng)] text-xs font-bold mb-3">
              <ShieldCheck size={14} className="text-[var(--ng)]" strokeWidth={2.5} />
              <span>Regulated Placement Guarantee</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight [font-family:var(--font-bricolage)]">
              Why We Charge an Agency Placement Fee
            </h3>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1.5 leading-relaxed">
              StaffGuru operates a transparent, one-time placement model. Rather than cutting into worker salaries each month, our single fee protects both you and your candidate.
            </p>

            {/* Price Banner Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-green-50/40 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {candidateName ? `${candidateName} Placement` : "One-Time Agency Placement"}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] font-mono">
                    ₦{feeAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    one-time fee
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ng)] bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                  <CheckCircle2 size={12} strokeWidth={2.5} /> 100% Guaranteed
                </span>
              </div>
            </div>

            {/* 4 Pillars Explaining The Fee */}
            <div className="mt-4 space-y-2.5">
              {/* Pillar 1 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[var(--ng)] flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                    14-Day Replacement SLA Guarantee
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                    If the worker does not show up, resigns, or is not the right fit within 14 days, we match and provide a verified replacement immediately at zero extra charge.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Coins size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                    Zero Deductions from Worker Wages
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                    Traditional agencies take 20%–30% of worker salaries monthly. With StaffGuru, your worker keeps 100% of their earned salary.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                    NIN Identity & Background Vetting
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                    Every candidate undergoes government NIN verification, skill vetting, and background checks so you don't hire blind.
                  </p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                    Instant Direct Phone & WhatsApp Access
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                    Unlocks unmasked direct phone and messaging access to schedule interviews and coordinate resumption immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="mt-4 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="w-full h-11 sm:h-12 rounded-xl bg-[var(--ng)] text-white font-bold text-sm sm:text-base transition-all hover:bg-[var(--ng-deep)] hover:-translate-y-0.5 shadow-md shadow-[var(--ng)]/20 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Connecting Paystack...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} strokeWidth={2.2} />
                    <span>Pay ₦{feeAmount.toLocaleString()} & Unlock Contact</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <Lock size={12} className="text-[var(--ng)]" />
                <span>Secured by Paystack · 256-bit SSL encryption</span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors py-1 cursor-pointer disabled:opacity-50"
              >
                Review later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
