"use client";

import React, { useState } from "react";
import { Star, X, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { submitRatingAction, SubmitRatingInput } from "@/actions/ratings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  targetSubtitle?: string;
  errandId?: string;
  placementId?: string;
  existingRating?: {
    score: number;
    feedback?: string | null;
  } | null;
  onSuccess?: (rating: { score: number; feedback?: string | null }) => void;
}

const STAR_LABELS = [
  "Tap to rate",
  "1 Star · Unsatisfactory",
  "2 Stars · Fair / Needs Work",
  "3 Stars · Good / Completed",
  "4 Stars · Very Good / Reliable",
  "5 Stars · Exceptional / Highly Recommended 🌟",
];

export default function SubmitRatingModal({
  isOpen,
  onClose,
  targetTitle,
  targetSubtitle = "Verified Review",
  errandId,
  placementId,
  existingRating,
  onSuccess,
}: Props) {
  const [score, setScore] = useState<number>(existingRating?.score || 5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(existingRating?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeDisplayScore = hoverScore || score;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || score < 1) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitRatingAction({
        errandId,
        placementId,
        score,
        feedback,
      });

      if (res.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess({ score, feedback });
        }
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.error || "Failed to submit rating.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ng)] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/15">
              {targetSubtitle}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 mt-1 font-heading">
              {existingRating ? "Update Your Review" : "Leave a Rating & Review"}
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
            <h4 className="text-base font-bold text-neutral-900">Review Submitted!</h4>
            <p className="text-xs text-neutral-500">
              Thank you for helping maintain quality and trust on Staff Guru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Item Pill */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-[var(--ng)] shrink-0 font-bold">
                ⭐
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">{targetTitle}</p>
                <p className="text-[11px] text-neutral-500">Verified engagement completed</p>
              </div>
            </div>

            {/* Interactive Stars */}
            <div className="space-y-2 text-center py-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= activeDisplayScore;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setScore(starVal)}
                      onMouseEnter={() => setHoverScore(starVal)}
                      onMouseLeave={() => setHoverScore(0)}
                      className="p-1 cursor-pointer transition-transform duration-150 hover:scale-125 focus:outline-none"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                            : "fill-neutral-100 text-neutral-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-neutral-700 min-h-[18px]">
                {STAR_LABELS[activeDisplayScore] || STAR_LABELS[0]}
              </p>
            </div>

            {/* Feedback textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">
                Written Feedback <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Share your experience: punctuality, quality of work, attitude..."
                className="w-full p-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[var(--ng)]" /> Checked by moderation before public profile display
                </span>
                <span>{feedback.length}/500</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Actions */}
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star size={14} className="fill-white" />
                    {existingRating ? "Update Review" : "Submit Review"}
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
