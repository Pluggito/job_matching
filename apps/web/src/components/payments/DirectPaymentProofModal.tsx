"use client";

import { useState } from "react";
import {
  Upload,
  Copy,
  Check,
  Building,
  User,
  Hash,
  AlertCircle,
  Loader2,
  FileCheck,
  X,
} from "lucide-react";
import { submitDirectPaymentProof } from "@/actions/proofs";
import { UploadButton } from "@/utils/uploadthing";

interface DirectPaymentProofModalProps {
  type: "placement" | "errand";
  placementId?: string;
  errandId?: string;
  workerProfileId: string;
  workerName: string;
  bankDetails?: {
    bankName: string;
    bankCode: string;
    accountNumberMasked: string;
    accountName: string;
  } | null;
  defaultAmountKobo?: number;
  triggerButtonText?: string;
  className?: string;
}

export default function DirectPaymentProofModal({
  type,
  placementId,
  errandId,
  workerProfileId,
  workerName,
  bankDetails,
  defaultAmountKobo,
  triggerButtonText = "Upload Direct Payment Proof",
  className = "",
}: DirectPaymentProofModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountNaira, setAmountNaira] = useState(
    defaultAmountKobo ? String(defaultAmountKobo / 100) : ""
  );
  const [receiptUrl, setReceiptUrl] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amountNaira.replace(/,/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    if (!receiptUrl.trim()) {
      setError("Please upload or provide a link to the bank transfer receipt.");
      return;
    }

    setLoading(true);

    try {
      await submitDirectPaymentProof({
        type,
        placementId,
        errandId,
        workerProfileId,
        amountKobo: Math.round(numericAmount * 100),
        receiptUrl: receiptUrl.trim(),
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("[Proof Upload Error]:", err);
      setError(err?.message || "Failed to submit payment proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-white hover:bg-black font-bold text-sm px-5 py-2.5 transition-all shadow-sm cursor-pointer ${className}`}
      >
        <Upload size={16} />
        <span>{triggerButtonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[var(--line)] max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-[var(--ink)]">
              Direct Worker Transfer
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Transfer funds directly to {workerName}'s bank account, then upload proof of payment.
            </p>

            {/* Worker Bank Account Details Card */}
            {bankDetails ? (
              <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ng)] mb-3">
                  Worker Bank Details
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
                      <Building size={14} /> Bank Name:
                    </span>
                    <span className="font-bold text-[var(--ink)]">
                      {bankDetails.bankName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
                      <Hash size={14} /> Account No:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {bankDetails.accountNumberMasked}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(bankDetails.accountNumberMasked, "acc")
                        }
                        className="rounded p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Copy account number"
                      >
                        {copiedField === "acc" ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
                      <User size={14} /> Account Name:
                    </span>
                    <span className="font-bold text-[var(--ink)] uppercase">
                      {bankDetails.accountName}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                Worker bank details are being updated on file. You may upload payment proof once direct transfer is completed.
              </div>
            )}

            {/* Proof Submission Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1">
                  Amount Transferred (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={amountNaira}
                  onChange={(e) => setAmountNaira(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium focus:border-[var(--ng)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1">
                  Transfer Receipt (Image / Screenshot) <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-2">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setReceiptUrl(res[0].url || (res[0] as any).ufsUrl);
                      }
                    }}
                    onUploadError={(err: Error) => {
                      setError(`Upload error: ${err.message}`);
                    }}
                    className="ut-button:bg-[var(--ng)] ut-button:ut-readying:bg-[var(--ng)]/50"
                  />

                  <div className="relative">
                    <input
                      type="url"
                      placeholder="Or paste receipt image URL"
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-mono focus:border-[var(--ng)] focus:outline-none"
                    />
                  </div>

                  {receiptUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                      <FileCheck size={14} /> Receipt attached:{" "}
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline truncate max-w-[200px]"
                      >
                        {receiptUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1">
                  Bank Reference / Narration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GTB/TRF/0921092 or salary narration"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--ng)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Transferred first month salary tranche"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2 text-sm focus:border-[var(--ng)] focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800 border border-green-200">
                  <FileCheck size={14} className="shrink-0" />
                  <span>Payment proof submitted successfully! Worker notified.</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--ng)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--ng-deep)] disabled:opacity-50 cursor-pointer shadow-md shadow-[var(--ng)]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Confirm & Upload Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
