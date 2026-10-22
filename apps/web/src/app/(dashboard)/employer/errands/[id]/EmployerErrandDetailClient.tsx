"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  MessageSquare,
  Camera,
  Send,
  Loader2,
  FileCheck,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  Bike,
} from "lucide-react";
import { formatNaira } from "@repo/shared";
import {
  approveErrandCompletion,
  cancelOpenErrandEmployer,
  requestErrandChanges,
  reportErrandProblem,
} from "@/actions/errands";
import { useErrandChat } from "@/hooks/useErrandChat";

interface Props {
  errand: {
    id: string;
    title: string;
    type: string;
    status: string;
    description: string;
    locationState: string;
    locationArea: string;
    address: string;
    dropoffAddress?: string | null;
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
    revisionRequestedAt?: string | null;
    revisionNotes?: string | null;
    revisionGraceExpiresAt?: string | null;
  };
  runner?: {
    id: string;
    category: string;
    locationState: string;
  } | null;
  deliveryPin?: string | null;
  initialMessages: Array<{
    id: string;
    senderId: string;
    content: string;
    attachmentUrl?: string | null;
    status?: string;
    deliveredAt?: string | null;
    readAt?: string | null;
    createdAt: string;
  }>;
  currentUserId: string;
}

export default function EmployerErrandDetailClient({
  errand,
  runner,
  deliveryPin,
  initialMessages,
  currentUserId,
}: Props) {
  const {
    messages,
    sendMessage,
    sendTyping,
    isCounterpartTyping,
    isConnected,
  } = useErrandChat({
    errandId: errand.id,
    initialMessages,
    currentUserId,
  });

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Revision state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);

  // Dispute state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("INCOMPLETE_TASK");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [isFilingDispute, setIsFilingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    sendTyping(false);

    try {
      const res = await sendMessage(content);
      if (!res.success) {
        alert(res.error || "Failed to send message.");
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you satisfied with the submitted proof? Approving will release payout to the runner.")) {
      return;
    }
    setIsApproving(true);
    setApproveError(null);
    try {
      const res = await approveErrandCompletion(errand.id);
      if (res.success) {
        window.location.reload();
      } else {
        setApproveError(('error' in res ? (res.error as string) : null) || "Failed to approve completion");
      }
    } catch (err: any) {
      setApproveError(err?.message || "An error occurred");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotesInput.trim()) return;

    setIsSubmittingRevision(true);
    setRevisionError(null);
    try {
      const res = await requestErrandChanges({
        errandId: errand.id,
        notes: revisionNotesInput.trim(),
      });
      if (res.success) {
        window.location.reload();
      } else {
        setRevisionError(('error' in res ? (res.error as string) : null) || "Failed to request changes.");
      }
    } catch (err: any) {
      setRevisionError(err?.message || "Failed to request changes.");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) return;

    setIsFilingDispute(true);
    setDisputeError(null);
    try {
      const res = await reportErrandProblem({
        errandId: errand.id,
        reason: disputeReason,
        description: disputeDescription.trim(),
      });
      if (res.success) {
        window.location.reload();
      } else {
        setDisputeError(('error' in res ? (res.error as string) : null) || "Failed to report dispute.");
      }
    } catch (err: any) {
      setDisputeError(err?.message || "Failed to report dispute.");
    } finally {
      setIsFilingDispute(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Enter cancellation reason (100% full refund):");
    if (!reason) return;
    try {
      const res = await cancelOpenErrandEmployer(errand.id, reason);
      if (res.success) {
        window.location.reload();
      } else {
        alert(('error' in res ? (res.error as string) : null) || "Failed to cancel");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to cancel");
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/employer/errands"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-2 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Errands
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200/80 px-2.5 py-1 rounded-md shadow-2xs">
              {errand.type.replace("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/80 shadow-2xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  errand.status === "completed"
                    ? "bg-[#008751]"
                    : errand.status === "in_progress" || errand.status === "claimed"
                    ? "bg-[#008751] animate-pulse"
                    : errand.status === "disputed"
                    ? "bg-red-500"
                    : "bg-neutral-400"
                }`}
              />
              {errand.status.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1.5 tracking-tight font-heading">{errand.title}</h1>
        </div>

        <div className="text-right sm:self-center">
          <span className="text-xs text-neutral-500 block font-medium">Total Budget Paid</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
            {formatNaira(errand.budgetKobo)}
          </span>
        </div>
      </div>

      {/* Runner Accepted & Escrow Payment Required Banner */}
      {(errand.status === "claimed" || errand.status === "pending_payment") && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-300 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--ng)] text-white flex items-center justify-center shrink-0">
              <Bike size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950">Runner Accepted Your Errand! 🏃‍♂️</h4>
              <p className="text-xs text-emerald-800">
                A verified runner has accepted your task. Complete escrow funding (Task Price + Outreach Fee) to activate dispatch.
              </p>
            </div>
          </div>
          <Link
            href={`/employer/errands/${errand.id}/checkout`}
            className="h-11 px-5 rounded-xl bg-[var(--ng)] hover:bg-[#007043] text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0"
          >
            <ShieldCheck size={16} />
            <span>Pay & Activate Task &rarr;</span>
          </Link>
        </div>
      )}

      {/* Errand Live in Feed Banner (When Open and Not Yet Claimed) */}
      {errand.status === "open" && !runner && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 flex items-start gap-3 text-blue-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Bike size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-blue-950">Errand Live & Broadcasted 📡</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Your task is live on the Alabaru network for runners in {errand.locationArea}, {errand.locationState}. You will be prompted to fund the task price and creation fee only when a runner accepts.
            </p>
          </div>
        </div>
      )}

      {/* Disputed Alert Banner */}
      {errand.status === "disputed" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Dispute Under Admin Review</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              A problem was reported on this errand. Our mediation team has been notified and is inspecting the execution history and submitted materials to arbitrate a resolution.
            </p>
          </div>
        </div>
      )}

      {/* Revision Requested Notice */}
      {errand.revisionNotes && errand.status === "in_progress" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3 text-blue-900">
          <RotateCcw className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Revisions in Progress</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              You requested changes: <strong>"{errand.revisionNotes}"</strong>. The runner has been given a grace window to re-submit proof before {errand.revisionGraceExpiresAt ? new Date(errand.revisionGraceExpiresAt).toLocaleString() : "the deadline"}.
            </p>
          </div>
        </div>
      )}

      {/* Delivery PIN Banner (for pickup & delivery tasks) */}
      {deliveryPin && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">Security Delivery PIN</h4>
              <p className="text-xs text-amber-800">
                Give this 6-digit PIN to the recipient. The runner must input it to verify delivery handover.
              </p>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl tracking-widest text-amber-900 bg-white px-5 py-2.5 rounded-xl border border-amber-300 shrink-0 text-center">
            {deliveryPin}
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details & Proof */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-base text-neutral-900">Task Instructions</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {errand.description}
            </p>

            <div className="pt-4 border-t border-neutral-200/60 space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-neutral-400" />
                <span><strong className="text-neutral-800">Address:</strong> {errand.address}, {errand.locationArea}, {errand.locationState}</span>
              </div>
              {errand.dropoffAddress && (
                <div className="flex items-center gap-2 text-emerald-800">
                  <MapPin size={14} />
                  <span><strong>Dropoff:</strong> {errand.dropoffAddress}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-neutral-400" />
                <span><strong className="text-neutral-800">Deadline:</strong> {new Date(errand.deadline).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-neutral-400" />
                <span><strong className="text-neutral-800">Required Proof:</strong> {errand.requiredProof}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200/60 flex flex-wrap items-center justify-between gap-3">
              {errand.status === "open" && (
                <button
                  onClick={handleCancel}
                  className="py-2 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel Errand (100% Refund)
                </button>
              )}

              {["claimed", "in_progress"].includes(errand.status) && (
                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <AlertTriangle size={14} /> Report a Problem
                </button>
              )}
            </div>
          </div>

          {/* Proof Review Section */}
          {errand.status === "proof_submitted" && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <FileCheck size={20} />
                <h3>Runner Submitted Execution Proof</h3>
              </div>
              <p className="text-xs text-neutral-600">
                The runner has submitted photographic evidence. Please review and confirm completion. Funds will automatically release in 24 hours if no dispute is raised.
              </p>

              {approveError && (
                <p className="text-xs text-red-600 font-medium">{approveError}</p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve Proof & Release Payout
                </button>

                <button
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="py-3 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-semibold hover:bg-neutral-100 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw size={15} /> Request Changes
                </button>

                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="py-3 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <AlertTriangle size={15} /> Report Problem
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: In-App Chat with Redaction */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-neutral-500" />
              <h3 className="font-semibold text-sm text-neutral-900">Errand Coordination Chat</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"}`} />
              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-md font-semibold border border-neutral-200/60">
                {isConnected ? "Live Chat" : "Protected"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 mb-3 bg-neutral-50 p-2 rounded-lg border border-neutral-200/50">
            Direct phone numbers and bank details are hidden until task completion for security.
          </p>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {messages.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-12">
                No messages yet. Send a message to coordinate with the runner.
              </p>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isMe
                          ? "bg-[#008751] text-white rounded-br-xs"
                          : "bg-neutral-100 text-neutral-900 rounded-bl-xs border border-neutral-200/60"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span className={`text-[11px] font-bold ${m.status === "read" ? "text-emerald-300" : "opacity-75"}`}>
                          {m.status === "sending" ? "🕒" : m.status === "read" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Typing Indicator */}
          {isCounterpartTyping && (
            <div className="text-[11px] text-neutral-500 italic flex items-center gap-1.5 px-2 py-1 mb-1 animate-in fade-in">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
              </span>
              <span>Runner is typing...</span>
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-200/70 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                sendTyping(e.target.value.length > 0);
              }}
              onBlur={() => sendTyping(false)}
              placeholder="Type message to runner..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="w-8 h-8 rounded-xl bg-[#008751] hover:bg-[#007043] text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      </div>

      {/* Modal: Request Changes (Revision Grace Window) */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-600" />
              Request Revisions
            </h3>
            <p className="text-xs text-neutral-500">
              Describe what is missing or needs improvement. The runner will receive a 24-hour grace window to submit revised proof.
            </p>

            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Revision Instructions
                </label>
                <textarea
                  value={revisionNotesInput}
                  onChange={(e) => setRevisionNotesInput(e.target.value)}
                  placeholder="e.g. Please capture a clearer angle of the property meter..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {revisionError && <p className="text-xs text-red-600 font-medium">{revisionError}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-600 border border-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision || !revisionNotesInput.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingRevision ? <Loader2 size={14} className="animate-spin" /> : "Send Revision Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report a Problem (Dispute) */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle size={18} />
              Report Errand Problem
            </h3>
            <p className="text-xs text-neutral-500">
              Filing a dispute pauses payout release and assigns a Staff Guru administrator to inspect evidence and arbitrate a resolution.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Problem Category
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs bg-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="INCOMPLETE_TASK">Incomplete Task / Unfinished Work</option>
                  <option value="POOR_QUALITY">Poor Quality / False Proof</option>
                  <option value="DAMAGED_ITEM">Damaged or Lost Item</option>
                  <option value="NO_SHOW">Runner No-Show / Unresponsive</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide detailed facts and context for admin review..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-black/15 text-xs focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {disputeError && <p className="text-xs text-red-600 font-medium">{disputeError}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-600 border border-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFilingDispute || !disputeDescription.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {isFilingDispute ? <Loader2 size={14} className="animate-spin" /> : "Submit Dispute to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
