"use client";

import * as React from "react";
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkerVerificationStatus } from "@/lib/actions";
import { maskNin, WorkerVerificationStatus } from "@repo/shared";

export interface WorkerQueueItem {
  id: string;
  userId: string;
  email: string;
  category: string;
  skills: string[];
  experienceYears: number;
  location: string;
  locationState: string | null;
  locationArea: string | null;
  expectedPay: number;
  verificationStatus: WorkerVerificationStatus;
  ninVerificationStatus: string;
  ninVerificationRef: string | null;
  profileData: any;
  createdAt: string;
}

export interface WorkerAuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetId: string;
  reason: string | null;
  createdAt: string;
  metadata: any;
}

interface WorkerVerificationQueueProps {
  initialWorkers: WorkerQueueItem[];
  recentAuditLogs: WorkerAuditEntry[];
}

const STATUS_CONFIG: Record<
  WorkerVerificationStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: Eye,
  },
  changes_requested: {
    label: "Changes Requested",
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    icon: AlertCircle,
  },
  verified: {
    label: "Verified",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export default function WorkerVerificationQueue({
  initialWorkers,
  recentAuditLogs,
}: WorkerVerificationQueueProps) {
  const [workers, setWorkers] = React.useState<WorkerQueueItem[]>(initialWorkers);
  const [selectedWorker, setSelectedWorker] = React.useState<WorkerQueueItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<string>("all");
  const [actionReason, setActionReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Filter workers based on search query and tab
  const filteredWorkers = React.useMemo(() => {
    return workers.filter((worker) => {
      const pData = worker.profileData || {};
      const fullName = (pData.fullName || "").toLowerCase();
      const email = worker.email.toLowerCase();
      const category = worker.category.toLowerCase();
      const skills = (worker.skills || []).join(" ").toLowerCase();
      const location = (worker.location || "").toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        email.includes(q) ||
        category.includes(q) ||
        skills.includes(q) ||
        location.includes(q);

      const status = worker.verificationStatus || "pending";
      const matchesTab = selectedTab === "all" || status === selectedTab;

      return matchesSearch && matchesTab;
    });
  }, [workers, searchQuery, selectedTab]);

  // Tab counts
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {
      all: workers.length,
      pending: 0,
      under_review: 0,
      changes_requested: 0,
      verified: 0,
      rejected: 0,
    };
    for (const w of workers) {
      const s = w.verificationStatus || "pending";
      if (map[s] !== undefined) {
        map[s] += 1;
      }
    }
    return map;
  }, [workers]);

  const handleOpenDetail = (worker: WorkerQueueItem) => {
    setSelectedWorker(worker);
    setActionReason("");
    setActionError(null);
    setDrawerOpen(true);
  };

  const handleTransition = async (nextStatus: WorkerVerificationStatus) => {
    if (!selectedWorker) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      await updateWorkerVerificationStatus({
        workerId: selectedWorker.id,
        nextStatus,
        reason: actionReason,
      });

      // Update local state
      const updated = workers.map((w) =>
        w.id === selectedWorker.id ? { ...w, verificationStatus: nextStatus } : w
      );
      setWorkers(updated);
      setSelectedWorker({ ...selectedWorker, verificationStatus: nextStatus });
      setActionReason("");
    } catch (err: any) {
      setActionError(err.message || "Failed to update worker status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWorkerAudit = React.useMemo(() => {
    if (!selectedWorker) return [];
    return recentAuditLogs.filter((log) => log.targetId === selectedWorker.id);
  }, [selectedWorker, recentAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
            Worker Verification Queue
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Review submitted profiles, authenticate NIN records, and verify professionals and talent for marketplace shortlisting.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-black/5 pb-3">
          {[
            { id: "all", label: "All Candidates" },
            { id: "pending", label: "Pending" },
            { id: "under_review", label: "Under Review" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "verified", label: "Verified" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => {
            const count = counts[tab.id] || 0;
            const active = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${active
                    ? "bg-[#008751] text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${active ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, category, skills, location..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50/75 border-b border-black/10 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Category & Skills</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Masked NIN</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    <p className="text-sm">No candidates found matching current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => {
                  const pData = worker.profileData || {};
                  const fullName = pData.fullName || worker.email.split("@")[0] || "Candidate";
                  const rawNin = pData.nin || worker.ninVerificationRef || "";
                  const maskedNinText = rawNin ? maskNin(rawNin) : "Not submitted";
                  const status = worker.verificationStatus || "pending";
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                  const StatusIcon = config.icon;

                  return (
                    <tr
                      key={worker.id}
                      className="hover:bg-neutral-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(worker)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center font-bold text-neutral-600 text-xs shrink-0">
                            {fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 group-hover:text-[#008751] transition-colors">
                              {fullName}
                            </p>
                            <p className="text-xs text-neutral-500 font-mono">{worker.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-medium text-neutral-800">{worker.category}</span>
                          <div className="flex flex-wrap gap-1">
                            {(worker.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-neutral-100 text-[11px] text-neutral-600"
                              >
                                {s}
                              </span>
                            ))}
                            {(worker.skills || []).length > 3 && (
                              <span className="text-[11px] text-neutral-400">
                                +{(worker.skills || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        <p>{worker.location || "Nigeria"}</p>
                        <p className="text-xs text-neutral-400">{worker.experienceYears} yrs experience</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-black/5">
                            {maskedNinText}
                          </span>
                          {worker.ninVerificationStatus === "VERIFIED" ? (
                            <span title="NIN Verified">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          ) : (
                            <span title="NIN Pending Verification">
                              <ShieldAlert className="w-4 h-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#008751] hover:text-[#008751] hover:bg-[#008751]/10 gap-1.5 text-xs font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(worker);
                          }}
                        >
                          Review
                          <ChevronRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Detail Inspection Sheet (Base UI Sheet) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-white">
          {selectedWorker && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-black/10 bg-neutral-50/75 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${STATUS_CONFIG[selectedWorker.verificationStatus || "pending"].bg
                        } ${STATUS_CONFIG[selectedWorker.verificationStatus || "pending"].text} ${STATUS_CONFIG[selectedWorker.verificationStatus || "pending"].border
                        }`}
                    >
                      {STATUS_CONFIG[selectedWorker.verificationStatus || "pending"].label}
                    </span>
                    <h2 className="text-xl font-bold text-neutral-900 font-heading">
                      {selectedWorker.profileData?.fullName || selectedWorker.email.split("@")[0]}
                    </h2>
                    <p className="text-sm text-neutral-500">{selectedWorker.category} · {selectedWorker.location}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* NIN Identity Card */}
                <div className="p-4 rounded-xl border border-black/10 bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Identity & NIN Authentication
                    </span>
                    {selectedWorker.ninVerificationStatus === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> NIMC Authenticated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock size={12} /> NIMC Unverified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-600">Masked NIN:</span>
                    <span className="font-mono text-sm font-semibold text-neutral-900">
                      {selectedWorker.profileData?.nin
                        ? maskNin(selectedWorker.profileData.nin)
                        : selectedWorker.ninVerificationRef
                          ? maskNin(selectedWorker.ninVerificationRef)
                          : "Not Submitted"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Policy Note: Unmasked NINs are protected under Nigerian data privacy guidelines and cannot be exposed.
                  </p>
                </div>

                {/* Profile Overview */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Profile Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-neutral-50 border border-black/5">
                      <p className="text-xs text-neutral-500">Expected Pay</p>
                      <p className="font-semibold text-neutral-900 mt-0.5">
                        ₦{selectedWorker.expectedPay.toLocaleString()} / mo
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-50 border border-black/5">
                      <p className="text-xs text-neutral-500">Experience</p>
                      <p className="font-semibold text-neutral-900 mt-0.5">
                        {selectedWorker.experienceYears} Years
                      </p>
                    </div>
                  </div>

                  {selectedWorker.profileData?.aboutMe && (
                    <div className="p-3 rounded-lg bg-neutral-50 border border-black/5 text-sm">
                      <p className="text-xs text-neutral-500 mb-1">About / Bio</p>
                      <p className="text-neutral-700 leading-relaxed text-xs">
                        {selectedWorker.profileData.aboutMe}
                      </p>
                    </div>
                  )}

                  {/* Skills tags */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1.5">Listed Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedWorker.skills || []).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-neutral-100 text-xs text-neutral-700 font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Portfolio Samples Gallery */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Portfolio & Work Samples
                  </h3>
                  {selectedWorker.profileData?.samples && selectedWorker.profileData.samples.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedWorker.profileData.samples.map((url: string, i: number) => (
                        <div
                          key={i}
                          className="relative aspect-video rounded-xl overflow-hidden border border-black/10 bg-neutral-100 group/img"
                        >
                          <img
                            src={url}
                            alt={`Sample ${i + 1}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-black/10 text-center text-xs text-neutral-400">
                      No uploaded portfolio items for this candidate.
                    </div>
                  )}
                </div>

                {/* Audit Trail for this Worker */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Verification History & Audit Log
                  </h3>
                  {selectedWorkerAudit.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">No previous audit entries logged.</p>
                  ) : (
                    <div className="space-y-2 border-l-2 border-neutral-200 pl-3">
                      {selectedWorkerAudit.map((log) => (
                        <div key={log.id} className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-800">{log.action}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-neutral-500">By {log.adminEmail}</p>
                          {log.reason && (
                            <p className="text-neutral-700 bg-neutral-50 p-1.5 rounded border border-black/5 mt-1">
                              Note: {log.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls Section */}
              <div className="p-6 border-t border-black/10 bg-neutral-50/75 space-y-4 shrink-0">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {actionError}
                  </div>
                )}

                {/* If PENDING: Prompt for explicit START REVIEW */}
                {(selectedWorker.verificationStatus === "pending" || !selectedWorker.verificationStatus) && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-500">
                      Candidate is in the verification queue. Click below to begin review. (State is never mutated on page visit).
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#008751] hover:bg-[#007043] text-white font-bold"
                        disabled={isSubmitting}
                        onClick={() => handleTransition("under_review")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Starting..." : "Start Review"}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-rose-700 border-rose-200 hover:bg-rose-50"
                        disabled={isSubmitting}
                        onClick={() => {
                          if (!actionReason) {
                            setActionError("Please provide a reason below to reject.");
                            return;
                          }
                          handleTransition("rejected");
                        }}
                      >
                        Quick Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* If UNDER REVIEW: Full decision actions requiring mandatory reason */}
                {selectedWorker.verificationStatus === "under_review" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Review Reason / Feedback <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="e.g. Verified NIMC match and approved portfolio quality..."
                        className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold"
                        disabled={isSubmitting || !actionReason.trim()}
                        onClick={() => handleTransition("verified")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        className="text-orange-700 border-orange-200 hover:bg-orange-50 text-xs font-semibold"
                        disabled={isSubmitting || !actionReason.trim()}
                        onClick={() => handleTransition("changes_requested")}
                      >
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Changes
                      </Button>
                      <Button
                        variant="outline"
                        className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                        disabled={isSubmitting || !actionReason.trim()}
                        onClick={() => handleTransition("rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* If VERIFIED, REJECTED, or CHANGES_REQUESTED: Option to re-review */}
                {["verified", "rejected", "changes_requested"].includes(
                  selectedWorker.verificationStatus || ""
                ) && (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-500">
                        Status is currently{" "}
                        <strong className="text-neutral-800">
                          {STATUS_CONFIG[selectedWorker.verificationStatus].label}
                        </strong>
                        . You can re-open review if updated documents are provided.
                      </p>
                      <div>
                        <input
                          type="text"
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                          placeholder="Reason for reopening review..."
                          className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg mb-2 focus:outline-none"
                        />
                        <Button
                          variant="outline"
                          className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 text-xs font-semibold"
                          disabled={isSubmitting}
                          onClick={() => handleTransition("under_review")}
                        >
                          Re-open for Review
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
