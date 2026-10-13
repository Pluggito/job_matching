"use client";

import * as React from "react";
import {
  Star,
  Eye,
  EyeOff,
  ShieldAlert,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { moderateRating } from "@/lib/actions";

export interface RatingItem {
  id: string;
  placementId: string | null;
  errandId?: string | null;
  score: number;
  feedback: string | null;
  moderated: boolean;
  createdAt: string;
  workerName: string;
  workerCategory: string;
  employerName: string;
}

interface RatingsModerationViewProps {
  initialRatings: RatingItem[];
}

export default function RatingsModerationView({
  initialRatings,
}: RatingsModerationViewProps) {
  const [ratings, setRatings] = React.useState<RatingItem[]>(initialRatings);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleToggleModerate = async (item: RatingItem) => {
    setLoadingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    const nextState = !item.moderated;
    try {
      await moderateRating({
        ratingId: item.id,
        moderated: nextState,
        reason: nextState ? "Moderated due to content guidelines" : "Restored rating",
      });

      setRatings((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, moderated: nextState } : r))
      );

      setSuccessMsg(
        nextState
          ? "Rating hidden from public view."
          : "Rating restored to public view."
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update rating moderation status.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
          Ratings & Reviews Moderation
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review ratings submitted by employers. Enforce platform integrity by hiding abusive or fraudulent feedback.
        </p>
      </div>

      {/* Policy banner */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-black/10 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-600 space-y-1">
          <p className="font-semibold text-neutral-900">
            Rating Moderation Governance Policy:
          </p>
          <p>
            Admins may only <strong>flag or hide</strong> feedback violating community standards. To preserve review integrity, review text and scores can never be modified or altered.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
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

      {/* Ratings Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50/75 border-b border-black/10 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Professional / Worker</th>
                <th className="px-6 py-3.5">Employer</th>
                <th className="px-6 py-3.5">Score</th>
                <th className="px-6 py-3.5">Employer Feedback</th>
                <th className="px-6 py-3.5">Visibility Status</th>
                <th className="px-6 py-3.5 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {ratings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    No ratings submitted yet.
                  </td>
                </tr>
              ) : (
                ratings.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">{item.workerName}</p>
                      <p className="text-xs text-neutral-500">{item.workerCategory}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-800 flex items-center gap-1.5">
                        <Building size={14} className="text-neutral-400" />
                        {item.employerName}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= item.score
                                ? "text-amber-400 fill-amber-400"
                                : "text-neutral-300"
                            }
                          />
                        ))}
                        <span className="text-xs font-bold text-neutral-700 ml-1">
                          {item.score}.0
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <p className="text-xs text-neutral-700 leading-relaxed italic bg-neutral-50 p-2.5 rounded-xl border border-black/5">
                        "{item.feedback || "No comment provided."}"
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {item.moderated ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <EyeOff size={12} /> Hidden
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <Eye size={12} /> Visible Publicly
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs font-semibold gap-1.5 ${
                          item.moderated
                            ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            : "text-rose-700 border-rose-200 hover:bg-rose-50"
                        }`}
                        disabled={loadingId === item.id}
                        onClick={() => handleToggleModerate(item)}
                      >
                        {item.moderated ? (
                          <>
                            <Eye size={14} /> Restore
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Hide Review
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
