"use client";

import { useState } from "react";
import { NIGERIAN_BANKS, validateNuban, maskAccountNumber } from "@repo/shared";
import { Building, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

export interface BankFormData {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

interface BankDetailsStepProps {
  formData: BankFormData;
  onChange: (data: BankFormData) => void;
  onValidChange?: (isValid: boolean) => void;
}

export default function BankDetailsStep({
  formData,
  onChange,
}: BankDetailsStepProps) {
  const [touched, setTouched] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const cleanAccount = (formData.accountNumber || "").replace(/\D/g, "");
  const validation = formData.bankCode && cleanAccount.length === 10
    ? validateNuban(formData.bankCode, cleanAccount)
    : null;

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBank = NIGERIAN_BANKS.find((b) => b.code === e.target.value);
    if (selectedBank) {
      onChange({
        ...formData,
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
      });
    } else {
      onChange({
        ...formData,
        bankName: "",
        bankCode: "",
      });
    }
    setShowReview(false);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange({
      ...formData,
      accountNumber: val,
    });
    setTouched(true);
    setShowReview(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...formData,
      accountName: e.target.value,
    });
  };

  const isComplete =
    formData.bankCode &&
    cleanAccount.length === 10 &&
    validation?.isValid &&
    formData.accountName.trim().length > 2;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="border-b border-[var(--line)] pb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--ink)]">
          <Building className="text-[var(--ng)]" /> Bank Details on File (Errand Payouts Only)
        </h2>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          Bank details are collected solely for disbursing your 70% Alabaru errand earnings directly to your account.
        </p>
      </div>

      <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
        <strong>Privacy Notice:</strong> Your bank details are never shared with employers or displayed publicly. They are encrypted at rest with AES-256-GCM and used exclusively for automated errand payouts.
      </div>

      <div className="space-y-4">
        {/* Bank Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
            Select Your Bank
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

        {/* 10-Digit Account Number */}
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

          {touched && cleanAccount.length === 10 && (
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

        {/* Account Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">
            Account Name (as registered with your bank)
          </label>
          <input
            type="text"
            value={formData.accountName}
            onChange={handleNameChange}
            placeholder="e.g. ADEBAYO ADEWALE"
            required
            className="w-full h-11 px-4 uppercase rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-black text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
          />
        </div>

        {/* Review & Confirmation Screen */}
        {isComplete && (
          <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-[var(--ng)]/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
              <ShieldCheck size={16} /> Confirm Bank Account on File
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 block">Bank Name</span>
                <span className="font-bold text-[var(--ink)]">{formData.bankName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Masked Account</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {maskAccountNumber(cleanAccount)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Account Holder Name</span>
                <span className="font-bold text-[var(--ink)] uppercase">
                  {formData.accountName}
                </span>
              </div>
            </div>

            {/* Consent Text pending client/legal approval */}
            <div className="pt-2 border-t border-[var(--line)]">
              <p className="text-[11px] text-gray-500 italic leading-relaxed">
                <span className="font-semibold text-amber-800">[PENDING CLIENT / LEGAL APPROVAL]</span>{" "}
                By providing your bank details, you authorize Staff Guru to disburse your 70% errand earnings directly to this account on file upon verified task completion.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
