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
import { calculateMonnifyFee } from "@repo/shared";

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
  const [paymentPlan, setPaymentPlan] = useState<"full" | "half">("full");

  const effectiveFeeAmount = paymentPlan === "full" ? feeAmount : Math.round(feeAmount / 2);
  const feeCalc = calculateMonnifyFee(effectiveFeeAmount * 100);

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
      const result = await initializeSelectionPayment(selectionId, paymentPlan);

      if (result.alreadyPaid) {
        window.location.reload();
        return;
      }

      if (result.authorizationUrl) {
        // Redirect directly to Monnify secure checkout
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold mb-3 border border-neutral-200/80">
              <ShieldCheck size={14} className="text-[#008751]" strokeWidth={2.5} />
              <span>Regulated Placement Guarantee</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight [font-family:var(--font-bricolage)]">
              Why We Charge an Agency Placement Fee
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
              StaffGuru operates a transparent, one-time placement model. Rather than cutting into worker salaries each month, our single fee protects both you and your candidate.
            </p>

            {/* Payment Option Selector (Option to pay in full or not) */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                Payment Option
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentPlan("full")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentPlan === "full"
                      ? "border-[#008751] bg-emerald-50/70 ring-2 ring-[#008751]/20 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">Pay in Full</span>
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center border-neutral-400">
                      {paymentPlan === "full" && <span className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-extrabold text-base text-neutral-900">₦{feeAmount.toLocaleString()}</span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Complete upfront placement</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPlan("half")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentPlan === "half"
                      ? "border-[#008751] bg-emerald-50/70 ring-2 ring-[#008751]/20 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">2 Installments (50%)</span>
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center border-neutral-400">
                      {paymentPlan === "half" && <span className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-mono font-extrabold text-base text-neutral-900">₦{Math.round(feeAmount / 2).toLocaleString()} now</span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Balance on worker resumption</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Banner Card with Paystack breakdown */}
            <div className="mt-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>{candidateName ? `${candidateName} Placement (${paymentPlan === "full" ? "Full" : "Initial Installment"})` : "Placement Fee"}</span>
                <span className="font-mono font-bold text-neutral-900">
                  ₦{effectiveFeeAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  Monnify Processing Fee
                  <span className="text-[10px] text-neutral-400 font-normal">
                    (1.5%{feeCalc.isCapped ? ", capped at ₦2,000" : ""})

                  </span>
                </span>
                <span className="font-mono font-bold text-neutral-700">
                  ₦{feeCalc.feeNaira.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Total Due Now
                  </p>
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
                    ₦{feeCalc.totalNaira.toLocaleString()}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white px-2.5 py-1 rounded-md border border-neutral-200/80 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" /> 100% Guaranteed
                </span>
              </div>
            </div>

            {/* 4 Pillars Explaining The Fee */}
            <div className="mt-4 space-y-2.5">
              {/* Pillar 1 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                    14-Day Replacement SLA Guarantee
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    If the worker does not show up, resigns, or is not the right fit within 14 days, we match and provide a verified replacement immediately at zero extra charge.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Coins size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                    Zero Deductions from Worker Wages
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    Traditional agencies take 20%–30% of worker salaries monthly. With StaffGuru, your worker keeps 100% of their earned salary.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                    NIN Identity & Background Vetting
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    Every candidate undergoes government NIN verification, skill vetting, and background checks so you don't hire blind.
                  </p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                    Instant Direct Phone & WhatsApp Access
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
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
                    <span>Connecting Monnify...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} strokeWidth={2.2} />
                    <span>Pay ₦{feeCalc.totalNaira.toLocaleString()} & Unlock Contact</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <Lock size={12} className="text-[var(--ng)]" />
                <span>Secured by Monnify · 256-bit SSL encryption</span>
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
