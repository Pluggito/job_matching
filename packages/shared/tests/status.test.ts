import { describe, it, expect } from "vitest";
import {
  ERRAND_STATUSES,
  QUOTE_STATUSES,
  SELECTION_STATUSES,
  validateActorTransition,
  assertValidActorTransition,
  validateTransition,
  assertValidTransition,
  ERRAND_TRANSITIONS,
  QUOTE_TRANSITIONS,
  SELECTION_TRANSITIONS,
} from "../src/status";

describe("Phase 1 Status State Machines", () => {
  describe("Errand Actor-Aware Transitions", () => {
    it("should allow employer to move draft -> pending_payment and pending_payment -> cancelled", () => {
      expect(validateActorTransition("EMPLOYER", "draft", "pending_payment")).toBe(true);
      expect(validateActorTransition("EMPLOYER", "pending_payment", "cancelled")).toBe(true);
    });

    it("should reject employer unilaterally cancelling an errand that is in_progress", () => {
      expect(validateActorTransition("EMPLOYER", "in_progress", "cancelled")).toBe(false);
      expect(() => {
        assertValidActorTransition("EMPLOYER", "in_progress", "cancelled");
      }).toThrow(/Illegal errand state transition by EMPLOYER from "in_progress" to "cancelled"/);
    });

    it("should allow worker to claim an open errand, but reject worker cancelling an errand", () => {
      expect(validateActorTransition("WORKER", "open", "claimed")).toBe(true);
      expect(validateActorTransition("WORKER", "open", "cancelled")).toBe(false);
    });

    it("should allow worker to release a claimed errand back to open pool", () => {
      expect(validateActorTransition("WORKER", "claimed", "open")).toBe(true);
    });

    it("should prohibit expired -> open directly across all actors (must re-fund via pending_payment)", () => {
      expect(validateActorTransition("EMPLOYER", "expired", "open")).toBe(false);
      expect(validateActorTransition("WORKER", "expired", "open")).toBe(false);
      expect(validateActorTransition("ADMIN", "expired", "open")).toBe(false);
      expect(validateActorTransition("SYSTEM", "expired", "open")).toBe(false);

      // Reposting moves expired -> pending_payment
      expect(validateActorTransition("EMPLOYER", "expired", "pending_payment")).toBe(true);
    });

    it("should allow system to mark payment funded: pending_payment -> open", () => {
      expect(validateActorTransition("SYSTEM", "pending_payment", "open")).toBe(true);
    });

    it("should allow system to expire unclaimed errand: open -> expired", () => {
      expect(validateActorTransition("SYSTEM", "open", "expired")).toBe(true);
    });

    it("should allow admin to resolve disputes to completed, cancelled, or open", () => {
      expect(validateActorTransition("ADMIN", "disputed", "completed")).toBe(true);
      expect(validateActorTransition("ADMIN", "disputed", "cancelled")).toBe(true);
      expect(validateActorTransition("ADMIN", "disputed", "open")).toBe(true);
    });
  });

  describe("Quote Transitions", () => {
    it("should follow quote lifecycle from draft -> sent -> accepted -> paid", () => {
      expect(validateTransition("draft", "sent", QUOTE_TRANSITIONS)).toBe(true);
      expect(validateTransition("sent", "accepted", QUOTE_TRANSITIONS)).toBe(true);
      expect(validateTransition("accepted", "paid", QUOTE_TRANSITIONS)).toBe(true);
    });

    it("should enforce paid quotes as terminal and immutable", () => {
      expect(validateTransition("paid", "draft", QUOTE_TRANSITIONS)).toBe(false);
      expect(validateTransition("paid", "superseded", QUOTE_TRANSITIONS)).toBe(false);
      expect(validateTransition("paid", "declined", QUOTE_TRANSITIONS)).toBe(false);
      expect(() => {
        assertValidTransition("Quote", "paid", "draft", QUOTE_TRANSITIONS);
      }).toThrow(/Illegal Quote state transition from "paid" to "draft"/);
    });
  });

  describe("Selection Transitions with Quotes", () => {
    it("should allow shortlisted -> quote_sent -> quote_accepted -> fee_paid -> connected", () => {
      expect(validateTransition("shortlisted", "quote_sent", SELECTION_TRANSITIONS)).toBe(true);
      expect(validateTransition("quote_sent", "quote_accepted", SELECTION_TRANSITIONS)).toBe(true);
      expect(validateTransition("quote_accepted", "fee_paid", SELECTION_TRANSITIONS)).toBe(true);
      expect(validateTransition("fee_paid", "connected", SELECTION_TRANSITIONS)).toBe(true);
    });
  });
});
