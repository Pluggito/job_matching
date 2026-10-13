"use client";

import { useState } from "react";
import { CheckCircle2, Clock, ExternalLink, Loader2, FileText, AlertCircle } from "lucide-react";
import { confirmDirectPaymentProof } from "@/actions/proofs";

interface PaymentProofItem {
  id: string;
  amountKobo: number;
  receiptUrl: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  workerConfirmedAt?: Date | string | null;
  createdAt: Date | string;
}

interface WorkerPaymentProofConfirmationProps {
  proofs: PaymentProofItem[];
  className?: string;
}

export default function WorkerPaymentProofConfirmation({
  proofs,
  className = "",
}: WorkerPaymentProofConfirmationProps) {
  const [proofList, setProofList] = useState(proofs);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (proofId: string) => {
    setLoadingId(proofId);
    setError(null);

    try {
      await confirmDirectPaymentProof(proofId);
      setProofList((prev) =>
        prev.map((p) =>
          p.id === proofId
            ? {
                ...p,
                status: "confirmed_by_worker",
                workerConfirmedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (err: any) {
      console.error("[Confirm Proof Error]:", err);
      setError(err?.message || "Failed to confirm payment receipt.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!proofList || proofList.length === 0) {
    return null;
  }

  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
        Direct Bank Transfer Proofs ({proofList.length})
      </h4>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {proofList.map((proof) => {
        const isConfirmed = proof.status === "confirmed_by_worker";
        const nairaAmount = (proof.amountKobo / 100).toLocaleString();

        return (
          <div
            key={proof.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[var(--ink)]">
                  ₦{nairaAmount}
                </span>
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    <CheckCircle2 size={12} /> Confirmed by You
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                    <Clock size={12} /> Awaiting Confirmation
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--ink-soft)]">
                {proof.reference && <span>Ref: {proof.reference}</span>}
                <span>
                  Date: {new Date(proof.createdAt).toLocaleDateString()}
                </span>
                <a
                  href={proof.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--ng)] font-bold hover:underline"
                >
                  <FileText size={12} /> View Receipt <ExternalLink size={10} />
                </a>
              </div>

              {proof.notes && (
                <p className="text-xs text-gray-600 italic">"{proof.notes}"</p>
              )}
            </div>

            <div className="shrink-0">
              {!isConfirmed && (
                <button
                  onClick={() => handleConfirm(proof.id)}
                  disabled={loadingId === proof.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ng)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--ng-deep)] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {loadingId === proof.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm Funds Received</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
