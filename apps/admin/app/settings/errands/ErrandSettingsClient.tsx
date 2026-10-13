"use client";

import React, { useState } from "react";
import { formatNaira, calculateErrandPricingBreakdown } from "@repo/shared";
import { updateErrandPricingSettings, ErrandPricingSettingsData } from "@/lib/actions";
import {
  AlertCircle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  TrendingUp,
  History,
  Info,
  Loader2,
  Percent,
} from "lucide-react";

export interface AuditHistoryEntry {
  id: string;
  adminEmail: string;
  action: string;
  reason: string | null;
  createdAt: string;
  metadata: any;
}

interface Props {
  initialSettings: ErrandPricingSettingsData;
  auditHistory: AuditHistoryEntry[];
}

export default function ErrandSettingsClient({
  initialSettings,
  auditHistory,
}: Props) {
  const [creationFeeNaira, setCreationFeeNaira] = useState<string>(
    (initialSettings.creationFeeKobo / 100).toString()
  );
  const [commissionPercent, setCommissionPercent] = useState<string>(
    (initialSettings.commissionBps / 100).toString()
  );
  const [minPriceNaira, setMinPriceNaira] = useState<string>(
    (initialSettings.minPriceKobo / 100).toString()
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simulation value for live preview
  const [simulatedPriceNaira, setSimulatedPriceNaira] = useState<string>("20000");

  // Numerical values for live calculation
  const parsedCreation = parseFloat(creationFeeNaira) || 0;
  const parsedCommission = parseFloat(commissionPercent) || 0;
  const parsedMinPrice = parseFloat(minPriceNaira) || 0;
  const parsedSimulatedPrice = parseFloat(simulatedPriceNaira) || 0;

  const commissionBps = Math.round(parsedCommission * 100);
  const simulatedBreakdown =
    parsedSimulatedPrice > 0
      ? calculateErrandPricingBreakdown(
          Math.round(parsedSimulatedPrice * 100),
          Math.round(parsedCreation * 100),
          commissionBps
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (parsedCreation < 0) {
      setError("Creation fee cannot be negative.");
      return;
    }

    if (parsedCommission < 0 || parsedCommission > 100) {
      setError("Commission rate must be between 0% and 100%.");
      return;
    }

    if (parsedMinPrice < 0) {
      setError("Minimum errand price floor cannot be negative.");
      return;
    }

    if (!reason.trim()) {
      setError("A mandatory reason is required for compliance audit logging.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateErrandPricingSettings({
        creationFeeNaira: parsedCreation,
        commissionPercent: parsedCommission,
        minPriceNaira: parsedMinPrice,
        reason: reason.trim(),
      });

      if (res.success) {
        setSuccess("Errand pricing & commission settings updated and audited successfully!");
        setReason("");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update pricing settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const runnerPercent = Math.max(0, 100 - parsedCommission);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
          <Sliders size={14} /> Platform Configuration
        </div>
        <h1 className="text-3xl font-bold text-[#152822] tracking-tight font-heading mt-1">
          Alabaru Errand Pricing & Commission
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure the platform creation fee, commission rate, and price floor. Employers set their own errand rewards upon task creation.
        </p>
      </div>

      {/* Main Grid: Form & Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-black/10 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input 1: Employer Creation Fee */}
            <div>
              <label className="block text-sm font-bold text-[#152822] mb-1.5">
                Employer Creation & Outreach Fee (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₦</span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={creationFeeNaira}
                  onChange={(e) => setCreationFeeNaira(e.target.value)}
                  placeholder="e.g. 0 or 2000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[var(--ng)] text-base font-semibold text-[#152822]"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                Paid by employers upon errand creation for platform runner dispatch. 100% refundable if unclaimed within 24h.
              </p>
            </div>

            {/* Input 2: Commission Percentage */}
            <div>
              <label className="block text-sm font-bold text-[#152822] mb-1.5">
                Staff Guru Commission Rate (%)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">%</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[var(--ng)] text-base font-semibold text-[#152822]"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                Platform commission percentage deducted from the errand reward set by the employer upon completion (Runner receives {runnerPercent}%).
              </p>
            </div>

            {/* Input 3: Minimum Price Floor */}
            <div>
              <label className="block text-sm font-bold text-[#152822] mb-1.5">
                Minimum Permissible Errand Task Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₦</span>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={minPriceNaira}
                  onChange={(e) => setMinPriceNaira(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[var(--ng)] text-base font-semibold text-[#152822]"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                The minimum price an employer is allowed to set when posting an errand to guarantee fair runner pay.
              </p>
            </div>

            {/* Input 4: Audit Reason */}
            <div>
              <label className="block text-sm font-bold text-[#152822] mb-1.5">
                Mandatory Reason for Pricing Change
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the operational rationale (e.g., Q4 commission calibration, inflation adjustment)..."
                rows={3}
                className="w-full p-3 rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[var(--ng)] text-sm text-[#152822]"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Every price update is permanently recorded in the immutable audit log.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[var(--ng)] hover:opacity-95 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Save & Audit Errand Pricing
            </button>
          </form>
        </div>

        {/* Right: Live Split Simulator Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#152822] text-white rounded-2xl p-6 shadow-lg border border-black/20 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lime)]">
                  Live Preview
                </span>
                <h3 className="text-xl font-bold">Financial Split Simulation</h3>
              </div>
              <TrendingUp size={24} className="text-[var(--lime)]" />
            </div>

            {/* Interactive Simulation Input */}
            <div className="bg-white/10 rounded-xl p-3 border border-white/15">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-300 mb-1">
                Simulate Employer Errand Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">₦</span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={simulatedPriceNaira}
                  onChange={(e) => setSimulatedPriceNaira(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-black/30 rounded-lg text-white font-mono text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--lime)]"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Change this value to test how different employer budgets will split.
              </span>
            </div>

            {simulatedBreakdown ? (
              <div className="space-y-4">
                {/* Total Employer Charge */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <span className="text-xs text-neutral-300 font-medium">Total Employer Charge</span>
                  <div className="text-2xl font-bold font-mono text-[var(--lime)] mt-0.5">
                    {formatNaira(simulatedBreakdown.totalEmployerChargeKobo)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex justify-between">
                    <span>Task Price: {formatNaira(simulatedBreakdown.taskPriceKobo)}</span>
                    <span>Creation Fee: {formatNaira(simulatedBreakdown.creationFeeKobo)}</span>
                  </div>
                </div>

                {/* Worker Runner Payout */}
                <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-200 font-bold">
                      Worker Runner Payout ({runnerPercent}%)
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Direct Payout
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {formatNaira(simulatedBreakdown.workerPayoutKobo)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Paid directly to worker's verified NUBAN bank account upon task completion.
                  </p>
                </div>

                {/* Staff Guru Total Revenue */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-bold">
                      Staff Guru Total Platform Revenue
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {formatNaira(simulatedBreakdown.totalPlatformRevenueKobo)}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 space-y-1 pt-1 border-t border-white/10">
                    <div className="flex justify-between">
                      <span>Task Commission ({parsedCommission}%):</span>
                      <span className="font-mono text-neutral-300">
                        {formatNaira(simulatedBreakdown.taskCommissionKobo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outreach / Creation Fee:</span>
                      <span className="font-mono text-neutral-300">
                        {formatNaira(simulatedBreakdown.creationFeeKobo)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Integrity Footer */}
                <div className="flex items-start gap-2 text-[11px] text-neutral-400 bg-black/20 p-3 rounded-xl border border-white/5">
                  <Info size={14} className="shrink-0 mt-0.5 text-neutral-300" />
                  <span>
                    Zero-drift integer kobo rule: Worker Payout ({runnerPercent}%) + Task Commission ({parsedCommission}%) equals Errand Task Price exactly.
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400">
                Enter an errand task price above to preview the financial split.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[var(--ng)]" />
            <h2 className="text-lg font-bold text-[#152822]">Immutable Pricing Audit Trail</h2>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {auditHistory.length} recorded update{auditHistory.length === 1 ? "" : "s"}
          </span>
        </div>

        {auditHistory.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No price updates recorded yet. Any change made above will be permanently logged here.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {auditHistory.map((entry) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#152822]">
                      {entry.adminEmail}
                    </span>
                    <span className="text-[11px] text-neutral-400 ml-2">
                      {new Date(entry.createdAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                    {entry.action}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 italic bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  “{entry.reason || "No reason provided"}”
                </p>

                {entry.metadata && (
                  <div className="text-[11px] text-neutral-500 flex flex-wrap gap-x-4 gap-y-1">
                    {entry.metadata.newCreationFeeKobo !== undefined && (
                      <span>
                        Creation Fee: <strong>{formatNaira(entry.metadata.newCreationFeeKobo)}</strong>
                      </span>
                    )}
                    {entry.metadata.newCommissionBps !== undefined && (
                      <span>
                        Commission: <strong>{(entry.metadata.newCommissionBps / 100).toFixed(1)}%</strong>
                      </span>
                    )}
                    {entry.metadata.newMinPriceKobo !== undefined && (
                      <span>
                        Min Floor: <strong>{formatNaira(entry.metadata.newMinPriceKobo)}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
