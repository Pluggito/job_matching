import { describe, it, expect } from "vitest";
import { calculateFee, isReplacementEligible, calculateRemovalNoticeDate } from "../src/logic";
import { AGENCY_FEE_PER_WORKER, REMOVAL_NOTICE_DAYS } from "../src/constants";

describe("Business Logic", () => {
  describe("calculateFee", () => {
    it("should calculate correct fee for multiple workers", () => {
      expect(calculateFee(2)).toBe(AGENCY_FEE_PER_WORKER * 2);
    });
    it("should handle 0 workers", () => {
      expect(calculateFee(0)).toBe(0);
    });
    it("should handle negative workers by returning 0", () => {
      expect(calculateFee(-1)).toBe(0);
    });
  });

  describe("isReplacementEligible", () => {
    it("should return true if within 14 days", () => {
      const start = new Date("2024-01-01");
      const current = new Date("2024-01-10");
      expect(isReplacementEligible(start, current)).toBe(true);
    });
    it("should return false if after 14 days", () => {
      const start = new Date("2024-01-01");
      const current = new Date("2024-01-20");
      expect(isReplacementEligible(start, current)).toBe(false);
    });
  });

  describe("calculateRemovalNoticeDate", () => {
    it("should add REMOVAL_NOTICE_DAYS to the current date", () => {
      const current = new Date("2024-01-01T12:00:00Z");
      const expected = new Date("2024-01-04T12:00:00Z"); // 3 days later
      expect(calculateRemovalNoticeDate(current)).toEqual(expected);
    });
  });
});
