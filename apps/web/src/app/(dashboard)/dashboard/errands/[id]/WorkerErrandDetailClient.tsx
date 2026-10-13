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
  ChevronLeft,
  Camera,
  KeyRound,
  MessageSquare,
  Send,
  Building,
  User,
  ExternalLink,
} from "lucide-react";
import { formatNaira } from "@repo/shared";
import {
  startErrandExecution,
  verifyErrandDeliveryPin,
  submitErrandProof,
} from "@/actions/errands";
import { sendErrandMessage } from "@/actions/errandMessages";

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
    workerPayoutKobo: number;
    deadline: string;
    requiredProof: string;
    claimedAt: string | null;
    proofSubmittedAt: string | null;
    completedAt: string | null;
    revisionRequestedAt?: string | null;
    revisionNotes?: string | null;
    revisionGraceExpiresAt?: string | null;
    handoffAttempts: number;
  };
  employerInfo: {
    name: string;
    location: string;
  };
  initialMessages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
  currentUserId: string;
}

export default function WorkerErrandDetailClient({
  errand,
  employerInfo,
  initialMessages,
  currentUserId,
}: Props) {
  const [status, setStatus] = useState(errand.status);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Execution states
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // PIN modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Proof modal
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofNotes, setProofNotes] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const handleStartErrand = async () => {
    setIsStarting(true);
    setStartError(null);
    try {
      const res = await startErrandExecution(errand.id);
      if (res.success) {
        setStatus("in_progress");
      } else {
        setStartError(('error' in res ? (res.error as string) : null) || "Failed to start execution");
      }
    } catch (err: any) {
      setStartError(err?.message || "Failed to start execution");
    } finally {
      setIsStarting(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingPin(true);
    setPinError(null);
    try {
      const res = await verifyErrandDeliveryPin(errand.id, pinCode);
      if (res.success) {
        setPinSuccess(true);
        setTimeout(() => {
          setIsPinModalOpen(false);
          setPinSuccess(false);
          setPinCode("");
        }, 1200);
      } else {
        setPinError(('error' in res ? (res.error as string) : null) || "Incorrect delivery PIN.");
      }
    } catch (err: any) {
      setPinError(err?.message || "PIN verification failed");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProof(true);
    setProofError(null);
    try {
      const photoKeys = [`proof_${errand.id}_${Date.now()}`];
      const res = await submitErrandProof({
        errandId: errand.id,
        photoKeys,
        notes: proofNotes.trim(),
      });
      if (res.success) {
        setStatus("proof_submitted");
        setIsProofModalOpen(false);
        setProofNotes("");
      } else {
        setProofError(('error' in res ? (res.error as string) : null) || "Failed to submit proof");
      }
    } catch (err: any) {
      setProofError(err?.message || "Proof submission failed");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: currentUserId,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await sendErrandMessage({
        errandId: errand.id,
        content,
      });

      if (!res.success) {
        alert(('error' in res ? (res.error as string) : null) || "Failed to send message.");
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/dashboard/errands"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-[var(--ink)]"
        >
          <ChevronLeft size={16} /> Back to Errands Hub
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Task ID: #{errand.id.slice(0, 8)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === "claimed"
                ? "bg-amber-100 text-amber-800"
                : status === "in_progress"
                ? "bg-blue-100 text-blue-800 animate-pulse"
                : status === "proof_submitted"
                ? "bg-purple-100 text-purple-800"
                : status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
              <Bike size={16} /> {errand.type.replace("_", " ")}
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">{errand.title}</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">{errand.description}</p>

            {/* Revision Requested Notice */}
            {errand.revisionNotes && status === "in_progress" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1 text-xs text-blue-900">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <AlertCircle size={15} className="text-blue-600" />
                  <span>Changes Requested by Employer</span>
                </div>
                <p className="text-blue-800">
                  "{errand.revisionNotes}"
                </p>
                <p className="text-[11px] text-blue-600 pt-1">
                  Please update and re-submit proof before {errand.revisionGraceExpiresAt ? new Date(errand.revisionGraceExpiresAt).toLocaleString() : "the deadline"}.
                </p>
              </div>
            )}

            {/* Financial Payout Summary */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Your Net Earnings (70% Payout)
                </span>
                <p className="text-2xl font-black text-emerald-700 font-mono">
                  {formatNaira(errand.workerPayoutKobo)}
                </p>
              </div>
              <div className="text-right text-[11px] text-emerald-800 sm:border-l sm:border-emerald-200 sm:pl-4">
                <span>Task Budget: <strong>{formatNaira(errand.budgetKobo)}</strong></span>
                <p className="text-neutral-500">Platform fee (30%) deducted automatically.</p>
              </div>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-black/5 space-y-1">
                <span className="text-neutral-500 font-semibold flex items-center gap-1">
                  <MapPin size={14} className="text-neutral-400" /> Errand Location
                </span>
                <p className="font-bold text-[var(--ink)]">{errand.address}</p>
                <p className="text-neutral-500">{errand.locationArea}, {errand.locationState}</p>
                {errand.dropoffAddress && (
                  <div className="mt-2 pt-2 border-t border-black/5">
                    <span className="text-neutral-500 font-semibold">Dropoff Address:</span>
                    <p className="font-bold text-[var(--ink)]">{errand.dropoffAddress}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-black/5 space-y-1">
                <span className="text-neutral-500 font-semibold flex items-center gap-1">
                  <Clock size={14} className="text-neutral-400" /> Completion Deadline
                </span>
                <p className="font-bold text-[var(--ink)]">
                  {new Date(errand.deadline).toLocaleString()}
                </p>
                <p className="text-neutral-500 mt-2 font-semibold">Required Proof:</p>
                <p className="text-neutral-700">{errand.requiredProof}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-black/10 flex flex-wrap items-center gap-3">
              {status === "claimed" && (
                <button
                  onClick={handleStartErrand}
                  disabled={isStarting}
                  className="px-6 py-2.5 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isStarting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Start Errand Execution
                </button>
              )}

              {status === "in_progress" && (
                <>
                  {errand.type === "pickup_delivery" && (
                    <button
                      onClick={() => setIsPinModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound size={14} /> Verify Delivery PIN
                    </button>
                  )}
                  <button
                    onClick={() => setIsProofModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={14} /> Submit Completion Proof
                  </button>
                </>
              )}

              {status === "proof_submitted" && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2 w-full">
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0" />
                  <span>
                    Proof submitted successfully! The employer has 24 hours to review. If no dispute is raised, your <strong>{formatNaira(errand.workerPayoutKobo)}</strong> payout will automatically transfer to your bank.
                  </span>
                </div>
              )}

              {status === "completed" && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-900 flex items-center gap-2 w-full">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>
                    Errand approved! Payout of <strong>{formatNaira(errand.workerPayoutKobo)}</strong> has been processed to your registered Nigerian bank account.
                  </span>
                </div>
              )}

              {startError && (
                <p className="text-xs text-red-600 font-medium w-full">{startError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Coordination Chat (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xs flex flex-col h-[560px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-black/10 flex items-center justify-between bg-neutral-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--ng)] text-white flex items-center justify-center font-bold text-xs">
                  <Building size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)]">{employerInfo.name}</h3>
                  <span className="text-[10px] text-neutral-500">Task Employer</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Active Thread
              </span>
            </div>

            {/* Chat Privacy Warning */}
            <div className="p-2.5 bg-amber-50/80 border-b border-amber-200/50 text-[10px] text-amber-900 flex items-center gap-1.5 px-3">
              <AlertCircle size={12} className="shrink-0 text-amber-700" />
              <span>Safety Filter Active: Phone numbers and bank details are hidden.</span>
            </div>

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-4">
                  <MessageSquare size={24} className="mb-2 opacity-40" />
                  <p className="text-xs">No messages yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Send a message to clarify task instructions or give updates.
                  </p>
                </div>
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
                            ? "bg-[var(--ng)] text-white rounded-br-xs"
                            : "bg-neutral-100 text-[var(--ink)] rounded-bl-xs"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-black/10 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type coordination message..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[var(--ng)]"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="w-8 h-8 rounded-xl bg-[var(--ng)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal: Verify Delivery PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <KeyRound size={18} className="text-amber-600" />
              Verify Delivery PIN
            </h3>
            <p className="text-xs text-neutral-500">
              Enter the 6-digit PIN provided by the recipient at the dropoff location:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit PIN"
                className="w-full py-3 text-center font-mono font-bold text-2xl tracking-widest border border-black/20 rounded-xl focus:ring-2 focus:ring-amber-500"
                required
              />

              {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
              {pinSuccess && <p className="text-xs text-green-600 font-bold">Delivery PIN confirmed!</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-600 border border-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin || pinCode.length !== 6}
                  className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50"
                >
                  {isVerifyingPin ? <Loader2 size={14} className="animate-spin" /> : "Verify PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Errand Proof */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <Camera size={18} className="text-[var(--ng)]" />
              Submit Completion Proof
            </h3>
            <p className="text-xs text-neutral-500">
              Provide photographic evidence or notes confirming completion of "{errand.title}":
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-4">
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
                  onClick={() => setIsProofModalOpen(false)}
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
