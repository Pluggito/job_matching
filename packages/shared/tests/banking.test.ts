import { describe, it, expect } from "vitest";
import {
  validateNuban,
  maskAccountNumber,
  calculatePayoutHold,
} from "../src/banking";

describe("Banking Domain Logic & Offline NUBAN Validation", () => {
  describe("validateNuban (CBN Offline Check Digit Algorithm)", () => {
    it("should validate a correct NUBAN for GTB (058)", () => {
      // For bank 058 and prefix 012345678, the calculated check digit is 5
      const validGtbAccount = "0123456785";
      const result = validateNuban("058", validGtbAccount);

      expect(result.isValid).toBe(true);
      expect(result.expectedCheckDigit).toBe(5);
      expect(result.actualCheckDigit).toBe(5);
      expect(result.error).toBeUndefined();
    });

    it("should validate a correct NUBAN for Zenith Bank (057)", () => {
      // For bank 057 and prefix 200123456, the calculated check digit is 7
      const validZenithAccount = "2001234567";
      const result = validateNuban("057", validZenithAccount);

      expect(result.isValid).toBe(true);
      expect(result.expectedCheckDigit).toBe(7);
      expect(result.actualCheckDigit).toBe(7);
      expect(result.error).toBeUndefined();
    });

    it("should reject an account number with an invalid check digit", () => {
      // If the 10th digit is incorrect (e.g. 9 instead of 5 for GTB)
      const invalidAccount = "0123456789";
      const result = validateNuban("058", invalidAccount);

      expect(result.isValid).toBe(false);
      expect(result.expectedCheckDigit).toBe(5);
      expect(result.actualCheckDigit).toBe(9);
      expect(result.error).toContain("Invalid account number check digit");
    });

    it("should reject account numbers that are not exactly 10 digits", () => {
      const shortAccount = "12345678";
      const resultShort = validateNuban("058", shortAccount);
      expect(resultShort.isValid).toBe(false);
      expect(resultShort.error).toContain("must be exactly 10 digits");

      const longAccount = "123456789012";
      const resultLong = validateNuban("058", longAccount);
      expect(resultLong.isValid).toBe(false);
      expect(resultLong.error).toContain("must be exactly 10 digits");
    });

    it("should reject invalid bank codes", () => {
      const result = validateNuban("", "0123456785");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Bank code is required");
    });

    it("should gracefully handle formatted account numbers with spaces or dashes", () => {
      const formattedAccount = " 0123-456-785 ";
      const result = validateNuban("058", formattedAccount);
      expect(result.isValid).toBe(true);
      expect(result.actualCheckDigit).toBe(5);
    });
  });

  describe("maskAccountNumber", () => {
    it("should mask 10-digit account numbers showing only the last 4 digits", () => {
      expect(maskAccountNumber("0123456785")).toBe("******6785");
      expect(maskAccountNumber("2001234567")).toBe("******4567");
    });

    it("should handle spaces and formatting when masking", () => {
      expect(maskAccountNumber(" 0123-456-785 ")).toBe("******6785");
    });

    it("should return asterisks for very short inputs", () => {
      expect(maskAccountNumber("12")).toBe("******");
      expect(maskAccountNumber("")).toBe("******");
    });
  });

  describe("calculatePayoutHold", () => {
    it("should return null for initial bank account added during signup (zero hold)", () => {
      const hold = calculatePayoutHold(false, 24);
      expect(hold).toBeNull();
    });

    it("should return a 24-hour future Date when replacing an existing account", () => {
      const now = new Date("2026-10-15T12:00:00Z");
      const hold = calculatePayoutHold(true, 24, now);

      expect(hold).not.toBeNull();
      const expectedTime = new Date("2026-10-16T12:00:00Z").getTime();
      expect(hold!.getTime()).toBe(expectedTime);
    });

    it("should support configurable hold hours from platform settings", () => {
      const now = new Date("2026-10-15T12:00:00Z");
      const hold = calculatePayoutHold(true, 12, now); // 12 hours

      expect(hold).not.toBeNull();
      const expectedTime = new Date("2026-10-16T00:00:00Z").getTime();
      expect(hold!.getTime()).toBe(expectedTime);
    });
  });
});
