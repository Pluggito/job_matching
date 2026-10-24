"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, Phone, Building2, X, Loader2, CheckCircle2 } from "lucide-react";
import { scheduleInterviewAction } from "@/actions/handshake";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workerProfileId: string;
  candidateName: string;
  hiringRequestId: string;
  jobTitle: string;
  existingInterview?: {
    interviewDate?: string | Date | null;
    interviewType?: string | null;
    interviewNotes?: string | null;
  } | null;
  onSuccess?: () => void;
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  workerProfileId,
  candidateName,
  hiringRequestId,
  jobTitle,
  existingInterview,
  onSuccess,
}: Props) {
  // Default to tomorrow 10:00 AM
  const defaultDate = () => {
    if (existingInterview?.interviewDate) {
      const d = new Date(existingInterview.interviewDate);
      return d.toISOString().slice(0, 16);
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [interviewDate, setInterviewDate] = useState<string>(defaultDate());
  const [interviewType, setInterviewType] = useState<"PHONE" | "VIDEO" | "ONSITE">(
    (existingInterview?.interviewType as any) || "PHONE"
  );
  const [interviewNotes, setInterviewNotes] = useState<string>(
    existingInterview?.interviewNotes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      setError("Please choose a date and time for the interview.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await scheduleInterviewAction({
        workerProfileId,
        hiringRequestId,
        interviewDate: new Date(interviewDate).toISOString(),
        interviewType,
        interviewNotes,
      });

      if (res.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.error || "Failed to schedule interview.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to schedule interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ng)] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/15">
              Candidate Coordination
            </span>
            <h3 className="text-lg font-bold text-neutral-900 mt-1 font-heading">
              {existingInterview?.interviewDate ? "Reschedule Interview" : "Invite to Interview"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[var(--ng)] mx-auto flex items-center justify-center shadow-xs animate-in zoom-in-75">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Interview Invitation Sent!</h4>
            <p className="text-xs text-neutral-500">
              {candidateName} has been notified via dashboard and mobile push notification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Candidate & Job Pill */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-[var(--ng)] shrink-0 font-bold">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">{candidateName}</p>
                <p className="text-[11px] text-neutral-500 truncate">Position: {jobTitle}</p>
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Interview Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "PHONE", label: "Phone Call", icon: Phone },
                  { id: "VIDEO", label: "Video Call", icon: Video },
                  { id: "ONSITE", label: "Onsite Test", icon: Building2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setInterviewType(id as any)}
                    className={`py-3 px-2 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      interviewType === id
                        ? "border-[var(--ng)] bg-emerald-50/50 text-[var(--ng)] font-bold shadow-2xs"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Proposed Date & Time</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  min={minDateTime}
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:bg-white focus:outline-none focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400">Timezone: West Africa Time (WAT / Nigeria)</p>
            </div>

            {/* Notes / Questions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">
                Pre-screening Notes / Instructions{" "}
                <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="e.g. Please bring your portfolio samples or be near your sewing machine / workshop..."
                className="w-full p-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all resize-none"
              />
              <div className="flex justify-end text-[10px] text-neutral-400">
                <span>{interviewNotes.length}/300</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[var(--ng)] hover:bg-[#007344] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Calendar size={14} />
                    {existingInterview?.interviewDate ? "Update Invitation" : "Send Interview Invite"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
