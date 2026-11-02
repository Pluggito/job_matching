import { z } from "zod";

// Zod schemas for every platform setting
export const ErrandCommissionGlobalSchema = z.object({
  basisPoints: z.number().int().min(0).max(10000), // 0% to 100%
  minFloorKobo: z.number().int().min(0),
});

export const ErrandCommissionTypeOverridesSchema = z.object({
  site_inspection: z.number().int().min(0).max(10000).nullable().optional(),
  pickup_delivery: z.number().int().min(0).max(10000).nullable().optional(),
  queue_document: z.number().int().min(0).max(10000).nullable().optional(),
  purchase: z.number().int().min(0).max(10000).nullable().optional(),
  supervision: z.number().int().min(0).max(10000).nullable().optional(),
});

export const ErrandActiveCapSchema = z.object({
  maxActiveErrands: z.number().int().min(1).max(20),
});

export const ErrandOfferExpirySchema = z.object({
  minutes: z.number().int().min(5).max(1440), // 5 min to 24 hours
});

export const ErrandOpenWindowSchema = z.object({
  hours: z.number().int().min(1).max(720), // 1 hour to 30 days
});

export const ErrandAutoReleaseSchema = z.object({
  hours: z.number().int().min(1).max(720),
});

export const BankChangePayoutHoldSchema = z.object({
  hours: z.number().int().min(0).max(168), // 0 to 7 days
});

export const ErrandCancellationGraceSchema = z.object({
  minutes: z.number().int().min(0).max(120),
});

export const ErrandCancellationStipendSchema = z.object({
  percent: z.number().int().min(0).max(100),
  floorKobo: z.number().int().min(0),
});

export const ErrandHandoffMaxAttemptsSchema = z.object({
  maxAttempts: z.number().int().min(1).max(10),
});

export const ErrandBudgetLimitsSchema = z.object({
  minBudgetKobo: z.number().int().min(0),
  maxBudgetKobo: z.number().int().min(100000),
}).refine(data => data.maxBudgetKobo >= data.minBudgetKobo, {
  message: "maxBudgetKobo must be greater than or equal to minBudgetKobo",
});

export const ErrandMaxOffersSchema = z.object({
  maxOffersPerErrand: z.number().int().min(1).max(100),
});

export const HireAgencyFeeDefaultSchema = z.object({
  kobo: z.number().int().min(0),
});

export const ErrandFlatPriceSchema = z.object({
  kobo: z.number().int().min(0).nullable(),
});

export const ErrandCreationFeeSchema = z.object({
  kobo: z.number().int().min(0).nullable(),
});

export const ErrandPriceMinSchema = z.object({
  kobo: z.number().int().min(0),
});

export const ErrandPriceMaxSchema = z.object({
  kobo: z.number().int().min(0),
});

export const PLATFORM_SETTINGS_SCHEMAS = {
  errand_flat_price_kobo: ErrandFlatPriceSchema,
  errand_creation_fee_kobo: ErrandCreationFeeSchema,
  errand_price_min_kobo: ErrandPriceMinSchema,
  errand_price_max_kobo: ErrandPriceMaxSchema,
  errand_commission_global: ErrandCommissionGlobalSchema,
  errand_commission_type_overrides: ErrandCommissionTypeOverridesSchema,
  errand_active_cap: ErrandActiveCapSchema,
  errand_offer_expiry_minutes: ErrandOfferExpirySchema,
  errand_open_window_hours: ErrandOpenWindowSchema,
  errand_auto_release_hours: ErrandAutoReleaseSchema,
  bank_change_payout_hold_hours: BankChangePayoutHoldSchema,
  errand_cancellation_grace_minutes: ErrandCancellationGraceSchema,
  errand_cancellation_stipend: ErrandCancellationStipendSchema,
  errand_handoff_max_attempts: ErrandHandoffMaxAttemptsSchema,
  errand_budget_limits: ErrandBudgetLimitsSchema,
  errand_max_offers: ErrandMaxOffersSchema,
  hire_agency_fee_default_kobo: HireAgencyFeeDefaultSchema,
} as const;

export type PlatformSettingKey = keyof typeof PLATFORM_SETTINGS_SCHEMAS;

/**
 * Validates a setting value against its corresponding Zod schema.
 */
export function validatePlatformSetting<K extends PlatformSettingKey>(
  key: K,
  value: unknown
): z.infer<(typeof PLATFORM_SETTINGS_SCHEMAS)[K]> {
  const schema = PLATFORM_SETTINGS_SCHEMAS[key];
  if (!schema) {
    throw new Error(`Unrecognized platform setting key: ${key}`);
  }
  return schema.parse(value);
}

export interface DefaultPlatformSettingRecord {
  key: PlatformSettingKey;
  label: string;
  description: string;
  value: Record<string, unknown>;
}

/**
 * Initial platform settings seeds with labelled placeholders
 * ("placeholder, pending client decision").
 */
