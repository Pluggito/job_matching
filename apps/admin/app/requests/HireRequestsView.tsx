"use client";

import * as React from "react";
import {
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markSelectionFeeAsPaid, releaseWorkerAccess, confirmWorkerJobAcceptance } from "@/lib/actions";
import { maskNin } from "@repo/shared";

export interface ShortlistedWorker {
  selectionId: string;
  workerProfileId: string;
  workerName: string;
  workerEmail: string;
  workerCategory: string;
  skills: string[];
  location: string;
  expectedPay: number;
  selectionStatus: string;
  termsAcceptedAt: string | null;
  feeAmount: number;
  paymentStatus: string | null;
  paymentAdminId: string | null;
  paymentVerifiedAt: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  nin: string | null;
}

export interface HiringRequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  employerName: string;
  employerEmail: string;
  locationState: string;
  locationArea: string;
  budgetMin: number;
  budgetMax: number;
  workersNeeded: number;
  status: string;
  createdAt: string;
  candidates: ShortlistedWorker[];
}

interface HireRequestsViewProps {
  requests: HiringRequestItem[];
}

export default function HireRequestsView({ requests }: HireRequestsViewProps) {
  const [data, setData] = React.useState<HiringRequestItem[]>(requests);
  const [search, setSearch] = React.useState("");
  const [expandedRequestId, setExpandedRequestId] = React.useState<string | null>(
    requests[0]?.id || null
  );
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.employerName.toLowerCase().includes(q) ||
        r.employerEmail.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleMarkFeePaid = async (selectionId: string, feeAmount: number) => {
    setActionLoadingId(selectionId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await markSelectionFeeAsPaid({
        selectionId,
        feeAmount,
        notes: "Fee confirmed by admin portal",
      });

      // Update state locally
      setData((prev) =>
        prev.map((req) => ({
          ...req,
          candidates: req.candidates.map((cand) =>
            cand.selectionId === selectionId
              ? {
                  ...cand,
                  paymentStatus: "VERIFIED",
                  selectionStatus: "fee_paid",
                  paymentVerifiedAt: new Date().toISOString(),
                }
              : cand
          ),
        }))
      );
      setSuccessMessage("Agency fee of ₦50,000 marked as verified!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to mark fee as paid.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReleaseAccess = async (selectionId: string) => {
    setActionLoadingId(selectionId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await releaseWorkerAccess({
        selectionId,
        notes: "Admin released direct contact access after fee verification",
      });

      // Update state locally
      setData((prev) =>
        prev.map((req) => ({
          ...req,
          candidates: req.candidates.map((cand) =>
            cand.selectionId === selectionId
              ? {
                  ...cand,
                  selectionStatus: "connected",
                }
              : cand
          ),
        }))
      );
      setSuccessMessage("Worker contact details released to employer!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to release access.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmWorkerAcceptance = async (selectionId: string) => {
    setActionLoadingId(selectionId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await confirmWorkerJobAcceptance({
        selectionId,
        notes: "Admin confirmed candidate accepted the job offer",
      });

      // Update state locally
      setData((prev) =>
        prev.map((req) => ({
          ...req,
          candidates: req.candidates.map((cand) =>
            cand.selectionId === selectionId
              ? {
                  ...cand,
                  selectionStatus: "CONFIRMED",
                  termsAcceptedAt: new Date().toISOString(),
                }
              : cand
          ),
        }))
      );
      setSuccessMessage("Worker job offer acceptance confirmed! Contact details released.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm worker acceptance.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
          Hiring Requests & Candidate Matches
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Supervise employer requests, enforce the non-refundable ₦50,000 agency fee, and release verified contacts.
        </p>
      </div>

      {/* Policy Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-semibold text-amber-900">
            Agency Fee & Contact Protection Business Rules:
          </p>
          <p>
            Employers must pay a flat, non-refundable agency fee of <strong>₦50,000</strong> per shortlisted worker before direct phone numbers and email addresses are unlocked.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employer name, job title, category..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
          />
        </div>
      </div>

      {/* Requests Accordion List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-black/10 text-neutral-400 text-sm">
            No hiring requests found.
          </div>
        ) : (
          filtered.map((req) => {
            const isExpanded = expandedRequestId === req.id;
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden transition-all"
              >
                {/* Request Header Bar */}
                <div
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                  onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#008751]/10 text-[#008751] shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-neutral-900 font-heading">
                          {req.title}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                          {req.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {req.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">
                          {req.employerName} ({req.employerEmail})
                        </span>
                        <span>·</span>
                        <span>
                          Location: {req.locationArea}, {req.locationState}
                        </span>
                        <span>·</span>
                        <span>
                          Budget: ₦{req.budgetMin.toLocaleString()} - ₦{req.budgetMax.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-neutral-700">
                        {req.candidates.length} Shortlisted
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Expanded Candidate Matches List */}
                {isExpanded && (
                  <div className="border-t border-black/10 bg-neutral-50/50 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Shortlisted Candidates & Agency Fee Status
                    </h3>

                    {req.candidates.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">
                        No candidates currently shortlisted for this request.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {req.candidates.map((cand) => {
                          const isFeePaid =
                            cand.paymentStatus === "VERIFIED" ||
                            cand.selectionStatus === "fee_paid" ||
                            cand.selectionStatus === "connected" ||
                            cand.selectionStatus === "CONFIRMED";
                          const hasWorkerAccepted = !!cand.termsAcceptedAt;
                          const isConnected = isFeePaid && hasWorkerAccepted;

                          return (
                            <div
                              key={cand.selectionId}
                              className="p-4 rounded-xl border border-black/10 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                              {/* Worker Summary */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-neutral-900 text-sm">
                                    {cand.workerName}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    ({cand.workerCategory})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {cand.skills.map((sk, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] text-neutral-600"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-neutral-500">
                                  Expected: ₦{cand.expectedPay.toLocaleString()} / mo · Location:{" "}
                                  {cand.location}
                                </p>
                              </div>

                              {/* Protected Contact Display */}
                              <div className="p-2.5 rounded-lg border border-black/5 bg-neutral-50 min-w-[240px]">
                                <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                                  {isConnected ? (
                                    <>
                                      <Unlock size={14} className="text-emerald-600" />
                                      <span className="text-emerald-700">Contact Released</span>
                                    </>
                                  ) : isFeePaid ? (
                                    <>
                                      <Lock size={14} className="text-amber-600" />
                                      <span className="text-amber-700">Protected (Awaiting Worker Acceptance)</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={14} className="text-neutral-500" />
                                      <span className="text-neutral-600">Protected Contact</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-700 font-mono">
                                  Phone:{" "}
                                  {isConnected
                                    ? cand.contactPhone || "Not provided"
                                    : "***-***-****"}
                                </p>
                                <p className="text-xs text-neutral-700 font-mono">
                                  Email:{" "}
                                  {isConnected
                                    ? cand.contactEmail || cand.workerEmail
                                    : "***@***.***"}
                                </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {!isFeePaid && (
                                  <Button
                                    size="sm"
                                    className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold gap-1.5"
                                    disabled={actionLoadingId === cand.selectionId}
                                    onClick={() =>
                                      handleMarkFeePaid(cand.selectionId, cand.feeAmount || 50000)
                                    }
                                  >
                                    <CreditCard size={14} />
                                    {actionLoadingId === cand.selectionId
                                      ? "Verifying..."
                                      : "Mark Fee Paid (₦50,000)"}
                                  </Button>
                                )}

                                {isFeePaid && !hasWorkerAccepted && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                                      <Clock size={14} className="text-amber-600" />
                                      Awaiting Worker Acceptance
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold gap-1 cursor-pointer"
                                      disabled={actionLoadingId === cand.selectionId}
                                      onClick={() => handleConfirmWorkerAcceptance(cand.selectionId)}
                                      title="Confirm that the worker has accepted the offer"
                                    >
                                      <UserCheck size={14} className="text-emerald-600" />
                                      {actionLoadingId === cand.selectionId
                                        ? "Confirming..."
                                        : "Confirm Worker Accepted"}
                                    </Button>
                                  </div>
                                )}

                                {isConnected && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                    <CheckCircle2 size={14} />
                                    Active Handshake
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
