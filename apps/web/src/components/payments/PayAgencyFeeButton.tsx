"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { initializeSelectionPayment } from "@/actions/payments";

interface PayAgencyFeeButtonProps {
  selectionId: string;
  feeAmount?: number;
  className?: string;
  compact?: boolean;
}

export default function PayAgencyFeeButton({
  selectionId,
  feeAmount = 50000,
  className = "",
  compact = false,
}: PayAgencyFeeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ng)] text-white font-bold text-sm transition-all hover:bg-[var(--ng-deep)] hover:-translate-y-0.5 shadow-md shadow-[var(--ng)]/20 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer ${
          compact ? "h-9 px-4 text-xs" : "h-11 px-6"
        } ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting Paystack...</span>
          </>
        ) : (
          <>
            <CreditCard size={16} strokeWidth={2.2} />
            <span>Pay Agency Fee (₦{feeAmount.toLocaleString()})</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
