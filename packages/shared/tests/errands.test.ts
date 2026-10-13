import { describe, it, expect } from "vitest";
import {
  validateErrandDeadline,
  getErrandExpiry,
  getAutoReleaseTime,
} from "../src/errands";

describe("Errand Domain Utilities & Lifecycle Calculations", () => {
  describe("validateErrandDeadline", () => {
    it("should accept a realistic deadline well into the future (> 2h)", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T16:00:00Z"); // 6 hours ahead

      const result = validateErrandDeadline(deadline, 2, now);
      expect(result.isValid).toBe(true);
      expect(result.leadHours).toBe(6);
      expect(result.error).toBeUndefined();
    });

    it("should reject an unreasonably close deadline (< 2h)", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T11:00:00Z"); // Only 1 hour ahead

      const result = validateErrandDeadline(deadline, 2, now);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("at least 2 hours in the future");
      expect(result.leadHours).toBe(1);
    });

    it("should reject a deadline in the past", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T09:00:00Z"); // 1 hour past

      const result = validateErrandDeadline(deadline, 2, now);
      expect(result.isValid).toBe(false);
    });

    it("should reject invalid date strings", () => {
      const result = validateErrandDeadline("invalid-date-string");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid deadline date format");
    });
  });

  describe("getErrandExpiry (Earlier of Open Window and Hard Deadline)", () => {
    it("should return the hard deadline if it comes before the open window expiry", () => {
      const openedAt = new Date("2026-10-15T10:00:00Z");
      const openWindowHours = 24; // Would expire at 2026-10-16T10:00:00Z
      const deadline = new Date("2026-10-15T18:00:00Z"); // 8 hours ahead (earlier!)

      const expiry = getErrandExpiry(openedAt, openWindowHours, deadline);
      expect(expiry.getTime()).toBe(deadline.getTime());
    });

    it("should return the open window expiry if it comes before the hard deadline", () => {
      const openedAt = new Date("2026-10-15T10:00:00Z");
      const openWindowHours = 24; // Expires at 2026-10-16T10:00:00Z (earlier!)
      const deadline = new Date("2026-10-20T10:00:00Z"); // 5 days ahead

      const expiry = getErrandExpiry(openedAt, openWindowHours, deadline);
      const expectedWindowExpiry = new Date("2026-10-16T10:00:00Z").getTime();
      expect(expiry.getTime()).toBe(expectedWindowExpiry);
    });
  });

  describe("getAutoReleaseTime (Timezone-Aware Proof Auto-Release)", () => {
    it("should compute the exact auto-release timestamp based on latest proof submission", () => {
      const proofSubmittedAt = new Date("2026-10-15T14:30:00Z");
      const autoReleaseHours = 24;

      const autoRelease = getAutoReleaseTime(proofSubmittedAt, autoReleaseHours);
      const expectedTime = new Date("2026-10-16T14:30:00Z").getTime();
      expect(autoRelease.getTime()).toBe(expectedTime);
    });
  });
});