export const DEFAULT_PLATFORM_SETTINGS: DefaultPlatformSettingRecord[] = [
  {
    key: "errand_flat_price_kobo",
    label: "Alabaru Errand Flat Task Price (Seeded as Unset)",
    description: "Flat errand price in integer kobo. If unset/null, errand creation is disabled for employers with notice 'Alabaru isn’t open yet'.",
    value: { kobo: null },
  },
  {
    key: "errand_creation_fee_kobo",
    label: "Alabaru Errand Creation & Outreach Fee",
    description: "Flat fee set by Staff Guru and charged to employers upon errand creation for platform runner dispatch. 100% refundable if unclaimed within 24 hours.",
    value: { kobo: 0 },
  },
  {
    key: "errand_price_min_kobo",
    label: "Alabaru Minimum Permissible Errand Task Price",
    description: "Lower bound floor constraint (e.g., ₦20,000) that employers can set for an errand task reward to ensure fair runner pay.",
    value: { kobo: 2_000_000 }, // ₦20,000
  },
  {
    key: "errand_price_max_kobo",
    label: "Alabaru Maximum Permissible Errand Task Price",
    description: "Upper bound ceiling constraint (e.g., ₦1,000,000) for employer errand task price entry.",
    value: { kobo: 100_000_000 }, // ₦1,000,000
  },
  {
    key: "errand_commission_global",
    label: "Global Errand Commission Rate (30% default)",
    description: "Platform commission rate deducted from the employer-set errand reward. Measured in basis points (e.g. 3000 = 30.00%).",
    value: { basisPoints: 3000, minFloorKobo: 0 }, // 30.00%
  },
  {
    key: "errand_commission_type_overrides",
    label: "Per-Type Commission Overrides (Placeholder, pending client decision)",
    description: "Optional rate overrides in basis points for specific errand categories. Null inherits global rate.",
    value: {
      site_inspection: null,
      pickup_delivery: null,
      queue_document: null,
      purchase: null,
      supervision: null,
    },
  },
  {
    key: "errand_active_cap",
    label: "Active Errand Concurrency Cap (Placeholder, pending client decision)",
    description: "Maximum number of active in-progress errands a verified worker may hold concurrently. Default is 2.",
    value: { maxActiveErrands: 2 },
  },
  {
    key: "errand_offer_expiry_minutes",
    label: "Worker Offer Expiry Window (Placeholder, pending client decision)",
    description: "Time in minutes before a matching offer dispatched to a worker expires if unclaimed.",
    value: { minutes: 120 }, // 2 hours
  },
  {
    key: "errand_open_window_hours",
    label: "Errand Open Window Before Expiry (Client-Confirmed)",
    description: "Hours an unclaimed errand remains open before automatically expiring and issuing a full refund to the employer. Confirmed by client at 24 hours.",
    value: { hours: 24 },
  },
  {
    key: "errand_auto_release_hours",
    label: "Proof Review Auto-Release Window (Client-Confirmed)",
    description: "Hours after proof submission before escrow funds auto-release to worker if employer is unresponsive. Confirmed by client at 24 hours.",
    value: { hours: 24 },
  },
  {
    key: "bank_change_payout_hold_hours",
    label: "Bank Change Payout Hold Window (Client-Confirmed)",
    description: "Hours payout is frozen when an existing active bank account is replaced with a new one. Default is 24 hours.",
    value: { hours: 24 },
  },
  {
    key: "errand_cancellation_grace_minutes",
    label: "Claimed Cancellation Grace Period (Placeholder, pending client decision)",
    description: "Minutes after worker claims an errand during which employer can cancel for a 100% full refund.",
    value: { minutes: 15 },
  },
  {
    key: "errand_cancellation_stipend",
    label: "Post-Grace Inconvenience Stipend (Placeholder, pending client decision)",
    description: "Percentage of task budget and minimum floor paid to worker if employer cancels after grace period but before work starts.",
    value: { percent: 20, floorKobo: 200_000 }, // 20% or ₦2,000 floor
  },
  {
    key: "errand_handoff_max_attempts",
    label: "Delivery Handoff Max Code Attempts (Placeholder, pending client decision)",
    description: "Maximum failed PIN verification attempts before delivery verification locks for admin review.",
    value: { maxAttempts: 3 },
  },
  {
    key: "errand_budget_limits",
    label: "Errand Minimum and Maximum Budget (Placeholder, pending client decision)",
    description: "Permissible budget range in integer kobo for posting an errand.",
    value: { minBudgetKobo: 2_000_000, maxBudgetKobo: 1_000_000_000 }, // ₦20,000 to ₦10,000,000
  },
  {
    key: "errand_max_offers",
    label: "Maximum Worker Offers Per Errand (Placeholder, pending client decision)",
    description: "Maximum number of matching verified workers to notify simultaneously for a single errand post.",
    value: { maxOffersPerErrand: 10 },
  },
  {
    key: "hire_agency_fee_default_kobo",
    label: "Default Job Hire Agency Fee (Placeholder, pending client decision)",
    description: "Admin default agency fee quote for candidate hire selections in integer kobo.",
    value: { kobo: 5_000_000 }, // ₦50,000
  },
];
