import { describe, it, expect } from "vitest";
import {
  generateHandoffPin,
  hashHandoffCode,
  verifyHandoffCode,
  encryptField,
  decryptField,
} from "../src/security";

describe("Phase 1 Cryptographic Security", () => {
  const secretKey = "test-super-secret-key-staffguru";

  describe("generateHandoffPin", () => {
    it("should generate a 6-digit numeric string", () => {
      const pin = generateHandoffPin();
      expect(pin).toMatch(/^\d{6}$/);
      const num = parseInt(pin, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    });
  });

  describe("hashHandoffCode and verifyHandoffCode", () => {
    it("should produce a deterministic HMAC-SHA256 hex digest", () => {
      const pin = "749201";
      const hash1 = hashHandoffCode(pin, secretKey);
      const hash2 = hashHandoffCode(pin, secretKey);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // 256 bits = 64 hex characters
    });

    it("should verify correctly for matching PIN and reject incorrect PINs", () => {
      const correctPin = "839412";
      const wrongPin = "839413";
      const hmac = hashHandoffCode(correctPin, secretKey);

      expect(verifyHandoffCode(correctPin, secretKey, hmac)).toBe(true);
      expect(verifyHandoffCode(wrongPin, secretKey, hmac)).toBe(false);
    });

    it("should reject tampered HMAC or wrong secret key", () => {
      const pin = "123456";
      const hmac = hashHandoffCode(pin, secretKey);
      const wrongSecret = "different-secret-key";

      expect(verifyHandoffCode(pin, wrongSecret, hmac)).toBe(false);
      expect(verifyHandoffCode(pin, secretKey, "tampered-hmac-string")).toBe(false);
    });

    it("should handle empty or missing arguments gracefully", () => {
      expect(verifyHandoffCode("", secretKey, "somehash")).toBe(false);
      expect(verifyHandoffCode("123456", "", "somehash")).toBe(false);
      expect(verifyHandoffCode("123456", secretKey, "")).toBe(false);
    });
  });

  describe("AES-256-GCM Field-Level Encryption", () => {
    // 32-byte test key (64 hex characters)
    const masterKeyHex = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const sampleAccountNumber = "0123456785";

    it("should encrypt and decrypt an account number successfully", () => {
      const result = encryptField(sampleAccountNumber, masterKeyHex, 1);
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.tag).toBeDefined();
      expect(result.keyVersion).toBe(1);

      // Verify IV is base64 of 12 bytes (16 base64 chars with padding)
      const ivBuffer = Buffer.from(result.iv, "base64");
      expect(ivBuffer.length).toBe(12);

      // Decrypt
      const decrypted = decryptField(
        result.encrypted,
        result.iv,
        result.tag,
        masterKeyHex
      );
      expect(decrypted).toBe(sampleAccountNumber);
    });

    it("should produce unique IV and ciphertext across multiple encryptions of the same value", () => {
      const enc1 = encryptField(sampleAccountNumber, masterKeyHex);
      const enc2 = encryptField(sampleAccountNumber, masterKeyHex);

      expect(enc1.iv).not.toBe(enc2.iv);
      expect(enc1.encrypted).not.toBe(enc2.encrypted);
    });

    it("should fail decryption if ciphertext or authentication tag is tampered with", () => {
      const enc = encryptField(sampleAccountNumber, masterKeyHex);

      // Alter tag
      const tamperedTag = Buffer.from("0000000000000000", "utf8").toString("base64");
      expect(() => {
        decryptField(enc.encrypted, enc.iv, tamperedTag, masterKeyHex);
      }).toThrow();
    });
  });
});
