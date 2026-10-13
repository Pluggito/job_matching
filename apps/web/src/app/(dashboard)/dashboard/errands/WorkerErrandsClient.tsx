"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bike,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Camera,
  KeyRound,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatNaira } from "@repo/shared";
import {
  claimErrand,
  startErrandExecution,
  verifyErrandDeliveryPin,
  submitErrandProof,
} from "@/actions/errands";

export interface ErrandFeedItem {
  id: string;
  title: string;
  type: string;
  description: string;
  locationState: string;
  locationArea: string;
  budgetKobo: number;
  workerPayoutKobo: number | null;
  deadline: string;
  requiredProof: string;
  createdAt: string;
  unclaimedExpiresAt: string | null;
}

export interface MyErrandItem {
  id: string;
  title: string;
  type: string;
  status: string;
  locationState: string;
  locationArea: string;
  address: string;
  dropoffAddress?: string | null;
  workerPayoutKobo: number;
  deadline: string;
  requiredProof: string;
  claimedAt: string | null;
  proofSubmittedAt: string | null;
  completedAt: string | null;
  handoffAttempts: number;
}

interface Props {
  isEligible: boolean;
  hasBank: boolean;
  isNinVerified: boolean;
  isOpenToErrands: boolean;
  openErrands: ErrandFeedItem[];
  myErrands: MyErrandItem[];
}

