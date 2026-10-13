/**
 * Banking domain logic and offline validation utilities for Nigerian financial institutions.
 * Strictly adheres to Central Bank of Nigeria (CBN) standards.
 */

const NUBAN_WEIGHTS_3DIGIT = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3] as const;
const NUBAN_WEIGHTS_5DIGIT = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7] as const;

export interface NubanValidationResult {
  isValid: boolean;
  error?: string;
  expectedCheckDigit?: number;
  actualCheckDigit?: number;
}

/**
 * Validates a Nigerian Uniform Bank Account Number (NUBAN) offline using the CBN check digit algorithm.
 * 
 * @param bankCode CBN-issued bank code (3-digit code e.g. "058" for GTB, or 5-digit for OFIs/fintechs)
 * @param accountNumber 10-digit NUBAN account number
 */
export function validateNuban(bankCode: string, accountNumber: string): NubanValidationResult {
  const cleanBank = (bankCode || "").trim().replace(/\D/g, "");
  const cleanAccount = (accountNumber || "").trim().replace(/\D/g, "");

  if (!cleanBank) {
    return { isValid: false, error: "Bank code is required." };
  }
  if (cleanAccount.length !== 10) {
    return {
      isValid: false,
      error: `Account number must be exactly 10 digits (received ${cleanAccount.length}).`,
    };
  }

  // Determine weighting schema based on bank code format
  let digits: number[];
  let weights: readonly number[];

  if (cleanBank.length === 3) {
    // Standard commercial bank 3-digit code + first 9 digits of account number
    const combined = cleanBank + cleanAccount.slice(0, 9);
    digits = combined.split("").map((ch) => parseInt(ch, 10));
    weights = NUBAN_WEIGHTS_3DIGIT;
  } else if (cleanBank.length === 5) {
    // 5-digit Other Financial Institutions (OFI) / Microfinance code + first 9 digits
    const combined = cleanBank + cleanAccount.slice(0, 9);
    digits = combined.split("").map((ch) => parseInt(ch, 10));
    weights = NUBAN_WEIGHTS_5DIGIT;
  } else if (cleanBank.length > 3 && cleanBank.length <= 6) {
    // Fall back to taking the last 3 digits or standard mapping
    const padded = cleanBank.padStart(3, "0").slice(-3);
    const combined = padded + cleanAccount.slice(0, 9);
    digits = combined.split("").map((ch) => parseInt(ch, 10));
    weights = NUBAN_WEIGHTS_3DIGIT;
  } else {
    return { isValid: false, error: `Invalid bank code format: "${bankCode}". Must be 3 or 5 digits.` };
  }

  // Calculate weighted sum modulo 10
  const sum = digits.reduce((acc, digit, idx) => acc + digit * (weights[idx] ?? 0), 0);
  const remainder = sum % 10;
  const expectedCheckDigit = (10 - remainder) % 10;
  const actualCheckDigit = parseInt(cleanAccount[9] ?? "0", 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      isValid: false,
      error: `Invalid account number check digit for bank code ${cleanBank}. Please double-check your account number.`,
      expectedCheckDigit,
      actualCheckDigit,
    };
  }

  return {
    isValid: true,
    expectedCheckDigit,
    actualCheckDigit,
  };
}

/**
 * Masks a 10-digit NUBAN account number for safe public and client-side display.
 * Example: "0123456789" -> "******6789"
 */
export function maskAccountNumber(accountNumber: string): string {
  const clean = (accountNumber || "").trim().replace(/\D/g, "");
  if (clean.length < 4) {
    return "******";
  }
  const lastFour = clean.slice(-4);
  return `******${lastFour}`;
}

/**
 * Computes the payout hold window for worker bank details.
 * 
 * Rules:
 * - First account added during signup/onboarding: ZERO payout hold (returns null).
 * - Replacement of an existing account: 24-hour payout hold (returns future Date).
 * 
 * @param isReplacement True if replacing an existing active bank account
 * @param holdHours Payout freeze window in hours (client-confirmed default is 24)
 * @param now Reference timestamp (defaults to current time)
 */
export function calculatePayoutHold(
  isReplacement: boolean,
  holdHours = 24,
  now = new Date()
): Date | null {
  if (!isReplacement) {
    return null; // Initial signup account has zero hold
  }
  const holdMs = holdHours * 60 * 60 * 1000;
  return new Date(now.getTime() + holdMs);
}
