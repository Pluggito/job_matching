"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  NIGERIAN_STATES,
  PROMINENT_LGAS_BY_STATE,
  formatNaira,
  calculateErrandPricingBreakdown,
} from "@repo/shared";
import { createErrand, ErrandPricingStatus } from "@/actions/errands";
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
  Camera,
  Bike,
  TrendingUp,
} from "lucide-react";

interface Props {
  pricing: ErrandPricingStatus;
}

export default function NewErrandForm({ pricing }: Props) {
  const router = useRouter();

  const minPriceNaira = pricing.minPriceKobo / 100;
  const maxPriceNaira = pricing.maxPriceKobo / 100;
  const commissionRate = pricing.commissionBps / 100;
  const runnerRate = Math.max(0, 100 - commissionRate);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<
    "site_inspection" | "pickup_delivery" | "queue_document" | "purchase" | "supervision"
  >("site_inspection");
  const [description, setDescription] = useState("");
  const [budgetNaira, setBudgetNaira] = useState<string>(minPriceNaira.toString());
  const [locationState, setLocationState] = useState<string>("Lagos");
  const [locationArea, setLocationArea] = useState<string>("Ikeja");
  const [address, setAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requiredProof, setRequiredProof] = useState("");
  const [itemDeclaration, setItemDeclaration] = useState("");
  const [prohibitedItemsAcknowledged, setProhibitedItemsAcknowledged] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lgas = PROMINENT_LGAS_BY_STATE[locationState] || [];

  const handleStateChange = (state: string) => {
    setLocationState(state);
    const availableLgas = PROMINENT_LGAS_BY_STATE[state] || [];
    setLocationArea(availableLgas[0] || "");
  };

  const parsedBudget = parseFloat(budgetNaira) || 0;
  const liveBreakdown =
    parsedBudget > 0
      ? calculateErrandPricingBreakdown(
          Math.round(parsedBudget * 100),
          pricing.creationFeeKobo,
          pricing.commissionBps
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedBudget < minPriceNaira) {
      setError(`Minimum errand price is ${formatNaira(pricing.minPriceKobo)}.`);
      return;
    }

    if (parsedBudget > maxPriceNaira) {
      setError(`Maximum errand price is ${formatNaira(pricing.maxPriceKobo)}.`);
      return;
    }

    if (!prohibitedItemsAcknowledged) {
      setError("Please confirm compliance with prohibited items guidelines.");
      return;
    }

    if (!deadline) {
      setError("Please select an execution deadline.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createErrand({
        title,
        type,
        description,
        locationState,
        locationArea,
        address,
        dropoffAddress: type === "pickup_delivery" ? dropoffAddress : undefined,
        deadline: new Date(deadline).toISOString(),
        requiredProof,
        itemDeclaration: itemDeclaration || undefined,
        prohibitedItemsAcknowledged,
        budgetNaira: parsedBudget,
      });

      if (res.success && res.errandId) {
        router.push(`/employer/errands/${res.errandId}/checkout`);
      } else {
        setError(res.error || "Failed to create errand");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-heading">
          Post an On-Demand Errand
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          Dispatch a verified local runner for site inspection, photography, queue waiting, or delivery.
        </p>
      </div>

      {/* Errand Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/10 p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Errand Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: "site_inspection", label: "Site Inspection" },
              { id: "pickup_delivery", label: "Pickup & Delivery" },
              { id: "queue_document", label: "Queue & Documents" },
              { id: "purchase", label: "Purchase & Procure" },
              { id: "supervision", label: "Photography / Supervision" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setType(cat.id as any)}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${type === cat.id ? "bg-[var(--ng)] text-white border-[var(--ng)] shadow-xs" : "bg-neutral-50 text-neutral-700 border-black/10 hover:border-black/20"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Errand Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Inspect Foundation Progress at Lekki Phase 1 Plot"
            className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Task Description & Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain specifically what the runner needs to do, who to ask for, and what to verify..."
            rows={4}
            className="w-full p-3 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
            required
          />
        </div>

        {/* Employer Task Price / Budget Input */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-black/10 space-y-2">
          <label className="block text-xs font-bold text-[#152822] uppercase tracking-wider">
            Errand Task Reward / Budget (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₦</span>
            <input
              type="number"
              step="500"
              min={minPriceNaira}
              max={maxPriceNaira}
              value={budgetNaira}
              onChange={(e) => setBudgetNaira(e.target.value)}
              placeholder={`Min ${minPriceNaira}`}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-base font-semibold text-[#152822] focus:ring-2 focus:ring-[var(--ng)]"
              required
            />
          </div>
          <p className="text-xs text-neutral-500">
            Set the reward you are offering for this task (Minimum {formatNaira(pricing.minPriceKobo)}).
          </p>
        </div>

        {/* Financial Breakdown Live Preview Card */}
        {liveBreakdown && (
          <div className="bg-[#152822] text-white rounded-2xl p-5 shadow-md border border-black/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lime)]">
                  Total Due At Checkout
                </span>
                <div className="text-2xl font-bold font-mono text-[var(--lime)]">
                  {formatNaira(liveBreakdown.totalEmployerChargeKobo)}
                </div>
              </div>
              <TrendingUp size={24} className="text-[var(--lime)]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
              <div>
                <span className="text-neutral-400 block">Task Reward:</span>
                <span className="font-semibold font-mono text-white">
                  {formatNaira(liveBreakdown.taskPriceKobo)}
                </span>{" "}
                <span className="text-neutral-400">
                  (Runner earns {runnerRate}% = {formatNaira(liveBreakdown.workerPayoutKobo)})
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Creation & Outreach Fee:</span>
                <span className="font-semibold font-mono text-white">
                  {formatNaira(liveBreakdown.creationFeeKobo)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 bg-white/5 p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--lime)] shrink-0" />
              <span>
                <strong>100% Refund Guarantee:</strong> If no local runner claims your errand within 24 hours, the full amount ({formatNaira(liveBreakdown.totalEmployerChargeKobo)}) is refunded automatically.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              State
            </label>
            <select
              value={locationState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm bg-white focus:ring-2 focus:ring-[var(--ng)]"
              required
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Area / LGA
            </label>
            <select
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm bg-white focus:ring-2 focus:ring-[var(--ng)]"
              required
            >
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Exact Location Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
            className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
            required
          />
          <p className="text-[11px] text-neutral-400 mt-1">Exact address is protected and revealed only to the assigned verified runner.</p>
        </div>

        {type === "pickup_delivery" && (
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Dropoff Address
            </label>
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="e.g. 25 Awolowo Road, Ikoyi"
              className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Execution Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
              required
            />
            <p className="text-[11px] text-neutral-400 mt-1">Must be at least 2 hours in the future.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Required Proof Format
            </label>
            <input
              type="text"
              value={requiredProof}
              onChange={(e) => setRequiredProof(e.target.value)}
              placeholder="e.g. 4 timestamped photos of the meter and gate"
              className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm focus:ring-2 focus:ring-[var(--ng)]"
              required
            />
          </div>
        </div>

        {/* Prohibited Items Checkbox */}
        <div className="rounded-xl bg-neutral-50 p-4 border border-black/10 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prohibitedItemsAcknowledged}
              onChange={(e) => setProhibitedItemsAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[var(--ng)] focus:ring-[var(--ng)]"
              required
            />
            <span className="text-xs text-neutral-700 leading-relaxed">
              I acknowledge the <strong>Staff Guru Prohibited Items Policy</strong>. I certify that this errand does not involve illegal substances, weapons, perishable unpackaged food, cash transit, or hazardous materials.
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
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
            <Bike size={16} />
          )}
          Proceed to Errand Checkout &rarr;
        </button>
      </form>
    </div>
  );
}
