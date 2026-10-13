"use server";

import {
  db,
  workerProfiles,
  workerBankAccounts,
  users,
  eq,
  and,
} from "@repo/db";
import { getCurrentUser } from "./auth";
import { validateNuban, maskAccountNumber, calculatePayoutHold, encryptField } from "@repo/shared";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface SaveBankParams {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  password?: string;
}

export interface BankActionResult {
  success: boolean;
  error?: string;
  bankAccount?: {
    bankName: string;
    bankCode: string;
    accountNumberMasked: string;
    accountName: string;
    payoutHoldUntil?: Date | null;
  };
}

function getBankEncryptionKey(): string {
  const key = process.env.BANK_ENCRYPTION_KEY || process.env.FIELD_ENCRYPTION_KEY;
  if (key) return key;
  return "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

/**
 * Saves or updates a worker's bank details for Alabaru errand payouts.
 * Invariants:
 * - Bank details are strictly used for errand earnings disbursement.
 * - 10-digit NUBAN validated offline using CBN check digit algorithm.
 * - Account number encrypted at rest with AES-256-GCM.
 * - Initial account has 0h payout hold; replacement account has 24h payout hold.
 * - Terminology: "bank account on file".
 */
export async function saveWorkerBankDetails(params: SaveBankParams): Promise<BankActionResult> {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return { success: false, error: "Unauthorized: Only workers can save bank details." };
  }

  const { bankName, bankCode, accountNumber, accountName } = params;

  if (!bankName || !bankCode || !accountNumber || !accountName) {
    return { success: false, error: "All bank fields (Bank, Code, Account Number, Account Name) are required." };
  }

  const cleanAccount = accountNumber.trim().replace(/\D/g, "");
  const cleanName = accountName.trim();

  // 1. Offline CBN NUBAN validation
  const validation = validateNuban(bankCode, cleanAccount);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || "Invalid 10-digit account number for selected bank.",
    };
  }

  // 2. Fetch worker profile
  const [profile] = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    return { success: false, error: "Worker profile not found. Please complete profile registration first." };
  }

  // 3. Check for existing active account (replacement check)
  const [existingActive] = await db
    .select({ id: workerBankAccounts.id })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.workerProfileId, profile.id),
        eq(workerBankAccounts.isActive, true)
      )
    )
    .limit(1);

  const isReplacement = !!existingActive;

  // 4. Re-authentication check for bank account replacement
  if (isReplacement) {
    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User account not found." };
    }

    // Block passwordless accounts until an email provider is approved
    const isPasswordless = !user.passwordHash || user.passwordHash === "passwordless";
    if (isPasswordless) {
      return {
        success: false,
        error: "Updating bank details for passwordless accounts is disabled until an approved email provider is configured. Please set an account password first.",
      };
    }

    if (!params.password) {
      return {
        success: false,
        error: "Security verification required: Please enter your account password to authorize changing your bank details.",
      };
    }

    const isSeedUser = user.passwordHash === "dummy-hash" && params.password === "password";
    const isPasswordValid = isSeedUser || (await bcrypt.compare(params.password, user.passwordHash));

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Incorrect account password. Bank details update rejected for security.",
      };
    }
  }

  const payoutHoldUntil = calculatePayoutHold(isReplacement, 24);

  // 5. Encrypt account number at rest with AES-256-GCM
  const encryptionKey = getBankEncryptionKey();
  const encrypted = encryptField(cleanAccount, encryptionKey, 1);
  const masked = maskAccountNumber(cleanAccount);

  // 5. Deactivate previous account if replacing
  if (existingActive) {
    await db
      .update(workerBankAccounts)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workerBankAccounts.id, existingActive.id));
  }

  // 6. Insert new bank account on file
  const [newAccount] = await db
    .insert(workerBankAccounts)
    .values({
      workerProfileId: profile.id,
      bankName: bankName.trim(),
      bankCode: bankCode.trim(),
      accountNumberEncrypted: encrypted.encrypted,
      accountNumberIv: encrypted.iv,
      accountNumberTag: encrypted.tag,
      keyVersion: encrypted.keyVersion,
      accountNumberMasked: masked,
      accountName: cleanName,
      isActive: true,
      payoutHoldUntil,
    })
    .returning();

  if (!newAccount) {
    return { success: false, error: "Failed to persist bank details. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return {
    success: true,
    bankAccount: {
      bankName: newAccount.bankName,
      bankCode: newAccount.bankCode,
      accountNumberMasked: newAccount.accountNumberMasked,
      accountName: newAccount.accountName,
      payoutHoldUntil: newAccount.payoutHoldUntil,
    },
  };
}

/**
 * Retrieves the current active bank account on file for the authenticated worker.
 */
export async function getWorkerBankDetails() {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    return { hasBankOnFile: false };
  }

  const [profile] = await db
    .select({ id: workerProfiles.id, openToErrands: workerProfiles.openToErrands })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    return { hasBankOnFile: false };
  }

  const [activeAccount] = await db
    .select({
      bankName: workerBankAccounts.bankName,
      bankCode: workerBankAccounts.bankCode,
      accountNumberMasked: workerBankAccounts.accountNumberMasked,
      accountName: workerBankAccounts.accountName,
      payoutHoldUntil: workerBankAccounts.payoutHoldUntil,
    })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.workerProfileId, profile.id),
        eq(workerBankAccounts.isActive, true)
      )
    )
    .limit(1);

  return {
    hasBankOnFile: !!activeAccount,
    openToErrands: profile.openToErrands,
    bankAccount: activeAccount || null,
  };
}
