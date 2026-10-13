import { describe, it, expect } from "vitest";
import { calculateErrandQuote, formatNaira, validateDisputeSplit, calculateErrandCommissionSplit, calculateErrandPricingBreakdown } from "../src/pricing";

describe("Phase 1 Pricing & Currency Calculations", () => {
  describe("calculateErrandQuote", () => {
    it("should guarantee worker receives 100% of task budget with commission added on top", () => {
      const budgetKobo = 2_000_000; // ₦20,000
      const quote = calculateErrandQuote(budgetKobo);

      expect(quote.workerPayoutKobo).toBe(budgetKobo);
      // 15% of ₦20,000 = ₦3,000 (300,000 kobo), which is above the ₦1,500 floor
      expect(quote.commissionKobo).toBe(300_000);
      expect(quote.totalKobo).toBe(2_300_000);
      expect(quote.totalKobo).toBe(quote.workerPayoutKobo + quote.commissionKobo);
      expect(quote.commissionMode).toBe("percentage");
    });

    it("should enforce the minimum commission floor when percentage is below floor", () => {
      const smallBudgetKobo = 500_000; // ₦5,000
      // 15% of ₦5,000 = ₦750 (75,000 kobo), which is below minimum floor ₦1,500 (150,000 kobo)
      const quote = calculateErrandQuote(smallBudgetKobo);

      expect(quote.workerPayoutKobo).toBe(500_000);
      expect(quote.commissionKobo).toBe(150_000); // Floor applied!
      expect(quote.totalKobo).toBe(650_000); // ₦6,500
      expect(quote.floorUsedKobo).toBe(150_000);
    });

    it("should respect custom commission basis points and custom floor", () => {
      const budgetKobo = 1_000_000; // ₦10,000
      const quote = calculateErrandQuote(budgetKobo, {
        basisPoints: 1000, // 10.00%
        minFloorKobo: 200_000, // ₦2,000 floor
      });

      // 10% of ₦10,000 = ₦1,000 < floor ₦2,000 -> floor applied
      expect(quote.commissionKobo).toBe(200_000);
      expect(quote.totalKobo).toBe(1_200_000);
      expect(quote.commissionRateBasisPoints).toBe(1000);
    });

    it("should support fixed commission override by admin", () => {
      const budgetKobo = 5_000_000; // ₦50,000
      const quote = calculateErrandQuote(budgetKobo, {
        fixedCommissionKobo: 500_000, // Fixed ₦5,000 commission
      });

      expect(quote.workerPayoutKobo).toBe(5_000_000);
      expect(quote.commissionKobo).toBe(500_000);
      expect(quote.totalKobo).toBe(5_500_000);
      expect(quote.commissionMode).toBe("fixed_override");
    });

    it("should reject negative budgets", () => {
      expect(() => calculateErrandQuote(-100)).toThrow(/cannot be negative/);
    });
  });

  describe("formatNaira", () => {
    it("should format whole naira amounts without decimals", () => {
      expect(formatNaira(5_000_000)).toMatch(/50,000/);
      expect(formatNaira(150_000)).toMatch(/1,500/);
    });

    it("should format fractional kobo amounts with 2 decimal places", () => {
      expect(formatNaira(125_050)).toMatch(/1,250\.50/);
    });
  });

  describe("validateDisputeSplit", () => {
    it("should accept valid split where sum equals quote total", () => {
      const quoteTotal = 1_000_000; // ₦10,000
      const workerPayout = 600_000;  // ₦6,000
      const employerRefund = 300_000;// ₦3,000
      const platformFee = 100_000;   // ₦1,000

      const result = validateDisputeSplit(quoteTotal, workerPayout, employerRefund, platformFee);
      expect(result.valid).toBe(true);
    });

    it("should reject split when sum does not equal quote total", () => {
      const quoteTotal = 1_000_000;
      const workerPayout = 500_000;
      const employerRefund = 300_000;
      const platformFee = 100_000; // sum is 900,000 != 1,000,000

      const result = validateDisputeSplit(quoteTotal, workerPayout, employerRefund, platformFee);
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/Discrepancy: 100000 kobo/);
    });

    it("should reject negative split components", () => {
      expect(validateDisputeSplit(100, -50, 100, 50).valid).toBe(false);
      expect(validateDisputeSplit(100, 50, -10, 60).valid).toBe(false);
      expect(validateDisputeSplit(100, 50, 60, -10).valid).toBe(false);
    });
  });

  describe("calculateErrandCommissionSplit (Client 30% / 70% model)", () => {
    it("splits ₦10,000 errand into ₦3,000 platform commission and ₦7,000 worker payout", () => {
      const budgetKobo = 10_000 * 100; // 1,000,000 kobo
      const split = calculateErrandCommissionSplit(budgetKobo, 3000);

      expect(split.taskBudgetKobo).toBe(1_000_000);
      expect(split.platformCommissionKobo).toBe(300_000); // ₦3,000
      expect(split.workerPayoutKobo).toBe(700_000);       // ₦7,000
      expect(split.platformCommissionKobo + split.workerPayoutKobo).toBe(budgetKobo);
    });

    it("splits ₦25,000 errand into ₦7,500 platform cut and ₦17,500 worker take-home", () => {
      const budgetKobo = 25_000 * 100;
      const split = calculateErrandCommissionSplit(budgetKobo, 3000);

      expect(split.platformCommissionKobo).toBe(750_000); // ₦7,500
      expect(split.workerPayoutKobo).toBe(1_750_000);     // ₦17,500
      expect(split.platformCommissionKobo + split.workerPayoutKobo).toBe(budgetKobo);
    });

    it("rejects negative task budgets", () => {
      expect(() => calculateErrandCommissionSplit(-5000)).toThrow("Task budget cannot be negative.");
    });
  });

  describe("calculateErrandPricingBreakdown (Distinct Creation Fee + 70/30 Task Split)", () => {
    it("computes correct breakdown for ₦10,000 errand task + ₦2,000 creation fee", () => {
      const taskPriceKobo = 1_000_000; // ₦10,000
      const creationFeeKobo = 200_000; // ₦2,000
      const breakdown = calculateErrandPricingBreakdown(taskPriceKobo, creationFeeKobo, 3000);

      expect(breakdown.taskPriceKobo).toBe(1_000_000);
      expect(breakdown.creationFeeKobo).toBe(200_000);
      expect(breakdown.taskCommissionKobo).toBe(300_000); // 30% of ₦10,000 = ₦3,000
      expect(breakdown.workerPayoutKobo).toBe(700_000);   // 70% of ₦10,000 = ₦7,000
      expect(breakdown.totalEmployerChargeKobo).toBe(1_200_000); // ₦10,000 + ₦2,000 = ₦12,000
      expect(breakdown.totalPlatformRevenueKobo).toBe(500_000);  // ₦3,000 + ₦2,000 = ₦5,000
      expect(breakdown.workerPayoutKobo + breakdown.taskCommissionKobo).toBe(taskPriceKobo);
    });

    it("handles zero creation fee correctly", () => {
      const taskPriceKobo = 500_000; // ₦5,000
      const breakdown = calculateErrandPricingBreakdown(taskPriceKobo, 0, 3000);

      expect(breakdown.creationFeeKobo).toBe(0);
      expect(breakdown.taskCommissionKobo).toBe(150_000);
      expect(breakdown.workerPayoutKobo).toBe(350_000);
      expect(breakdown.totalEmployerChargeKobo).toBe(500_000);
      expect(breakdown.totalPlatformRevenueKobo).toBe(150_000);
    });

    it("rejects negative task price or creation fee", () => {
      expect(() => calculateErrandPricingBreakdown(-1, 0)).toThrow(/cannot be negative/);
      expect(() => calculateErrandPricingBreakdown(100, -1)).toThrow(/cannot be negative/);
    });
  });
});

