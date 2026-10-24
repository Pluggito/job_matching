"use client";

import React, { useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import ScheduleInterviewModal from "@/components/interviews/ScheduleInterviewModal";
import { useRouter } from "next/navigation";

interface Props {
  workerProfileId: string;
  candidateName: string;
  hiringRequestId: string;
  jobTitle: string;
  existingInterview?: {
    interviewDate?: string | Date | null;
    interviewType?: string | null;
    interviewNotes?: string | null;
  } | null;
}

export default function ScheduleInterviewButton({
  workerProfileId,
  candidateName,
  hiringRequestId,
  jobTitle,
  existingInterview,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const isScheduled = Boolean(existingInterview?.interviewDate);

  const formattedDate = existingInterview?.interviewDate
    ? new Date(existingInterview.interviewDate).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {isScheduled ? (
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Calendar size={13} className="text-[var(--ng)] shrink-0" />
            <span className="truncate">Interview: {formattedDate}</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[11px] font-bold text-neutral-500 hover:text-[var(--ng)] flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw size={11} /> Reschedule
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="h-10 px-4 rounded-xl border border-neutral-300 hover:border-[var(--ng)] text-neutral-700 hover:text-[var(--ng)] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
        >
          <Calendar size={14} />
          <span>Schedule Interview</span>
        </button>
      )}

      <ScheduleInterviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workerProfileId={workerProfileId}
        candidateName={candidateName}
        hiringRequestId={hiringRequestId}
        jobTitle={jobTitle}
        existingInterview={existingInterview}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
