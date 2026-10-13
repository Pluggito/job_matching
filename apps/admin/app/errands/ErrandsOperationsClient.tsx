"use client";

import React, { useState } from "react";
import {
  Package,
  Bike,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Loader2,
  DollarSign,
  Scale,
  RotateCcw,
  Building,
  User,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { formatNaira } from "@repo/shared";
import { resolveErrandDispute, overrideErrandStatus } from "@/lib/actions";

export interface AdminErrandItem {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  locationState: string;
  locationArea: string;
  address: string;
  budgetKobo: number;
  taskPriceKobo: number | null;
  creationFeeKobo: number | null;
  workerPayoutKobo: number | null;
  deadline: string;
  requiredProof: string;
  openedAt: string | null;
  claimedAt: string | null;
  proofSubmittedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  revisionRequestedAt: string | null;
  revisionNotes: string | null;
  createdAt: string;
  employerBusinessName: string;
  employerEmail: string;
  workerId: string | null;
  workerCategory: string | null;
}

export interface AdminDisputeItem {
  id: string;
  errandId: string;
  initiatorId: string;
  initiatorRole: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  refundKobo: number;
  payoutKobo: number;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  initiatorEmail: string;
}

interface Props {
  initialErrands: AdminErrandItem[];
  initialDisputes: AdminDisputeItem[];
}

export default function ErrandsOperationsClient({
  initialErrands,
  initialDisputes,
}: Props) {
  const [activeTab, setActiveTab] = useState<"errands" | "disputes">("errands");
  const [errandsList, setErrandsList] = useState(initialErrands);
  const [disputesList, setDisputesList] = useState(initialDisputes);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Inspector Modal
  const [selectedErrand, setSelectedErrand] = useState<AdminErrandItem | null>(null);

  // Status Override Modal
  const [overrideErrand, setOverrideErrand] = useState<AdminErrandItem | null>(null);
  const [newStatus, setNewStatus] = useState("open");
  const [overrideReason, setOverrideReason] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Dispute Arbitrator Modal
  const [arbitratingDispute, setArbitratingDispute] = useState<AdminDisputeItem | null>(null);
  const [arbitrationOutcome, setArbitrationOutcome] = useState<
    "RESOLVED_FULL_PAYOUT" | "RESOLVED_FULL_REFUND" | "RESOLVED_SPLIT"
  >("RESOLVED_SPLIT");
  const [splitRefundNaira, setSplitRefundNaira] = useState(0);
  const [splitPayoutNaira, setSplitPayoutNaira] = useState(0);
  const [arbitrationNotes, setArbitrationNotes] = useState("");
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [arbitrationError, setArbitrationError] = useState<string | null>(null);

  // Stats
  const totalErrands = errandsList.length;
  const activeCount = errandsList.filter((e) =>
    ["open", "claimed", "in_progress"].includes(e.status)
  ).length;
  const proofSubmittedCount = errandsList.filter(
    (e) => e.status === "proof_submitted"
  ).length;
  const disputedCount = errandsList.filter((e) => e.status === "disputed").length;
  const openDisputesCount = disputesList.filter((d) => d.status === "OPEN").length;
  const completedCount = errandsList.filter((e) => e.status === "completed").length;

  // Filtered Errands
  const filteredErrands = errandsList.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employerBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.locationState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchesType = typeFilter === "ALL" || e.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filtered Disputes
  const filteredDisputes = disputesList.filter((d) => {
    return (
      d.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.errandId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenArbitration = (dispute: AdminDisputeItem) => {
    const errand = errandsList.find((e) => e.id === dispute.errandId);
    setArbitratingDispute(dispute);
    setArbitrationOutcome("RESOLVED_SPLIT");
    setArbitrationNotes("");
    setArbitrationError(null);

    const taskPriceNaira = errand ? (errand.taskPriceKobo || errand.budgetKobo) / 100 : 0;
    // Default 50/50 split
    setSplitRefundNaira(Math.round(taskPriceNaira / 2));
    setSplitPayoutNaira(taskPriceNaira - Math.round(taskPriceNaira / 2));
  };

  const handleExecuteArbitration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arbitratingDispute) return;

    const errand = errandsList.find((e) => e.id === arbitratingDispute.errandId);
    if (!errand) return;

    const taskPriceKobo = errand.taskPriceKobo || errand.budgetKobo;
    const refundKobo = splitRefundNaira * 100;
    const payoutKobo = splitPayoutNaira * 100;

    if (arbitrationOutcome === "RESOLVED_SPLIT" && refundKobo + payoutKobo !== taskPriceKobo) {
      setArbitrationError(
        `Split sum mismatch: Refund (₦${splitRefundNaira.toLocaleString()}) + Payout (₦${splitPayoutNaira.toLocaleString()}) must equal task amount (₦${(taskPriceKobo / 100).toLocaleString()}).`
      );
      return;
    }

    setIsArbitrating(true);
    setArbitrationError(null);
    try {
      await resolveErrandDispute({
        disputeId: arbitratingDispute.id,
        outcome: arbitrationOutcome,
        refundKobo,
        payoutKobo,
        notes: arbitrationNotes.trim(),
      });

      // Update local state
      setDisputesList((prev) =>
        prev.map((d) =>
          d.id === arbitratingDispute.id
            ? { ...d, status: arbitrationOutcome, resolutionNotes: arbitrationNotes.trim() }
            : d
        )
      );

      setErrandsList((prev) =>
        prev.map((err) =>
          err.id === arbitratingDispute.errandId
            ? { ...err, status: payoutKobo > 0 ? "completed" : "cancelled" }
            : err
        )
      );

      setArbitratingDispute(null);
    } catch (err: any) {
      setArbitrationError(err?.message || "Failed to resolve dispute");
    } finally {
      setIsArbitrating(false);
    }
  };

  const handleExecuteOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideErrand) return;

    setIsOverriding(true);
    setOverrideError(null);
    try {
      await overrideErrandStatus({
        errandId: overrideErrand.id,
        newStatus,
        reason: overrideReason.trim(),
      });

      setErrandsList((prev) =>
        prev.map((err) =>
          err.id === overrideErrand.id ? { ...err, status: newStatus } : err
        )
      );

      setOverrideErrand(null);
    } catch (err: any) {
      setOverrideError(err?.message || "Failed to override status");
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
            <Bike size={16} /> Operational Desk
          </div>
          <h1 className="text-3xl font-bold font-space tracking-tight text-[var(--ink)] mt-1">
            Alabaru Errands & Dispute Mediation
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time nationwide errand monitor, delivery PIN audits, proof inspection, and split-sum dispute arbitration.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Errands
          </span>
          <p className="text-2xl font-black text-[var(--ink)] mt-1 font-mono">{totalErrands}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Active Running
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{activeCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            Proof Submitted
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{proofSubmittedCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("disputes")}
          className={`rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
            openDisputesCount > 0
              ? "bg-red-50 border-red-300 ring-2 ring-red-400"
              : "bg-white border-black/10"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center justify-between">
            <span>Disputed</span>
            {openDisputesCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </span>
          <p className="text-2xl font-black text-red-600 mt-1 font-mono">{openDisputesCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-green-700">
            Completed
          </span>
          <p className="text-2xl font-black text-green-600 mt-1 font-mono">{completedCount}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
        <button
          onClick={() => setActiveTab("errands")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "errands"
              ? "bg-[var(--ink)] text-white shadow-xs"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          All Errands ({errandsList.length})
        </button>
        <button
          onClick={() => setActiveTab("disputes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "disputes"
              ? "bg-red-600 text-white shadow-xs"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <AlertTriangle size={14} />
          <span>Dispute Cases</span>
          {openDisputesCount > 0 && (
            <span className="bg-white text-red-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {openDisputesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content 1: Errands Overview */}
      {activeTab === "errands" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search errands by title, ID, employer, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ng)]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-black/15 text-xs bg-white font-medium focus:ring-2 focus:ring-[var(--ng)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="in_progress">In Progress</option>
                <option value="proof_submitted">Proof Submitted</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-black/15 text-xs bg-white font-medium focus:ring-2 focus:ring-[var(--ng)]"
              >
                <option value="ALL">All Categories</option>
                <option value="site_inspection">Site Inspection</option>
                <option value="pickup_delivery">Pickup & Delivery</option>
                <option value="queue_document">Queue & Document</option>
                <option value="purchase">Purchase</option>
                <option value="supervision">Supervision</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-black/5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 px-4">Errand / Task</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Employer</th>
                    <th className="py-3 px-4">Assigned Runner</th>
                    <th className="py-3 px-4">Task Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredErrands.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        No errands found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredErrands.map((errand) => (
                      <tr key={errand.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-[var(--ink)] block text-xs">
                              {errand.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              #{errand.id.slice(0, 8)} • {errand.type.replace("_", " ")}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-600">
                          <span className="block font-medium">{errand.locationArea}</span>
                          <span className="text-[10px] text-neutral-400">{errand.locationState}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900 block">
                            {errand.employerBusinessName}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {errand.employerEmail}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {errand.workerId ? (
                            <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              {errand.workerCategory || "Runner Assigned"}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic text-[11px]">Unclaimed</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[var(--ink)]">
                          {formatNaira(errand.budgetKobo)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              errand.status === "open"
                                ? "bg-blue-100 text-blue-800"
                                : errand.status === "claimed"
                                ? "bg-amber-100 text-amber-800"
                                : errand.status === "in_progress"
                                ? "bg-indigo-100 text-indigo-800"
                                : errand.status === "proof_submitted"
                                ? "bg-purple-100 text-purple-800"
                                : errand.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : errand.status === "disputed"
                                ? "bg-red-100 text-red-800 font-black animate-pulse"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {errand.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedErrand(errand)}
                              className="px-2.5 py-1.5 rounded-lg border border-black/15 text-[11px] font-bold hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} /> Inspect
                            </button>
                            <button
                              onClick={() => {
                                setOverrideErrand(errand);
                                setNewStatus(errand.status);
                                setOverrideReason("");
                                setOverrideError(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 text-[11px] font-bold hover:bg-neutral-200 cursor-pointer"
                            >
                              Override
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Dispute Cases */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <Scale size={16} className="text-red-600" />
                Active Dispute Arbitrations
              </h3>
              <span className="text-xs text-neutral-500">
                Split-sum check rule: <code>refund + payout === task_price</code>
              </span>
            </div>

            <div className="divide-y divide-black/5">
              {filteredDisputes.length === 0 ? (
                <div className="p-12 text-center text-neutral-400 text-xs">
                  No dispute cases filed. All errands operating smoothly!
                </div>
              ) : (
                filteredDisputes.map((dispute) => {
                  const associatedErrand = errandsList.find((e) => e.id === dispute.errandId);
                  return (
                    <div key={dispute.id} className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800">
                              {dispute.status}
                            </span>
                            <span className="text-xs font-bold text-neutral-700">
                              Dispute #{dispute.id.slice(0, 8)}
                            </span>
                            <span className="text-neutral-400 text-xs">• Filed by {dispute.initiatorRole} ({dispute.initiatorEmail})</span>
                          </div>
                          <h4 className="font-bold text-base text-[var(--ink)] mt-1">
                            {associatedErrand?.title || `Errand #${dispute.errandId.slice(0, 8)}`}
                          </h4>
                        </div>

                        <div className="text-right sm:self-center">
                          {dispute.status === "OPEN" ? (
                            <button
                              onClick={() => handleOpenArbitration(dispute)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Scale size={14} /> Arbitrate Case
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                              Resolved: ₦{(dispute.refundKobo / 100).toLocaleString()} refund / ₦{(dispute.payoutKobo / 100).toLocaleString()} payout
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-black/5 text-xs space-y-1">
                        <span className="font-bold text-neutral-900 block">
                          Reason: {dispute.reason.replace("_", " ")}
                        </span>
                        <p className="text-neutral-600 whitespace-pre-line">{dispute.description}</p>
                        {dispute.resolutionNotes && (
                          <div className="mt-2 pt-2 border-t border-black/5 text-emerald-800 font-medium">
                            <strong>Admin Resolution:</strong> {dispute.resolutionNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Errand Inspector */}
      {selectedErrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-black/5 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
                  Errand Inspector #{selectedErrand.id.slice(0, 8)}
                </span>
                <h3 className="text-xl font-bold text-[var(--ink)] mt-1">{selectedErrand.title}</h3>
              </div>
              <button
                onClick={() => setSelectedErrand(null)}
                className="text-neutral-400 hover:text-black text-sm font-bold cursor-pointer"
              >
                &times; Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <span className="text-neutral-400 font-semibold block">Employer Profile</span>
                <p className="font-bold text-[var(--ink)]">{selectedErrand.employerBusinessName}</p>
                <p className="text-neutral-500 font-mono">{selectedErrand.employerEmail}</p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <span className="text-neutral-400 font-semibold block">Assigned Runner</span>
                <p className="font-bold text-[var(--ink)]">
                  {selectedErrand.workerCategory || "Unassigned"}
                </p>
                <p className="text-neutral-500 font-mono">
                  {selectedErrand.workerId ? `Worker ID: ${selectedErrand.workerId.slice(0, 8)}` : "None"}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-neutral-700 block">Full Task Description:</span>
              <p className="p-3 bg-neutral-50 rounded-xl text-neutral-800 whitespace-pre-line leading-relaxed">
                {selectedErrand.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-700">Location Details:</span>
                <p>{selectedErrand.address}</p>
                <p className="text-neutral-500">
                  {selectedErrand.locationArea}, {selectedErrand.locationState}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900">Financial Ledger Breakdown:</span>
                <p>Task Budget: {formatNaira(selectedErrand.budgetKobo)}</p>
                <p>Platform Commission (30%): {formatNaira(Math.round(selectedErrand.budgetKobo * 0.3))}</p>
                <p className="font-bold text-emerald-800">
                  Worker Payout (70%): {formatNaira(selectedErrand.workerPayoutKobo || Math.round(selectedErrand.budgetKobo * 0.7))}
                </p>
              </div>
            </div>

            {selectedErrand.revisionNotes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                <span className="font-bold">Active Revision Request:</span>
                <p>"{selectedErrand.revisionNotes}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Dispute Arbitrator (Split-Sum Settlement) */}
      {arbitratingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-5">
            <div className="space-y-1 border-b border-black/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <Scale size={16} /> Dispute Mediation Desk
              </span>
              <h3 className="text-lg font-bold text-[var(--ink)]">
                Arbitrate Dispute #{arbitratingDispute.id.slice(0, 8)}
              </h3>
            </div>

            <form onSubmit={handleExecuteArbitration} className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-900 block">
                  Complaint ({arbitratingDispute.reason}):
                </span>
                <p className="text-neutral-700">{arbitratingDispute.description}</p>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Settlement Decision
                </label>
                <select
                  value={arbitrationOutcome}
                  onChange={(e) => setArbitrationOutcome(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-black/15 bg-white text-xs font-bold"
                >
                  <option value="RESOLVED_SPLIT">Custom Split Settlement (e.g. 50/50)</option>
                  <option value="RESOLVED_FULL_REFUND">Full 100% Refund to Employer (₦0 to runner)</option>
                  <option value="RESOLVED_FULL_PAYOUT">Full 100% Payout to Runner (₦0 refund)</option>
                </select>
              </div>

              {arbitrationOutcome === "RESOLVED_SPLIT" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Employer Refund (₦)</label>
                    <input
                      type="number"
                      value={splitRefundNaira}
                      onChange={(e) => setSplitRefundNaira(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-amber-300 bg-white font-mono text-xs"
                      min={0}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Runner Payout (₦)</label>
                    <input
                      type="number"
                      value={splitPayoutNaira}
                      onChange={(e) => setSplitPayoutNaira(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-amber-300 bg-white font-mono text-xs"
                      min={0}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Mandatory Mediation Notes (Audited)
                </label>
                <textarea
                  value={arbitrationNotes}
                  onChange={(e) => setArbitrationNotes(e.target.value)}
                  placeholder="Detail the rationale for this settlement outcome..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs"
                  required
                />
              </div>

              {arbitrationError && (
                <p className="text-xs text-red-600 font-medium p-2.5 bg-red-50 rounded-xl border border-red-200">
                  {arbitrationError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArbitratingDispute(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isArbitrating || !arbitrationNotes.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isArbitrating ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />}
                  Confirm Arbitration Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Status Override */}
      {overrideErrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)]">
              Manual Status Override: #{overrideErrand.id.slice(0, 8)}
            </h3>

            <form onSubmit={handleExecuteOverride} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/15 bg-white text-xs font-bold"
                >
                  <option value="open">open (re-open in feed)</option>
                  <option value="claimed">claimed</option>
                  <option value="in_progress">in_progress</option>
                  <option value="proof_submitted">proof_submitted</option>
                  <option value="completed">completed (release payout)</option>
                  <option value="cancelled">cancelled (refund employer)</option>
                  <option value="disputed">disputed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Mandatory Override Reason</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Why is admin overriding this status?"
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs"
                  required
                />
              </div>

              {overrideError && <p className="text-xs text-red-600">{overrideError}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideErrand(null)}
                  className="flex-1 py-2 text-neutral-600 font-bold border border-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverriding || !overrideReason.trim()}
                  className="flex-1 py-2 bg-[var(--ink)] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isOverriding ? "Saving..." : "Apply Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
