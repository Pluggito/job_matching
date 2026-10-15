export interface ErrandQuoteCalculation {
  workerPayoutKobo: number;
  commissionKobo: number;
  totalKobo: number;
  commissionRateBasisPoints: number;
  floorUsedKobo: number;
  commissionMode: "percentage" | "fixed_override";
}

/**
 * Calculates errand quote breakdown using integer kobo.
 * Formula:
 * workerPayoutKobo = budgetKobo (worker receives 100% of task budget)
 * commissionKobo = max(round(budgetKobo * basisPoints / 10000), minFloorKobo)
 * totalKobo = workerPayoutKobo + commissionKobo
 */
export function calculateErrandQuote(
  budgetKobo: number,
  options?: {
    basisPoints?: number;
    minFloorKobo?: number;
    fixedCommissionKobo?: number;
  }
): ErrandQuoteCalculation {
  if (budgetKobo < 0) {
    throw new Error("Errand budget cannot be negative.");
  }

  const roundedBudget = Math.round(budgetKobo);

  // If a fixed commission override is provided by an admin
  if (options?.fixedCommissionKobo !== undefined && options.fixedCommissionKobo >= 0) {
    const commissionKobo = Math.round(options.fixedCommissionKobo);
    return {
      workerPayoutKobo: roundedBudget,
      commissionKobo,
      totalKobo: roundedBudget + commissionKobo,
      commissionRateBasisPoints: Math.round((commissionKobo / (roundedBudget || 1)) * 10000),
      floorUsedKobo: 0,
      commissionMode: "fixed_override",
    };
  }

  // Default: 15.00% (1500 basis points) and ₦1,500 floor (150,000 kobo)
  const basisPoints = options?.basisPoints ?? 1500;
  const minFloorKobo = options?.minFloorKobo ?? 150_000;

  const rawCommission = Math.round((roundedBudget * basisPoints) / 10000);
  const commissionKobo = Math.max(rawCommission, minFloorKobo);
  const totalKobo = roundedBudget + commissionKobo;

  return {
    workerPayoutKobo: roundedBudget,
    commissionKobo,
    totalKobo,
    commissionRateBasisPoints: basisPoints,
    floorUsedKobo: minFloorKobo,
    commissionMode: "percentage",
  };
}

/**
 * Formats integer kobo into Nigerian Naira string.
 * Example: 5000000 -> "₦50,000", 125050 -> "₦1,250.50"
 */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  const hasKoboFraction = kobo % 100 !== 0;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: hasKoboFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(naira);
}

export interface DisputeSplitValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that dispute payout components match the total quote amount exactly,
 * with every component non-negative:
 * workerPayoutKobo + employerRefundKobo + platformFeeKobo === quoteTotalKobo
 */
export function validateDisputeSplit(
  quoteTotalKobo: number,
  workerPayoutKobo: number,
  employerRefundKobo: number,
  platformFeeKobo: number
): DisputeSplitValidationResult {
  if (quoteTotalKobo < 0) {
    return { valid: false, reason: "Quote total cannot be negative." };
  }
  if (workerPayoutKobo < 0) {
    return { valid: false, reason: "Worker payout cannot be negative." };
  }
  if (employerRefundKobo < 0) {
    return { valid: false, reason: "Employer refund cannot be negative." };
  }
  if (platformFeeKobo < 0) {
    return { valid: false, reason: "Platform fee cannot be negative." };
  }

  const sum = Math.round(workerPayoutKobo + employerRefundKobo + platformFeeKobo);
  const total = Math.round(quoteTotalKobo);

  if (sum !== total) {
    return {
      valid: false,
      reason: `Dispute split components sum (${sum} kobo) does not equal quote total (${total} kobo). Discrepancy: ${total - sum} kobo.`,
    };
  }

  return { valid: true };
}

export interface ErrandCommissionSplit {
  taskBudgetKobo: number;
  platformCommissionKobo: number; // 30%
  workerPayoutKobo: number;       // 70%
  commissionBasisPoints: number;  // 3000
}

/**
 * Calculates the client's 30% platform commission / 70% worker take-home split on errand budget.
 */