export default function WorkerErrandsClient({
  isEligible,
  hasBank,
  isNinVerified,
  isOpenToErrands,
  openErrands,
  myErrands,
}: Props) {
  const [activeTab, setActiveTab] = useState<"available" | "mine">("available");
  const [claimingErrand, setClaimingErrand] = useState<ErrandFeedItem | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Execution Modals
  const [pinModalErrand, setPinModalErrand] = useState<MyErrandItem | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Proof Modal
  const [proofModalErrand, setProofModalErrand] = useState<MyErrandItem | null>(null);
  const [proofNotes, setProofNotes] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const handleConfirmClaim = async () => {
    if (!claimingErrand) return;
    setIsClaiming(true);
    setClaimError(null);
    try {
      const res = await claimErrand(claimingErrand.id);
      if (res.success) {
        setClaimingErrand(null);
        setActiveTab("mine");
      } else {
        setClaimError(('error' in res ? (res.error as string) : null) || "Failed to claim errand");
      }
    } catch (err: any) {
      setClaimError(err?.message || "Failed to claim errand");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleStartTask = async (errandId: string) => {
    try {
      await startErrandExecution(errandId);
    } catch (err: any) {
      alert(err?.message || "Failed to start execution");
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalErrand) return;
    setIsVerifyingPin(true);
    setPinError(null);
    try {
      const res = await verifyErrandDeliveryPin(pinModalErrand.id, enteredPin);
      if (res.success) {
        setPinSuccess(true);
        setTimeout(() => {
          setPinModalErrand(null);
          setPinSuccess(false);
          setEnteredPin("");
        }, 1500);
      } else {
        setPinError(('error' in res ? (res.error as string) : null) || "Incorrect delivery PIN.");
      }
    } catch (err: any) {
      setPinError(err?.message || "Verification failed.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalErrand) return;
    setIsSubmittingProof(true);
    setProofError(null);
    try {
      // In production, photos uploaded to storage return storage keys
      const photoKeys = [`proof_${proofModalErrand.id}_${Date.now()}`];
      const res = await submitErrandProof({
        errandId: proofModalErrand.id,
        photoKeys,
        notes: proofNotes.trim(),
      });
      if (res.success) {
        setProofModalErrand(null);
        setProofNotes("");
      } else {
        setProofError(('error' in res ? (res.error as string) : null) || "Failed to submit proof");
      }
    } catch (err: any) {
      setProofError(err?.message || "Failed to submit proof");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
            <Bike size={16} /> Alabaru On-Demand Network
          </div>
          <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-heading mt-1">
            Errands Hub
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Accept local inspection, photography, and delivery errands during downtime. Earn 70% direct payout.
          </p>
        </div>
      </div>

      {/* Eligibility Checklist Banner if Not Fully Qualified */}
      {!isEligible && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-base">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            Complete Your Runner Profile to Claim Errands
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            To ensure trust and safe execution on the Alabaru network, all runners must satisfy three verification standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${isOpenToErrands ? "bg-green-100/60 border-green-300 text-green-900" : "bg-white border-amber-200 text-amber-800"}`}>
              <span>1. Opted into Errands</span>
              {isOpenToErrands ? <CheckCircle2 size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-amber-500" />}
            </div>
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${isNinVerified ? "bg-green-100/60 border-green-300 text-green-900" : "bg-white border-amber-200 text-amber-800"}`}>
              <span>2. NIN Verified</span>
              {isNinVerified ? <CheckCircle2 size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-amber-500" />}
            </div>
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${hasBank ? "bg-green-100/60 border-green-300 text-green-900" : "bg-white border-amber-200 text-amber-800"}`}>
              <span>3. Bank Account on File</span>
              {hasBank ? <CheckCircle2 size={16} className="text-green-600" /> : <Link href="/dashboard/profile/bank" className="text-amber-700 underline font-bold">Add Bank &rarr;</Link>}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10">
        <button
          onClick={() => setActiveTab("available")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "available" ? "border-[var(--ng)] text-[var(--ng)]" : "border-transparent text-neutral-500 hover:text-[var(--ink)]"}`}
        >
          <Package size={16} />
          Available Errands ({openErrands.length})
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "mine" ? "border-[var(--ng)] text-[var(--ng)]" : "border-transparent text-neutral-500 hover:text-[var(--ink)]"}`}
        >
          <ShieldCheck size={16} />
          My Active Errands ({myErrands.length})
        </button>
      </div>

      {/* Tab 1: Available Errands Feed */}
      {activeTab === "available" && (
        <div className="space-y-4">
          {openErrands.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/10 p-12 text-center shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-full bg-[var(--ng)]/10 text-[var(--ng)] flex items-center justify-center mx-auto">
                <Bike size={24} />
              </div>
              <h3 className="font-bold text-lg text-[var(--ink)]">No open errands right now</h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-sm mx-auto">
                Employers post errands on demand throughout the day. Check back soon or ensure push notifications are enabled!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openErrands.map((errand) => {
                const payoutKobo = errand.workerPayoutKobo || Math.round(errand.budgetKobo * 0.7);
                return (
                  <div
                    key={errand.id}
                    className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs hover:border-[var(--ng)] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ng)]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ng)]">
                          {errand.type.replace("_", " ")}
                        </span>
                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                            Runner Payout (70%)
                          </span>
                          <span className="text-xl font-bold font-mono text-[var(--ng)]">
                            {formatNaira(payoutKobo)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-[var(--ink)] tracking-tight">
                        {errand.title}
                      </h3>
                      <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                        {errand.description}
                      </p>

                      <div className="space-y-1.5 pt-2 text-xs text-neutral-600 border-t border-black/5">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-neutral-400 shrink-0" />
                          <span>{errand.locationArea}, {errand.locationState}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-neutral-400 shrink-0" />
                          <span>Deadline: {new Date(errand.deadline).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Camera size={14} className="text-neutral-400 shrink-0" />
                          <span className="truncate">Proof: {errand.requiredProof}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setClaimingErrand(errand)}
                      disabled={!isEligible}
                      className="w-full py-2.5 px-4 rounded-xl bg-[var(--ink)] hover:bg-[var(--ng)] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                      <span>Claim Errand</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Active Errands */}
      {activeTab === "mine" && (
        <div className="space-y-4">
          {myErrands.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/10 p-12 text-center shadow-xs">
              <p className="text-sm text-neutral-500">
                You haven't claimed any active errands yet. Check the Available Errands feed!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myErrands.map((errand) => (
                <div
                  key={errand.id}
                  className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
                          {errand.type.replace("_", " ")}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                          {errand.status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--ink)] mt-1">{errand.title}</h3>
                    </div>
                    <div className="text-right sm:self-center">
                      <span className="text-xs text-neutral-500 block">Take-Home Payout</span>
                      <span className="text-xl font-bold font-mono text-[var(--ng)]">
                        {formatNaira(errand.workerPayoutKobo)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-xl">
                    <div>
                      <span className="font-bold text-neutral-900 block mb-1">Full Location & Address:</span>
                      <p>{errand.address}, {errand.locationArea}, {errand.locationState}</p>
                      {errand.dropoffAddress && (
                        <p className="mt-1 text-emerald-800 font-medium">Dropoff: {errand.dropoffAddress}</p>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 block mb-1">Execution Deadline & Proof:</span>
                      <p>Due by: {new Date(errand.deadline).toLocaleString()}</p>
                      <p className="mt-1 italic">Required: {errand.requiredProof}</p>
                    </div>
                  </div>

                    {/* Contextual Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link
                        href={`/dashboard/errands/${errand.id}`}
                        className="py-2 px-4 rounded-xl border border-black/15 bg-white text-[var(--ink)] text-xs font-bold hover:bg-neutral-50 shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare size={14} className="text-[var(--ng)]" />
                        Workspace & Chat
                      </Link>

                      {errand.status === "claimed" && (
                      <button
                        onClick={() => handleStartTask(errand.id)}
                        className="py-2 px-4 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 shadow-xs transition-all cursor-pointer"
                      >
                        Start Execution (In Progress)
                      </button>
                    )}

                    {errand.type === "pickup_delivery" && errand.status === "in_progress" && (
                      <button
                        onClick={() => setPinModalErrand(errand)}
                        className="py-2 px-4 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound size={14} />
                        Verify Delivery PIN
                      </button>
                    )}

                    {(errand.status === "in_progress" || errand.status === "claimed") && (
                      <button
                        onClick={() => setProofModalErrand(errand)}
                        className="py-2 px-4 rounded-xl bg-[var(--ink)] text-white text-xs font-bold hover:bg-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} />
                        Submit Proof Photos
                      </button>
                    )}

                    {errand.status === "proof_submitted" && (
                      <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                        <Clock size={14} />
                        <span>Proof submitted! Waiting for employer approval or 24-hour auto-release.</span>
                      </div>
                    )}

                    {errand.status === "completed" && (
                      <div className="text-xs text-green-800 bg-green-50 px-3 py-2 rounded-xl border border-green-200 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span>Completed! Payout of {formatNaira(errand.workerPayoutKobo)} released to your bank.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: 30% Commission Notice & Claim Confirmation */}
      {claimingErrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
                Claim Confirmation
              </span>
              <h3 className="text-xl font-bold text-[var(--ink)]">
                {claimingErrand.title}
              </h3>
            </div>

            {/* 30% Commission Disclosure Card */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-black/10 space-y-2.5 text-xs text-neutral-700">
              <div className="flex items-center justify-between font-bold text-sm text-[var(--ink)] border-b border-black/5 pb-2">
                <span>Task Budget:</span>
                <span className="font-mono">{formatNaira(claimingErrand.budgetKobo)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Staff Guru Platform Commission (30%):</span>
                <span className="font-mono text-neutral-600">
                  {formatNaira(Math.round(claimingErrand.budgetKobo * 0.3))}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span>Your Net Payout (70%):</span>
                <span className="font-mono text-emerald-700 text-base">
                  {formatNaira(claimingErrand.workerPayoutKobo || Math.round(claimingErrand.budgetKobo * 0.7))}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              By claiming, you commit to completing this task before <strong>{new Date(claimingErrand.deadline).toLocaleString()}</strong> and uploading verified proof. Payout is transferred directly to your bank account upon approval.
            </p>

            {claimError && (
              <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                {claimError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setClaimingErrand(null)}
                disabled={isClaiming}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClaim}
                disabled={isClaiming}
                className="flex-1 py-2.5 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isClaiming ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Accept & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Verify Delivery PIN */}
      {pinModalErrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <KeyRound size={18} className="text-amber-600" />
              Verify Delivery PIN
            </h3>
            <p className="text-xs text-neutral-500">
              Ask the recipient for the 6-digit delivery security PIN to confirm handover:
            </p>

            <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit PIN"
                className="w-full py-3 text-center font-mono font-bold text-2xl tracking-widest border border-black/20 rounded-xl focus:ring-2 focus:ring-amber-500"
                required
              />

              {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
              {pinSuccess && <p className="text-xs text-green-600 font-bold">Delivery PIN confirmed!</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPinModalErrand(null)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-600 border border-neutral-300 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin || enteredPin.length !== 6}
                  className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50"
                >
                  {isVerifyingPin ? <Loader2 size={14} className="animate-spin" /> : "Verify PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Submit Errand Proof */}
      {proofModalErrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <Camera size={18} className="text-[var(--ng)]" />
              Submit Completion Proof
            </h3>
            <p className="text-xs text-neutral-500">
              Provide photographic evidence or notes confirming completion of "{proofModalErrand.title}":
            </p>

            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-black/15 rounded-xl p-6 text-center text-xs text-neutral-500 bg-neutral-50">
                <Camera size={24} className="mx-auto text-neutral-400 mb-2" />
                <span className="font-semibold text-neutral-700">Attach Proof Photos</span>
                <p className="text-[11px] text-neutral-400 mt-1">Inspection report, receipt, or dropoff confirmation</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Task Execution Notes (Optional)
                </label>
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Detail any specifics about the completed errand..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs focus:ring-2 focus:ring-[var(--ng)]"
                />
              </div>

              {proofError && <p className="text-xs text-red-600 font-medium">{proofError}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProofModalErrand(null)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-600 border border-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[var(--ng)] rounded-xl hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmittingProof ? <Loader2 size={14} className="animate-spin" /> : "Submit Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
