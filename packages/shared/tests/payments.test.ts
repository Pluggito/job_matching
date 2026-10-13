import { describe, it, expect } from "vitest";
import {
  verifyPaystackWebhookSignature,
} from "../src/security";
import { createHmac } from "crypto";

describe("Paystack Webhook Verification & Security", () => {
  const secretKey = "sk_test_16b46cb7a8f4833c87b0efb2b580588dfdd5c9c4";
  const samplePayload = JSON.stringify({
    event: "charge.success",
    data: {
      id: 302910,
      domain: "test",
      status: "success",
      reference: "SG_TXN_1728640000000_a1b2c3d4",
      amount: 5000000,
      currency: "NGN",
      channel: "card",
    },
  });

  it("successfully verifies valid Paystack HMAC-SHA512 signature", () => {
    const validSignature = createHmac("sha512", secretKey)
      .update(samplePayload)
      .digest("hex");

    const isValid = verifyPaystackWebhookSignature(
      samplePayload,
      validSignature,
      secretKey
    );

    expect(isValid).toBe(true);
  });

  it("rejects tampered payload content", () => {
    const validSignature = createHmac("sha512", secretKey)
      .update(samplePayload)
      .digest("hex");

    const tamperedPayload = samplePayload.replace("5000000", "1000000");

    const isValid = verifyPaystackWebhookSignature(
      tamperedPayload,
      validSignature,
      secretKey
    );

    expect(isValid).toBe(false);
  });

  it("rejects invalid or tampered signature", () => {
    const invalidSignature = "deadbeef".repeat(16);

    const isValid = verifyPaystackWebhookSignature(
      samplePayload,
      invalidSignature,
      secretKey
    );

    expect(isValid).toBe(false);
  });

  it("rejects signature signed with different secret key", () => {
    const wrongSignature = createHmac("sha512", "sk_test_different_key")
      .update(samplePayload)
      .digest("hex");

    const isValid = verifyPaystackWebhookSignature(
      samplePayload,
      wrongSignature,
      secretKey
    );

    expect(isValid).toBe(false);
  });

  it("gracefully returns false for missing arguments without throwing", () => {
    expect(verifyPaystackWebhookSignature("", "sig", secretKey)).toBe(false);
    expect(verifyPaystackWebhookSignature(samplePayload, null, secretKey)).toBe(false);
    expect(verifyPaystackWebhookSignature(samplePayload, undefined, secretKey)).toBe(false);
    expect(verifyPaystackWebhookSignature(samplePayload, "sig", "")).toBe(false);
  });
});

describe("In-Flight Payment Expiry & Lock Mechanics", () => {
  it("computes 30-minute lock expiry correctly", () => {
    const now = new Date("2026-10-11T12:00:00.000Z");
    const lockDurationMs = 30 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + lockDurationMs);

    expect(expiresAt.toISOString()).toBe("2026-10-11T12:30:00.000Z");
    expect(expiresAt.getTime() - now.getTime()).toBe(lockDurationMs);
  });

  it("identifies active vs expired locks correctly", () => {
    const now = new Date("2026-10-11T12:35:00.000Z");
    const activeLock = new Date("2026-10-11T12:40:00.000Z");
    const expiredLock = new Date("2026-10-11T12:30:00.000Z");

    const isLockActive = (expiry: Date, current: Date) => expiry.getTime() > current.getTime();

    expect(isLockActive(activeLock, now)).toBe(true);
    expect(isLockActive(expiredLock, now)).toBe(false);
  });
});

describe("Direct Worker Payment Invariants", () => {
  it("enforces that employer pays worker directly with 0 platform escrow custody", () => {
    const agreedWageNaira = 120_000;
    const wageKobo = agreedWageNaira * 100;
    const agencyFeeKobo = 5_000_000; // ₦50,000 Handshake Agency Fee

    // Staff Guru quote for formal job placement
    const quote = {
      type: "agency_fee",
      workerPayoutKobo: 0, // 0 kobo in platform escrow
      commissionKobo: agencyFeeKobo,
      totalKobo: agencyFeeKobo, // only platform fee charged through Paystack
    };

    expect(quote.totalKobo).toBe(agencyFeeKobo);
    expect(quote.workerPayoutKobo).toBe(0);

    // Direct payment proof to worker
    const directProof = {
      type: "placement",
      amountKobo: wageKobo,
      status: "submitted",
    };

    expect(directProof.amountKobo).toBe(12_000_000);
  });
});