export function calculateErrandCommissionSplit(
  taskBudgetKobo: number,
  basisPoints = 3000 // 30.00% default
): ErrandCommissionSplit {
  if (taskBudgetKobo < 0) {
    throw new Error("Task budget cannot be negative.");
  }

  const roundedBudget = Math.round(taskBudgetKobo);
  const platformCommissionKobo = Math.round((roundedBudget * basisPoints) / 10000);
  const workerPayoutKobo = roundedBudget - platformCommissionKobo; // exactly 70%

  return {
    taskBudgetKobo: roundedBudget,
    platformCommissionKobo,
    workerPayoutKobo,
    commissionBasisPoints: basisPoints,
  };
}

export interface ErrandPricingBreakdown {
  taskPriceKobo: number;
  creationFeeKobo: number;
  commissionBps: number;
  taskCommissionKobo: number; // 30% of taskPriceKobo
  workerPayoutKobo: number;   // 70% of taskPriceKobo (runner take-home)
  totalEmployerChargeKobo: number; // taskPriceKobo + creationFeeKobo
  totalPlatformRevenueKobo: number; // taskCommissionKobo + creationFeeKobo
}

/**
 * Calculates complete errand financial breakdown:
 * - taskPriceKobo: errand task price (split 70% runner / 30% platform)
 * - creationFeeKobo: separate flat creation & outreach fee paid by employer (refundable if unclaimed in 24h)
 * - totalEmployerChargeKobo = taskPriceKobo + creationFeeKobo
 */
export function calculateErrandPricingBreakdown(
  taskPriceKobo: number,
  creationFeeKobo = 0,
  commissionBps = 3000
): ErrandPricingBreakdown {
  if (taskPriceKobo < 0) {
    throw new Error("Errand task price cannot be negative.");
  }
  if (creationFeeKobo < 0) {
    throw new Error("Errand creation fee cannot be negative.");
  }

  const roundedTask = Math.round(taskPriceKobo);
  const roundedCreation = Math.round(creationFeeKobo);
  const taskCommissionKobo = Math.round((roundedTask * commissionBps) / 10000);
  const workerPayoutKobo = roundedTask - taskCommissionKobo;
  const totalEmployerChargeKobo = roundedTask + roundedCreation;
  const totalPlatformRevenueKobo = taskCommissionKobo + roundedCreation;

  return {
    taskPriceKobo: roundedTask,
    creationFeeKobo: roundedCreation,
    commissionBps,
    taskCommissionKobo,
    workerPayoutKobo,
    totalEmployerChargeKobo,
    totalPlatformRevenueKobo,
  };
}

export interface PaystackFeeCalculation {
  baseAmountKobo: number;
  baseAmountNaira: number;
  feeKobo: number;
  feeNaira: number;
  totalKobo: number;
  totalNaira: number;
  isFlatFeeWaived: boolean;
  isCapped: boolean;
}

/**
 * Calculates Paystack processing fee according to standard Nigerian merchant pricing:
 * - 1.5% + NGN 100
 * - ₦100 fee waived for transactions under ₦2,500 (250,000 kobo)
 * - Capped at ₦2,000 (200,000 kobo) maximum per transaction
 *
 * @param baseAmountKobo The base amount to be charged in kobo (e.g. 5,000,000 for ₦50,000)
 */
export function calculatePaystackFee(baseAmountKobo: number): PaystackFeeCalculation {
  if (baseAmountKobo <= 0) {
    return {
      baseAmountKobo: 0,
      baseAmountNaira: 0,
      feeKobo: 0,
      feeNaira: 0,
      totalKobo: 0,
      totalNaira: 0,
      isFlatFeeWaived: true,
      isCapped: false,
    };
  }

  const baseAmountNaira = baseAmountKobo / 100;
  const isFlatFeeWaived = baseAmountNaira < 2500;

  // 1.5% in kobo
  const percentFeeKobo = Math.round(baseAmountKobo * 0.015);
  // ₦100 flat fee (10,000 kobo), waived if under ₦2,500
  const flatFeeKobo = isFlatFeeWaived ? 0 : 100 * 100;
  const rawFeeKobo = percentFeeKobo + flatFeeKobo;

  // Maximum fee cap: ₦2,000 (200,000 kobo)
  const capKobo = 2000 * 100;
  const isCapped = rawFeeKobo > capKobo;
  const feeKobo = Math.min(rawFeeKobo, capKobo);
  const totalKobo = baseAmountKobo + feeKobo;

  return {
    baseAmountKobo,
    baseAmountNaira,
    feeKobo,
    feeNaira: feeKobo / 100,
    totalKobo,
    totalNaira: totalKobo / 100,
    isFlatFeeWaived,
    isCapped,
  };
}

