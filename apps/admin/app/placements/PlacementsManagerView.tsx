"use client";

import * as React from "react";
import {
  Briefcase,
  Calendar,
  AlertTriangle,
  Clock,
  UserX,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateDDMMYYYY } from "@repo/shared";
import {
  recordPlacementRemovalNotice,
  recordReplacementRequest,
} from "@/lib/actions";

export interface RemovalNoticeItem {
  id: string;
  noticeDate: string;
  reason: string;
  createdAt: string;
}

export interface ReplacementRequestItem {
  id: string;
  reason: string;
  dueAt: string | null;
  createdAt: string;
}

export interface PlacementItem {
  id: string;
  selectionId: string;
  startDate: string;
  status: string;
  replacementDeadline: string;
  workerName: string;
  workerCategory: string;
  employerName: string;
  employerEmail: string;
  removalNotices: RemovalNoticeItem[];
  replacementRequests: ReplacementRequestItem[];
}

interface PlacementsManagerViewProps {
  initialPlacements: PlacementItem[];
}

export default function PlacementsManagerView({
  initialPlacements,
}: PlacementsManagerViewProps) {
  const [placements, setPlacements] = React.useState<PlacementItem[]>(initialPlacements);
  const [selectedPlacement, setSelectedPlacement] = React.useState<PlacementItem | null>(null);

  // Notice Modal State
  const [noticeModalOpen, setNoticeModalOpen] = React.useState(false);
  const [noticeDate, setNoticeDate] = React.useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [noticeReason, setNoticeReason] = React.useState("");

  // Replacement Modal State
  const [replacementModalOpen, setReplacementModalOpen] = React.useState(false);
  const [replacementReason, setReplacementReason] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Notice date preview (+3 days)
  const effectiveTerminationDatePreview = React.useMemo(() => {
    if (!noticeDate) return "";
    const d = new Date(noticeDate);
    d.setDate(d.getDate() + 3);
    return formatDateDDMMYYYY(d);
  }, [noticeDate]);

  // Handle 3-Day Notice Submission
  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement || !noticeReason.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await recordPlacementRemovalNotice({
        placementId: selectedPlacement.id,
        noticeDate: noticeDate || new Date().toISOString(),
        reason: noticeReason.trim(),
      });

      // Update state
      const updated = placements.map((p) => {
        if (p.id === selectedPlacement.id) {
          return {
            ...p,
            removalNotices: [
              ...p.removalNotices,
              {
                id: `notice-${Date.now()}`,
                noticeDate: new Date(noticeDate).toISOString(),
                reason: noticeReason.trim(),
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return p;
      });

      setPlacements(updated);
      setSuccessMsg(
        `3-Day removal notice recorded! Effective termination date: ${effectiveTerminationDatePreview}`
      );
      setNoticeModalOpen(false);
      setNoticeReason("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record removal notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 14-Day Replacement Request Submission
  const handleSubmitReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement || !replacementReason.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await recordReplacementRequest({
        placementId: selectedPlacement.id,
        reason: replacementReason.trim(),
      });

      const updated = placements.map((p) => {
        if (p.id === selectedPlacement.id) {
          return {
            ...p,
            status: "REPLACED",
            replacementRequests: [
              ...p.replacementRequests,
              {
                id: `rep-${Date.now()}`,
                reason: replacementReason.trim(),
                dueAt: res.dueAt,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return p;
      });

      setPlacements(updated);
      setSuccessMsg("14-Day replacement request initiated with SLA deadline tracked.");
      setReplacementModalOpen(false);
      setReplacementReason("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit replacement request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI metrics
  const activeCount = placements.filter((p) => p.status === "ACTIVE").length;
  const noticesCount = placements.reduce((acc, p) => acc + p.removalNotices.length, 0);
  const replacementsCount = placements.reduce(
    (acc, p) => acc + p.replacementRequests.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
          Placements, Notice & Replacement Tracker
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Enforce contract policies: mandatory 3-day employer removal notice and 14-day SLA replacement fulfillment window.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Active Placements
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-neutral-900 font-heading">
              {activeCount}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            3-Day Notices Recorded
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-amber-900 font-heading">
              {noticesCount}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            14-Day Replacements Tracked
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-blue-900 font-heading">
              {replacementsCount}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <RefreshCw size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Policy banner */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-start justify-between gap-4">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-sm text-[#008751] font-heading">
            Platform Placement Guarantee Policies
          </p>
          <p className="text-neutral-300">
            1. <strong>3-Day Notice Policy:</strong> Employers terminating a worker contract must provide a minimum 3-day notice window before severance.
          </p>
          <p className="text-neutral-300">
            2. <strong>14-Day Replacement Policy:</strong> If a placement terminates under guarantee, Staff Guru commits to matching a vetted replacement candidate within 14 calendar days.
          </p>
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50/75 border-b border-black/10 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Placing Parties</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Start Date</th>
                <th className="px-6 py-3.5">Policy Tracking</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    No active placements found in the system.
                  </td>
                </tr>
              ) : (
                placements.map((p) => {
                  const hasNotices = p.removalNotices.length > 0;
                  const latestNotice = p.removalNotices[p.removalNotices.length - 1];
                  const hasReplacements = p.replacementRequests.length > 0;
                  const latestRep = p.replacementRequests[p.replacementRequests.length - 1];

                  // Calculate replacement deadline remaining days
                  let repRemainingDays: number | null = null;
                  let isOverdue = false;
                  if (latestRep?.dueAt) {
                    const diffMs = new Date(latestRep.dueAt).getTime() - Date.now();
                    repRemainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    isOverdue = repRemainingDays < 0;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">
                            {p.workerName}
                          </p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Building size={12} /> {p.employerName}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-neutral-700 font-medium">
                        {p.workerCategory}
                      </td>

                      <td className="px-6 py-4 text-neutral-600 text-xs font-mono">
                        {formatDateDDMMYYYY(p.startDate)}
                      </td>

                      {/* Policy notices & Replacement countdown */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {hasNotices && latestNotice && (
                            <div className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                              <span className="font-semibold">3-Day Notice Given:</span>{" "}
                              {formatDateDDMMYYYY(latestNotice.noticeDate)}
                            </div>
                          )}

                          {hasReplacements && latestRep && (
                            <div
                              className={`text-[11px] px-2 py-0.5 rounded-md inline-block border ${
                                isOverdue
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : repRemainingDays && repRemainingDays <= 3
                                  ? "bg-orange-50 text-orange-800 border-orange-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}
                            >
                              <span className="font-semibold">14-Day SLA:</span>{" "}
                              {isOverdue
                                ? `Overdue by ${Math.abs(repRemainingDays!)} days`
                                : `${repRemainingDays} days remaining`}
                            </div>
                          )}

                          {!hasNotices && !hasReplacements && (
                            <span className="text-xs text-neutral-400">In good standing</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-800 border-amber-200 hover:bg-amber-50 text-xs"
                            onClick={() => {
                              setSelectedPlacement(p);
                              setNoticeModalOpen(true);
                            }}
                          >
                            <Clock size={12} className="mr-1" />
                            3-Day Notice
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-800 border-blue-200 hover:bg-blue-50 text-xs"
                            onClick={() => {
                              setSelectedPlacement(p);
                              setReplacementModalOpen(true);
                            }}
                          >
                            <RefreshCw size={12} className="mr-1" />
                            14-Day Replacement
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Day Notice Modal */}
      {noticeModalOpen && selectedPlacement && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-black/10">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-heading">
                Record 3-Day Employer Removal Notice
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                For worker <strong>{selectedPlacement.workerName}</strong> at{" "}
                <strong>{selectedPlacement.employerName}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notice Submission Date
                </label>
                <input
                  type="date"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-black/15 rounded-lg focus:outline-none"
                  required
                />
              </div>

              {/* Effective End Date Preview */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-amber-900">
                  Calculated Effective Termination Date (3 Days Notice):
                </span>
                <p className="text-amber-800 font-medium">
                  {effectiveTerminationDatePreview}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Termination Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={noticeReason}
                  onChange={(e) => setNoticeReason(e.target.value)}
                  placeholder="e.g. Project scope altered; worker notified with 3 days severance timeline..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-black/15 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNoticeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Recording..." : "Record Notice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14-Day Replacement Modal */}
      {replacementModalOpen && selectedPlacement && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-black/10">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-heading">
                Initiate 14-Day Replacement Workflow
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Replace <strong>{selectedPlacement.workerName}</strong> for employer{" "}
                <strong>{selectedPlacement.employerName}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Platform guarantee activates a <strong>14-day SLA window</strong> to match and deploy a qualified replacement.
            </div>

            <form onSubmit={handleSubmitReplacement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Replacement Request Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  placeholder="e.g. Schedule misalignment; requesting replacement talent within 14-day policy..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-black/15 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplacementModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Initiating..." : "Initiate 14-Day Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
