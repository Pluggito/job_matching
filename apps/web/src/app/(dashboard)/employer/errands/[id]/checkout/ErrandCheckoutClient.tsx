"use client";

import React, { useState } from "react";
import { formatNaira } from "@repo/shared";
import { initializeErrandPayment } from "@/actions/payments";
import {
  ShieldCheck,
  CreditCard,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Package,
} from "lucide-react";

interface Props {
  errand: {
    id: string;
    title: string;
    type: string;
    taskPriceKobo: number | null;
    creationFeeKobo: number | null;
    budgetKobo: number;
    locationState: string;
    locationArea: string;
    deadline: string;
  };
}

export default function ErrandCheckoutClient({ errand }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskPriceKobo = errand.taskPriceKobo || errand.budgetKobo;
  const creationFeeKobo = errand.creationFeeKobo || 0;
  const totalKobo = taskPriceKobo + creationFeeKobo;

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await initializeErrandPayment(errand.id);
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        setError(res.message || "Failed to initialize payment gateway.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
          Errand Checkout & Funding
        </span>
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight font-heading mt-1">
          Review & Pay
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Funds are held in secure platform escrow until task proof is verified.
        </p>
      </div>

      {/* Errand Summary Card */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)] bg-[var(--ng)]/10 px-2 py-0.5 rounded-md">
            {errand.type.replace("_", " ")}
          </span>
        </div>
        <h3 className="font-bold text-lg text-[var(--ink)]">{errand.title}</h3>
        <div className="text-xs text-neutral-500 flex flex-wrap gap-3">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {errand.locationArea}, {errand.locationState}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> Due: {new Date(errand.deadline).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs space-y-3 text-sm">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Errand Task Reward:</span>
          <span className="font-mono font-semibold text-[var(--ink)]">
            {formatNaira(taskPriceKobo)}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span>Platform Creation & Outreach Fee:</span>
          <span className="font-mono font-semibold text-[var(--ink)]">
            {formatNaira(creationFeeKobo)}
          </span>
        </div>
        <div className="border-t border-black/10 pt-3 flex items-center justify-between font-bold text-base text-[var(--ink)]">
          <span>Total Checkout Amount:</span>
          <span className="font-mono text-xl text-[var(--ng)]">
            {formatNaira(totalKobo)}
          </span>
        </div>
      </div>

      {/* Guarantee Alert */}
      <div className="rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-900 flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-green-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>100% Refundable:</strong> If no verified runner claims your errand within 24 hours, or if you cancel while open, your full payment is refunded automatically.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Paystack Pay Button */}
      <button
        onClick={handlePay}
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl bg-[var(--ng)] hover:opacity-95 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CreditCard size={16} />
        )}
        Pay {formatNaira(totalKobo)} with Paystack &rarr;
      </button>
    </div>
  );
}
