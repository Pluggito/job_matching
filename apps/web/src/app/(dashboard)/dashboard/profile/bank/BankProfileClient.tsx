"use client";

import { useState } from "react";
import { NIGERIAN_BANKS, validateNuban, maskAccountNumber , formatDateTimeDDMMYYYY } from "@repo/shared";
import { saveWorkerBankDetails } from "@/actions/bank";
import { Building, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Lock, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BankProfileClientProps {
  initialBank: {
    bankName: string;
    bankCode: string;
    accountNumberMasked: string;
    accountName: string;
    payoutHoldUntil?: Date | null;
  } | null;
  openToErrands: boolean;
}

export default function BankProfileClient({ initialBank, openToErrands }: BankProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!initialBank);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    password: "",
  });

  const cleanAccount = formData.accountNumber.replace(/\D/g, "");
  const validation = formData.bankCode && cleanAccount.length === 10
    ? validateNuban(formData.bankCode, cleanAccount)
    : null;

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = NIGERIAN_BANKS.find((b) => b.code === e.target.value);
    setFormData((prev) => ({
      ...prev,
      bankName: selected ? selected.name : "",
      bankCode: selected ? selected.code : "",
    }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, accountNumber: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankCode || cleanAccount.length !== 10) {
      setErrorMsg("Please select your bank and enter a valid 10-digit account number.");
      return;
    }
    if (!validation?.isValid) {
      setErrorMsg(validation?.error || "Invalid 10-digit check digit for selected bank.");
      return;
    }
    if (!formData.accountName.trim()) {
      setErrorMsg("Please enter the account name registered with your bank.");
      return;
    }
    if (initialBank && !formData.password.trim()) {
      setErrorMsg("Please enter your account password to confirm changing your bank details.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await saveWorkerBankDetails({
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        accountNumber: cleanAccount,
        accountName: formData.accountName,
        password: formData.password || undefined,
      });

      if (res.success) {
        setSuccessMsg("Bank account on file saved successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save bank account.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasHold = initialBank?.payoutHoldUntil && new Date(initialBank.payoutHoldUntil) > new Date();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Bank Account on File</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">
            Used strictly for disbursing your 70% Alabaru errand payouts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-xs font-medium text-green-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-700 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-900 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-700 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Current Active Account Card */}
      {initialBank && !isEditing && (
        <div className="bg-white rounded-3xl border border-[var(--line)] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
              <ShieldCheck size={16} /> Active Bank Account on File
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-[var(--green)] hover:underline"
            >
              Update Bank Details
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500 block">Bank Name</span>
              <span className="font-bold text-[var(--ink)]">{initialBank.bankName}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Account Number</span>
              <span className="font-mono font-bold text-[var(--ink)]">
                {initialBank.accountNumberMasked}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-gray-500 block">Account Holder Name</span>
              <span className="font-bold uppercase text-[var(--ink)]">{initialBank.accountName}</span>
            </div>
          </div>

          {hasHold && (
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Lock size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Security Payout Hold Active:</span> Replaced bank accounts have a 24-hour verification hold. Payouts will automatically disburse to this account after{" "}
                {formatDateTimeDDMMYYYY(initialBank.payoutHoldUntil!)}.
              </div>
            </div>
          )}

          <div className="pt-2 text-[11px] text-gray-400">
            Encrypted with AES-256-GCM. Never shown to employers or third parties.
          </div>
        </div>
      )}

      {/* Edit / Add Bank Account Form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[var(--line)] p-6 sm:p-8 space-y-5 shadow-sm"
        >
          <div className="border-b border-[var(--line)] pb-3">
            <h3 className="text-base font-bold text-[var(--ink)]">
              {initialBank ? "Update Bank Account on File" : "Add Bank Account on File"}
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5">
              {initialBank
                ? "Updating your bank account will trigger a 24-hour security payout hold to protect against account hijacking."
                : "Enter your Nigerian bank account to receive direct errand earnings."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
                Bank
              </label>
              <select
                value={formData.bankCode}
                onChange={handleBankChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-black text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
              >
                <option value="">-- Choose Nigerian Bank --</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
                  10-Digit NUBAN Account Number
                </label>
                <span className="text-[11px] font-mono text-gray-500">
                  {cleanAccount.length}/10 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={formData.accountNumber}
                onChange={handleAccountChange}
                placeholder="0123456789"
                required
                className={`w-full h-11 px-4 font-mono rounded-xl border text-black text-sm focus:outline-none transition-all ${
                  cleanAccount.length === 10
                    ? validation?.isValid
                      ? "border-green-500 bg-green-50/30 ring-1 ring-green-500"
                      : "border-red-500 bg-red-50/30 ring-1 ring-red-500"
                    : "border-[var(--line)] bg-[var(--canvas)] focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)]"
                }`}
              />
              {cleanAccount.length === 10 && (
                <div className="text-xs mt-1">
                  {validation?.isValid ? (
                    <span className="text-green-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={13} /> Valid CBN check digit verified offline.
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 font-medium">
                      <AlertCircle size={13} /> {validation?.error}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
                Account Name (as registered with your bank)
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
                placeholder="e.g. ADEBAYO ADEWALE"
                required
                className="w-full h-11 px-4 uppercase rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-black text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
              />
            </div>

            {/* Re-auth Password Field (Required when replacing bank account on file) */}
            {initialBank && (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-900 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
                    Confirm Account Password
                  </label>
                  <span className="text-[11px] font-medium text-amber-700">Re-authentication Required</span>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your current password"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-amber-300 bg-white text-black text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                />
                <p className="text-[11px] text-amber-800 leading-snug">
                  To protect your funds, changing your bank account on file requires your account password. (Passwordless accounts are blocked until an approved email provider is configured).
                </p>
              </div>
            )}

            {/* Pending Consent Text */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 leading-relaxed italic">
              <span className="font-semibold text-amber-800 not-italic">[PENDING CLIENT / LEGAL APPROVAL]</span>{" "}
              By providing your bank details, you authorize Staff Guru to disburse your 70% errand earnings directly to this account on file upon verified task completion.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--ng)]/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Save Bank Account on File
              </button>
              {initialBank && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-11 px-4 rounded-xl border border-[var(--line)] text-xs font-bold text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
